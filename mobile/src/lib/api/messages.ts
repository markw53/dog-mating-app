import apiClient from './client';
import { Conversation, Message } from '../types';

export const messagesApi = {
  getConversations: async () => {
    const { data } = await apiClient.get<{
      success: boolean;
      conversations: Conversation[];
      total: number;
    }>('/messages/conversations');
    return data;
  },

  getMessages: async (conversationId: string) => {
    const { data } = await apiClient.get<{
      success: boolean;
      messages: Message[];
      total: number;
    }>(`/messages/conversations/${conversationId}/messages`);
    return data;
  },

  sendMessage: async (conversationId: string, content: string, receiverId: string) => {
    const { data } = await apiClient.post<{ success: boolean; message: Message }>(
      `/messages/conversations/${conversationId}/messages`,
      { content, receiverId },
    );
    return data;
  },

  createConversation: async (participantId: string, dogId?: string) => {
    const { data } = await apiClient.post<{ success: boolean; conversation: Conversation }>(
      '/messages/conversations',
      { participantId, dogId },
    );
    return data;
  },

  markAsRead: async (conversationId: string) => {
    const { data } = await apiClient.put<{ success: boolean }>(
      `/messages/conversations/${conversationId}/read`,
    );
    return data;
  },
};
