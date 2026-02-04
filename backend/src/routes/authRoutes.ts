// routes/authRoutes.ts
import express from 'express';
import { 
  login, 
  register, 
  getCurrentUser, 
  updateProfile,
  uploadAvatar 
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import upload from '../middleware/upload'; // Make sure you have this

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

console.log('✅ Auth routes loaded');

export default router;