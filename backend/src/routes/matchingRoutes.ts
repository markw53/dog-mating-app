import { Router } from 'express';
import { findMatches, getMatchStats } from '../controllers/matchingController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/:dogId/stats', getMatchStats);
router.get('/:dogId/matches', findMatches);

export default router;
