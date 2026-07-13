// =========================================
// MIDDLEWARE: Proteksi route (memerlukan login)
// =========================================
const { verifyAccessToken } = require('../services/token.service');
const { fail } = require('../utils/apiResponse');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return fail(res, 401, 'Token tidak ditemukan, silakan login kembali.', 'NO_TOKEN');
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        return fail(res, 401, 'Sesi login sudah kedaluwarsa.', 'TOKEN_EXPIRED');
      }
      return fail(res, 401, 'Token tidak valid.', 'INVALID_TOKEN');
    }

    const user = await User.findOne({ uid: decoded.sub });
    if (!user) return fail(res, 401, 'Akun tidak ditemukan.', 'USER_NOT_FOUND');
    if (user.status !== 'active') {
      return fail(res, 403, 'Akun ini telah dinonaktifkan.', 'ACCOUNT_DISABLED');
    }

    req.user = user; // Tempel data user ke request untuk controller berikutnya
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware tambahan: hanya admin yang boleh akses
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return fail(res, 403, 'Akses ditolak. Khusus admin.', 'FORBIDDEN');
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
