import express from 'express';
import {
  createDog,
  getAllDogs,
  getDogById,
  updateDog,
  deleteDog,
  getMyDogs,
  searchNearby
} from '../controllers/dogController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.get('/', getAllDogs);
router.get('/my-dogs', protect, getMyDogs);
router.get('/nearby', searchNearby);
router.get('/:id', getDogById);
router.post('/', protect, upload.array('images', 10), createDog);
router.put('/:id', protect, upload.array('images', 10), updateDog);
router.delete('/:id', protect, deleteDog);

export default router;