'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { messagesApi } from '@/lib/api/messages';
import { getImageUrl } from '@/lib/api/client';
import { Conversation, Message } from '@/types';
import { 
  Send, User, Loader2, MessageSquare, Clock, 
  CheckCircle, Search, MoreVertical 
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
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
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = useCallback(async () => {
    try {
      const response = await messagesApi.getConversations();
      setConversations(response.conversations);

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

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherParticipant(conv);
    if (!otherUser) return false;
    const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <Section variant="primary" className="py-12 md:py-16">
        <div className="text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <span className="text-white font-semibold text-sm">💬 Messaging Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Your Messages
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            Connect with dog owners and breeders
          </p>
        </div>
      </Section>

      {/* Main Content */}
      <section className="py-8 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card hover={false} className="h-full flex flex-col">
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    Conversations ({filteredConversations.length})
                  </h2>
                </div>
                
                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium mb-2">
                        {searchQuery ? 'No conversations found' : 'No conversations yet'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {searchQuery ? 'Try a different search' : 'Start browsing dogs to connect with owners'}
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => {
                      const otherUser = getOtherParticipant(conversation);
                      if (!otherUser) return null;

                      const isSelected = (selectedConversation?._id || selectedConversation?.id) === (conversation._id || conversation.id);

                      return (
                        <button
                          key={conversation._id || conversation.id}
                          onClick={() => setSelectedConversation(conversation)}
                          className={`w-full text-left p-4 rounded-xl transition-all group ${
                            isSelected
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                              : 'hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              {otherUser.avatar ? (
                                <Image
                                  src={getImageUrl(otherUser.avatar)}
                                  alt={otherUser.firstName}
                                  width={48}
                                  height={48}
                                  className="rounded-full border-2 border-white"
                                  unoptimized
                                />
                              ) : (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                                  isSelected 
                                    ? 'bg-white/20 border-white' 
                                    : 'bg-gradient-to-br from-primary-100 to-primary-200 border-primary-300'
                                }`}>
                                  <User className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-primary-600'}`} />
                                </div>
                              )}
                              {otherUser.verified && (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                                  <CheckCircle className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-bold truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                {otherUser.firstName} {otherUser.lastName}
                              </p>
                              {conversation.lastMessage && (
                                <p className={`text-sm truncate ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                  {conversation.lastMessage}
                                </p>
                              )}
                            </div>
                            {conversation.lastMessageAt && (
                              <div className="flex flex-col items-end">
                                <span className={`text-xs flex items-center ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatRelativeTime(conversation.lastMessageAt)}
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </Card>
            </div>

            {/* Messages Area */}
            <div className="lg:col-span-2">
              <Card hover={false} className="h-full flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="border-b border-gray-200 pb-4 mb-4">
                      {(() => {
                        const otherUser = getOtherParticipant(selectedConversation);
                        if (!otherUser) return null;

                        return (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {otherUser.avatar ? (
                                <Image
                                  src={getImageUrl(otherUser.avatar)}
                                  alt={otherUser.firstName}
                                  width={56}
                                  height={56}
                                  className="rounded-full border-2 border-gray-200"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center border-2 border-gray-200">
                                  <User className="h-7 w-7 text-primary-600" />
                                </div>
                              )}
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-bold text-xl text-gray-900">
                                    {otherUser.firstName} {otherUser.lastName}
                                  </h3>
                                  {otherUser.verified && (
                                    <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                                  )}
                                </div>
                                {otherUser.location && (
                                  <p className="text-sm text-gray-500">
                                    {otherUser.location.city}, {otherUser.location.county}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical className="h-5 w-5 text-gray-600" />
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <MessageSquare className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No messages yet</p>
                            <p className="text-gray-400 text-sm">Start the conversation!</p>
                          </div>
                        </div>
                      ) : (
                        messages.map((message, index) => {
                          const isOwnMessage = (message.sender._id || message.sender.id) === (user?._id || user?.id);
                          const showAvatar = index === 0 || 
                            ((messages[index - 1].sender._id || messages[index - 1].sender.id) !== (message.sender._id || message.sender.id));

                          return (
                            <div
                              key={message._id || message.id}
                              className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              {!isOwnMessage && showAvatar && (
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="h-4 w-4 text-primary-600" />
                                </div>
                              )}
                              {!isOwnMessage && !showAvatar && <div className="w-8" />}
                              
                              <div
                                className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-sm ${
                                  isOwnMessage
                                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                }`}
                              >
                                <p className="text-sm leading-relaxed">{message.content}</p>
                                <p
                                  className={`text-xs mt-1 flex items-center ${
                                    isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                                  }`}
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatRelativeTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !messageText.trim()}
                        className="btn-primary px-6 py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
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
                      <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="h-12 w-12 text-primary-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Select a Conversation
                      </h3>
                      <p className="text-gray-500">
                        Choose a conversation from the list to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}