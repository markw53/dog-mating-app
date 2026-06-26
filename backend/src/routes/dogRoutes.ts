import express from 'express';
import {
  createDog, getAllDogs, getDogById,
  updateDog, deleteDog, getMyDogs, uploadDogImages,
} from '../controllers/dogController';
import { protect } from '../middleware/auth';
import upload from '../middleware/upload';
import { validateCreateDog, handleValidation } from '../middleware/validate';

const router = express.Router();

router.get('/', getAllDogs);
router.get('/my-dogs', protect, getMyDogs);
router.post('/', protect, validateCreateDog, handleValidation, createDog);
router.put('/:id', protect, updateDog);
router.delete('/:id', protect, deleteDog);
router.post('/:id/images', protect, upload.array('images', 10), uploadDogImages);
router.get('/:id', getDogById);

export default router;
