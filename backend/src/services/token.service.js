// =========================================
// SERVICE: Token (JWT Access + Refresh)
// =========================================
const jwt = require('jsonwebtoken');
const { sha256 } = require('../utils/encryption');
const User = require('../models/User');

// Buat access token (umur pendek, dipakai di header Authorization)
function signAccessToken(user) {
  return jwt.sign(
    { sub: user.uid, role: user.role, provider: user.provider },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES }
  );
}

// Buat refresh token (umur panjang, dipakai untuk Auto Login / Remember Me)
function signRefreshToken(user) {
  return jwt.sign({ sub: user.uid }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

// Simpan hash refresh token di DB (bukan token asli) supaya bisa di-revoke
// dan tidak bisa dipakai ulang jika DB bocor.
async function persistRefreshToken(userId, refreshToken) {
  await User.findByIdAndUpdate(userId, {
    refreshTokenHash: sha256(refreshToken),
  });
}

// Hapus refresh token saat logout
async function revokeRefreshToken(userId) {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  persistRefreshToken,
  revokeRefreshToken,
};
