// routes/matchingRoutes.ts
import { Router } from 'express';
import { findMatches, getMatchStats } from '../controllers/matchingController';
import { protect } from '../middleware/auth';

const router = Router();

// Test route WITHOUT auth - to verify route mounting
router.get('/test', (req, res) => {
  console.log('✅ Test route hit!');
  res.json({ 
    success: true, 
    message: 'Matching routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Logging middleware for all routes
router.use((req, res, next) => {
  console.log('🎯 Matching route middleware:');
  console.log('   Method:', req.method);
  console.log('   Path:', req.path);
  console.log('   Full URL:', req.originalUrl);
  console.log('   Params:', req.params);
  console.log('   Query:', req.query);
  console.log('   Auth header:', req.headers.authorization ? 'Present' : 'Missing');
  next();
});

// Apply auth middleware to protected routes
router.use(protect);

// Protected routes
router.get('/:dogId/stats', getMatchStats);
router.get('/:dogId/matches', findMatches);

console.log('✅ Matching routes module loaded');

export default router;