import express from 'express';
import { getPushConfig, subscribe, unsubscribe } from '../controllers/pushController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.get('/config', getPushConfig);
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

export default router;
