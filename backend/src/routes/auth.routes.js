// =========================================
// ROUTES: /api/auth/*
// =========================================
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

router.post('/google', loginLimiter, authController.loginWithGoogle);
router.post('/facebook', loginLimiter, authController.loginWithFacebook);
router.post('/apple', loginLimiter, authController.loginWithApple);

router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

router.get('/me', requireAuth, authController.getMe);

module.exports = router;
