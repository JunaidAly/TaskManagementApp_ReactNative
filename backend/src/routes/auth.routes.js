const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile, updateProfile, updatePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }),
  body('email').trim().notEmpty().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', authRateLimiter, registerValidation, register);
router.post('/login', authRateLimiter, loginValidation, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);

module.exports = router;
