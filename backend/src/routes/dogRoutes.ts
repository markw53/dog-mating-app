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

router.get('/', getAllDogs);
router.get('/:id', getDogById);

router.use(protect); // Protect all routes below this line

router.get('/my-dogs', getMyDogs);
// router.get('/nearby', searchNearby);

router.post('/', createDog);
router.put('/:id', updateDog);
router.delete('/:id', deleteDog);
router.post('/:id/images', upload.array('images', 10), uploadDogImages);

export default router;