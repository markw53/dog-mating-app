import express from 'express';
import {
  getConversations, getMessages, sendMessage,
  createConversation, markAsRead,
} from '../controllers/messageController';
import { protect } from '../middleware/auth';
import { validateMessage, handleValidation } from '../middleware/validate';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', validateMessage, handleValidation, sendMessage);
router.put('/conversations/:conversationId/read', markAsRead);

export default router;
