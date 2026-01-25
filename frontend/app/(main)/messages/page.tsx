'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { messagesApi } from '@/lib/api/messages';
import { Conversation, Message } from '@/types';
import { Send, User, Loader2, MessageSquare } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/formatters';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = useCallback(async () => {
    try {
      const response = await messagesApi.getConversations();
      setConversations(response.conversations);

      // Auto-select conversation from URL or first one
      const conversationId = searchParams.get('conversation');
      if (conversationId) {
        const conv = response.conversations.find(c => (c._id || c.id) === conversationId);
        if (conv) {
          setSelectedConversation(conv);
        }
      } else if (response.conversations.length > 0) {
        setSelectedConversation(response.conversations[0]);
      }
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await messagesApi.getMessages(conversationId);
      setMessages(response.messages);
      setTimeout(scrollToBottom, 100);
    } catch {
      toast.error('Failed to load messages');
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchConversations();

    // Setup Socket.io for real-time messaging
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
    socketRef.current = socket;

    socket.emit('join', user?._id || user?.id);

    socket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
      setTimeout(scrollToBottom, 100);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, router, user, fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id || selectedConversation.id);
    }
  }, [selectedConversation, fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedConversation) return;

    setSending(true);

    try {
      const otherParticipant = selectedConversation.participants.find(
        p => (p._id || p.id) !== (user?._id || user?.id)
      );

      const response = await messagesApi.sendMessage(
        selectedConversation._id || selectedConversation.id,
        messageText,
        otherParticipant!._id || otherParticipant!.id
      );

      setMessages([...messages, response.message]);
      setMessageText('');
      setTimeout(scrollToBottom, 100);

      // Emit socket event
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', {
          receiverId: otherParticipant!._id || otherParticipant!.id,
          message: response.message
        });
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(
      p => (p._id || p.id) !== (user?._id || user?.id)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 card overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Conversations</h2>
            
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => {
                  const otherUser = getOtherParticipant(conversation);
                  if (!otherUser) return null;

                  return (
                    <button
                      key={conversation._id || conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        (selectedConversation?._id || selectedConversation?.id) === (conversation._id || conversation.id)
                          ? 'bg-primary-50 border border-primary-300'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {otherUser.avatar ? (
                          <Image
                            src={otherUser.avatar}
                            alt={otherUser.firstName}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {otherUser.firstName} {otherUser.lastName}
                          </p>
                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage}
                            </p>
                          )}
                        </div>
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(conversation.lastMessageAt)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2 card flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="border-b pb-4 mb-4">
                  {(() => {
                    const otherUser = getOtherParticipant(selectedConversation);
                    if (!otherUser) return null;

                    return (
                      <div className="flex items-center space-x-3">
                        {otherUser.avatar ? (
                          <Image
                            src={otherUser.avatar}
                            alt={otherUser.firstName}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {otherUser.firstName} {otherUser.lastName}
                          </h3>
                          {otherUser.location && (
                            <p className="text-sm text-gray-500">
                              {otherUser.location.city}, {otherUser.location.state}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = (message.sender._id || message.sender.id) === (user?._id || user?.id);

                    return (
                      <div
                        key={message._id || message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                            }`}
                          >
                            {formatRelativeTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="input-field flex-1"
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="btn-primary px-6"
                  >
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}