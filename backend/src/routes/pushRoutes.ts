import express from 'express';
import {
  getPushConfig,
  subscribe,
  unsubscribe,
  registerDeviceToken,
  removeDeviceToken,
} from '../controllers/pushController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.get('/config', getPushConfig);
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.post('/device-token', registerDeviceToken);
router.post('/device-token/remove', removeDeviceToken);

export default router;
