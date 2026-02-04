// routes/messageRoutes.ts
import express from 'express';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  createConversation,
  markAsRead 
} from '../controllers/messageController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All message routes require authentication
router.use(protect);

// Conversations
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);

// Messages in a conversation
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.put('/conversations/:conversationId/read', markAsRead);

console.log('✅ Message routes loaded');

export default router;