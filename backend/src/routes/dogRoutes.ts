import express from 'express';
import {
  createDog,
  getAllDogs,
  getDogById,
  updateDog,
  deleteDog,
  getMyDogs,
  searchNearby,
 } from '../controllers/dogController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.get('/', getAllDogs);
router.get('/:id', getDogById);

router.use(protect); // Protect all routes below this line

router.get('/my-dogs', getMyDogs);
router.get('/nearby', searchNearby);

router.post('/', upload.array('images', 10), createDog);
router.put('/:id', upload.array('images', 10), updateDog);
router.delete('/:id', deleteDog);

export default router;