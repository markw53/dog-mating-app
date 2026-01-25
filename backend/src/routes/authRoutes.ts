import express from 'express';
import { register, login, getMe, updateProfile, uploadAvatar } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;