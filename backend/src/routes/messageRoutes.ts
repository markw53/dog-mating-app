import express from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getUnreadCount
} from '../controllers/messageController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, getOrCreateConversation);
router.get('/conversations/:conversationId', protect, getMessages);
router.post('/send', protect, sendMessage);
router.get('/unread', protect, getUnreadCount);

export default router;