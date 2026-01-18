import { apiClient } from './client';
import { Conversation, Message } from '@/types';

export const messagesApi = {
  getConversations: async (): Promise<{ success: boolean; conversations: Conversation[] }> => {
    const response = await apiClient.get('/messages/conversations');
    return response.data;
  },

  getOrCreateConversation: async (recipientId: string, dogId?: string): Promise<{ success: boolean; conversation: Conversation }> => {
    const response = await apiClient.post('/messages/conversations', { recipientId, dogId });
    return response.data;
  },

  getMessages: async (conversationId: string): Promise<{ success: boolean; messages: Message[] }> => {
    const response = await apiClient.get(`/messages/conversations/${conversationId}`);
    return response.data;
  },

  sendMessage: async (conversationId: string, content: string, receiverId: string): Promise<{ success: boolean; message: Message }> => {
    const response = await apiClient.post('/messages/send', {
      conversationId,
      content,
      receiverId,
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<{ success: boolean; count: number }> => {
    const response = await apiClient.get('/messages/unread');
    return response.data;
  },
};