import express from 'express';
import { login, register, getCurrentUser, updateProfile, uploadAvatar } from '../controllers/authController';
import { protect } from '../middleware/auth';
import upload from '../middleware/upload';
import { validateRegister, validateLogin, handleValidation } from '../middleware/validate';

const router = express.Router();

router.post('/login', validateLogin, handleValidation, login);
router.post('/register', validateRegister, handleValidation, register);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;
