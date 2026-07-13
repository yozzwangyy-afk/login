// =========================================
// MIDDLEWARE: Global Error Handler
// =========================================
const { fail } = require('../utils/apiResponse');

// Peta kode error internal -> pesan yang aman ditampilkan ke user
const ERROR_MESSAGES = {
  ACCOUNT_DISABLED: 'Akun Anda telah dinonaktifkan. Hubungi admin.',
  PROVIDER_UNAVAILABLE: 'Provider login sedang tidak tersedia.',
  TOO_MANY_ATTEMPTS: 'Terlalu banyak percobaan login. Coba lagi nanti.',
};

function notFoundHandler(req, res) {
  return fail(res, 404, 'Endpoint tidak ditemukan.', 'NOT_FOUND');
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message);

  const code = err.code || 'SERVER_ERROR';
  const message = ERROR_MESSAGES[code] || 'Terjadi kesalahan pada server. Coba lagi nanti.';
  const statusCode = err.statusCode || 500;

  return fail(res, statusCode, message, code);
}

module.exports = { notFoundHandler, errorHandler };
