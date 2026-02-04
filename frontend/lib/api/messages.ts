// lib/api/messages.ts
import { apiClient } from './client';
import { 
  Conversation, 
  ConversationsResponse, 
  MessagesResponse, 
  SendMessageResponse 
} from '@/types';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
}

export const messagesApi = {
  getConversations: async (): Promise<ConversationsResponse> => {
    try {
      const response = await apiClient.get<ConversationsResponse>('/messages/conversations');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('Get conversations error:', error.response?.data);
      throw error;
    }
  },

  getMessages: async (conversationId: string): Promise<MessagesResponse> => {
    try {
      const response = await apiClient.get<MessagesResponse>(
        `/messages/conversations/${conversationId}/messages`
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('Get messages error:', error.response?.data);
      throw error;
    }
  },

  sendMessage: async (
    conversationId: string,
    content: string,
    receiverId: string
  ): Promise<SendMessageResponse> => {
    try {
      const response = await apiClient.post<SendMessageResponse>(
        `/messages/conversations/${conversationId}/messages`,
        { content, receiverId }
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('Send message error:', error.response?.data);
      throw error;
    }
  },

  createConversation: async (
    participantId: string,
    dogId?: string,
    initialMessage?: string
  ): Promise<{ success: boolean; conversation: Conversation }> => {
    try {
      const response = await apiClient.post<{ success: boolean; conversation: Conversation }>(
        '/messages/conversations',
        { participantId, dogId, initialMessage }
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('Create conversation error:', error.response?.data);
      throw error;
    }
  },

  markAsRead: async (conversationId: string): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.put<{ success: boolean }>(
        `/messages/conversations/${conversationId}/read`
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('Mark as read error:', error.response?.data);
      throw error;
    }
  },
};