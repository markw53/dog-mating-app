import express from 'express';
import {
  login, register, getCurrentUser, updateProfile, uploadAvatar,
  forgotPassword, resetPassword,
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import upload from '../middleware/upload';
import { authLimiter } from '../middleware/rateLimits';
import { validateRegister, validateLogin, handleValidation } from '../middleware/validate';

const router = express.Router();

// Credential endpoints get the strict brute-force limiter; authenticated
// routes below run under the general API limit applied in server.ts
router.post('/login', authLimiter, validateLogin, handleValidation, login);
router.post('/register', authLimiter, validateRegister, handleValidation, register);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;
