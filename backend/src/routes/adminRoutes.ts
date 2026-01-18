import express from 'express';
import {
  getPendingDogs,
  approveDog,
  rejectDog,
  getAllUsers,
  getStats
} from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require admin authorization
router.use(protect, authorize('admin'));

router.get('/dogs/pending', getPendingDogs);
router.put('/dogs/:id/approve', approveDog);
router.put('/dogs/:id/reject', rejectDog);
router.get('/users', getAllUsers);
router.get('/stats', getStats);

export default router;