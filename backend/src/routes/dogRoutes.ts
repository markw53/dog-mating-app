import express from 'express';
import {
  createDog,
  getAllDogs,
  getDogById,
  updateDog,
  deleteDog,
  getMyDogs,
  uploadDogImages,
} from '../controllers/dogController';
import { protect } from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

// ============ PUBLIC ROUTES ============
router.get('/', getAllDogs);

// ============ PROTECTED ROUTES ============
// These specific routes MUST come before /:id
router.get('/my-dogs', protect, getMyDogs);
router.post('/', protect, createDog);
router.put('/:id', protect, updateDog);
router.delete('/:id', protect, deleteDog);
router.post('/:id/images', protect, upload.array('images', 10), uploadDogImages);

// ============ PUBLIC - MUST BE LAST ============
// /:id route matches anything, so it must be last
router.get('/:id', getDogById);

export default router;