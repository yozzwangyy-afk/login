// =========================================
// ROUTES: /api/user/* (contoh halaman terproteksi)
// =========================================
const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');
const { success } = require('../utils/apiResponse');

// Contoh route yang butuh login
router.get('/dashboard', requireAuth, (req, res) => {
  success(res, 200, `Selamat datang, ${req.user.fullName}!`, { user: req.user.fullName });
});

// Contoh route khusus admin
router.get('/admin-area', requireAuth, requireAdmin, (req, res) => {
  success(res, 200, 'Selamat datang di area admin.');
});

module.exports = router;
