// =========================================
// CONTROLLER: Autentikasi
// =========================================
const {
  verifyGoogleToken,
  verifyFacebookToken,
  verifyAppleToken,
} = require('../services/oauthProviders.service');
const { findOrCreateUser } = require('../services/auth.service');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  persistRefreshToken,
  revokeRefreshToken,
} = require('../services/token.service');
const { encrypt, decrypt } = require('../utils/encryption');
const { success, fail } = require('../utils/apiResponse');
const { sha256 } = require('../utils/encryption');
const User = require('../models/User');

// Opsi cookie aman untuk menyimpan refresh token terenkripsi
// httpOnly: tidak bisa diakses JS di client -> mencegah XSS mencuri token
// secure: hanya dikirim lewat HTTPS
// sameSite=strict: proteksi CSRF bawaan browser
function refreshCookieOptions(rememberMe) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30 hari jika Remember Me, else 1 hari
    path: '/api/auth',
  };
}

// Handler generik dipakai oleh ketiga provider
async function handleSocialLogin({ provider, providerData, req, res, rememberMe, deviceId }) {
  const { user, isNewUser } = await findOrCreateUser({
    provider,
    providerId: providerData.providerId,
    email: providerData.email,
    fullName: providerData.fullName,
    avatar: providerData.avatar,
    deviceId,
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await persistRefreshToken(user._id, refreshToken);

  // Refresh token dienkripsi lagi sebelum disimpan di cookie (defense-in-depth)
  const encryptedRefresh = encrypt(refreshToken);
  res.cookie('refreshToken', encryptedRefresh, refreshCookieOptions(rememberMe));

  return success(res, isNewUser ? 201 : 200, isNewUser ? 'Akun berhasil dibuat.' : 'Login berhasil.', {
    accessToken,
    isNewUser,
    user: {
      uid: user.uid,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      provider: user.provider,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  });
}

// ---------- GOOGLE ----------
exports.loginWithGoogle = async (req, res, next) => {
  try {
    const { idToken, rememberMe, deviceId } = req.body;
    if (!idToken) return fail(res, 400, 'idToken wajib diisi.', 'BAD_REQUEST');

    const providerData = await verifyGoogleToken(idToken);
    await handleSocialLogin({ provider: 'google', providerData, req, res, rememberMe, deviceId });
  } catch (err) {
    err.code = err.code || 'LOGIN_FAILED';
    err.statusCode = 401;
    next(err);
  }
};

// ---------- FACEBOOK ----------
exports.loginWithFacebook = async (req, res, next) => {
  try {
    const { accessToken, rememberMe, deviceId } = req.body;
    if (!accessToken) return fail(res, 400, 'accessToken wajib diisi.', 'BAD_REQUEST');

    const providerData = await verifyFacebookToken(accessToken);
    await handleSocialLogin({ provider: 'facebook', providerData, req, res, rememberMe, deviceId });
  } catch (err) {
    err.code = err.code || 'LOGIN_FAILED';
    err.statusCode = 401;
    next(err);
  }
};

// ---------- APPLE ----------
exports.loginWithApple = async (req, res, next) => {
  try {
    const { identityToken, fullName, rememberMe, deviceId } = req.body;
    if (!identityToken) return fail(res, 400, 'identityToken wajib diisi.', 'BAD_REQUEST');

    const providerData = await verifyAppleToken(identityToken, fullName);
    await handleSocialLogin({ provider: 'apple', providerData, req, res, rememberMe, deviceId });
  } catch (err) {
    err.code = err.code || 'LOGIN_FAILED';
    err.statusCode = 401;
    next(err);
  }
};

// ---------- REFRESH TOKEN OTOMATIS ----------
exports.refreshToken = async (req, res, next) => {
  try {
    const encryptedCookie = req.cookies.refreshToken;
    if (!encryptedCookie) {
      return fail(res, 401, 'Sesi tidak ditemukan, silakan login kembali.', 'NO_REFRESH_TOKEN');
    }

    const rawToken = decrypt(encryptedCookie);
    let decoded;
    try {
      decoded = verifyRefreshToken(rawToken);
    } catch (e) {
      return fail(res, 401, 'Sesi kedaluwarsa, silakan login kembali.', 'TOKEN_EXPIRED');
    }

    const user = await User.findOne({ uid: decoded.sub });
    if (!user || user.refreshTokenHash !== sha256(rawToken)) {
      return fail(res, 401, 'Token tidak valid.', 'INVALID_TOKEN');
    }
    if (user.status !== 'active') {
      return fail(res, 403, 'Akun ini telah dinonaktifkan.', 'ACCOUNT_DISABLED');
    }

    const newAccessToken = signAccessToken(user);
    return success(res, 200, 'Token diperbarui.', { accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
};

// ---------- LOGOUT ----------
exports.logout = async (req, res, next) => {
  try {
    const encryptedCookie = req.cookies.refreshToken;
    if (encryptedCookie) {
      try {
        const rawToken = decrypt(encryptedCookie);
        const decoded = verifyRefreshToken(rawToken);
        const user = await User.findOne({ uid: decoded.sub });
        if (user) await revokeRefreshToken(user._id);
      } catch (e) {
        // Token sudah tidak valid, tetap lanjut hapus cookie
      }
    }
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return success(res, 200, 'Logout berhasil.');
  } catch (err) {
    next(err);
  }
};

// ---------- PROFIL USER SAAT INI ----------
exports.getMe = async (req, res) => {
  const { user } = req; // ditempel oleh middleware requireAuth
  return success(res, 200, 'OK', {
    uid: user.uid,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    provider: user.provider,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  });
};
