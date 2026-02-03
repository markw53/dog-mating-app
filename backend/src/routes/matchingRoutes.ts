// routes/matchingRoutes.ts
import { Router } from 'express';
import { findMatches, getMatchStats } from '../controllers/matchingController';
import { protect } from '../middleware/auth';

const router = Router();

// Logging middleware
router.use((req, res, next) => {
  console.log('🎯 Matching route hit:');
  console.log('   Method:', req.method);
  console.log('   Path:', req.path);
  console.log('   Params:', req.params);
  console.log('   Query:', req.query);
  console.log('   Auth header:', req.headers.authorization ? 'Present' : 'Missing');
  next();
});

// Apply auth middleware
router.use(protect);

// Routes - make sure they're in this order
router.get('/:dogId/stats', getMatchStats);
router.get('/:dogId/matches', findMatches);

console.log('✅ Matching routes initialized');

export default router;