import express from 'express';
import { findMatches, getMatchStats } from '../controllers/matchingController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/:dogId/matches', findMatches);
router.get('/:dogId/stats', getMatchStats);

export default router;