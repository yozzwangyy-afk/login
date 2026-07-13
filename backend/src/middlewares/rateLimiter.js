// =========================================
// MIDDLEWARE: Rate Limiter untuk endpoint login
// =========================================
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 20, // maksimal 20 percobaan login per IP per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
      errorCode: 'TOO_MANY_ATTEMPTS',
    });
  },
});

module.exports = { loginLimiter };
