// app/(main)/messages/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useFetch } from '@/lib/hooks/useFetch';
import { messagesApi } from '@/lib/api/messages';
import { getImageUrl } from '@/lib/api/client';
import { Conversation, Message, ConversationsResponse } from '@/types';
import {
  Send,
  User,
  Loader2,
  MessageSquare,
  Clock,
  CheckCircle,
  Search,
  MoreVertical,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

export default function MessagesPage() {
  const searchParams = useSearchParams();

  // Auth hook - handles redirect automatically if not authenticated
  const { user, loading: authLoading, isAuthorized } = useRequireAuth();

  // Local state
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Get user ID safely
  const userId = useMemo(() => {
    return user?._id || user?.id || '';
  }, [user]);

  // Fetch conversations using useFetch
  const {
    data: conversationsData,
    loading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useFetch<ConversationsResponse>(
    () => messagesApi.getConversations(),
    [isAuthorized],
    {
      onSuccess: (data) => {
        // Auto-select conversation from URL or first one
        const conversationId = searchParams.get('conversation');
        if (conversationId) {
          const conv = data.conversations.find(
            (c) => (c._id || c.id) === conversationId
          );
          if (conv) {
            setSelectedConversation(conv);
            return;
          }
        }
        if (data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(data.conversations[0]);
        }
      },
      onError: () => {
        toast.error('Failed to load conversations');
      },
    }
  );

  // Memoize conversations to prevent unnecessary re-renders
  const conversations = useMemo(() => {
    return conversationsData?.conversations ?? [];
  }, [conversationsData?.conversations]);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(
    async (conversationId: string) => {
      setMessagesLoading(true);
      try {
        const response = await messagesApi.getMessages(conversationId);
        setMessages(response.messages);
        setTimeout(scrollToBottom, 100);
      } catch {
        toast.error('Failed to load messages');
      } finally {
        setMessagesLoading(false);
      }
    },
    [scrollToBottom]
  );

  // Initialize socket connection when authorized
  useEffect(() => {
    if (!isAuthorized || !user) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    if (userId) {
      socket.emit('join', userId);
    }

    socket.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(scrollToBottom, 100);

      // Optionally refetch conversations to update lastMessage
      refetchConversations();
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthorized, user, userId, scrollToBottom, refetchConversations]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      const conversationId = selectedConversation._id || selectedConversation.id;
      fetchMessages(conversationId);
    }
  }, [selectedConversation, fetchMessages]);

  // Get other participant in conversation
  const getOtherParticipant = useCallback(
    (conversation: Conversation) => {
      return conversation.participants.find((p) => (p._id || p.id) !== userId);
    },
    [userId]
  );

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!debouncedSearch) return conversations;

    return conversations.filter((conv) => {
      const otherUser = getOtherParticipant(conv);
      if (!otherUser) return false;

      const fullName =
        `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
      return fullName.includes(debouncedSearch.toLowerCase());
    });
  }, [conversations, debouncedSearch, getOtherParticipant]);

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedConversation || !user) return;

    setSending(true);

    try {
      const otherParticipant = getOtherParticipant(selectedConversation);

      if (!otherParticipant) {
        toast.error('Could not find recipient');
        return;
      }

      const conversationId = selectedConversation._id || selectedConversation.id;
      const receiverId = otherParticipant._id || otherParticipant.id;

      const response = await messagesApi.sendMessage(
        conversationId,
        messageText,
        receiverId
      );

      setMessages((prev) => [...prev, response.message]);
      setMessageText('');
      setTimeout(scrollToBottom, 100);

      // Emit socket event
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', {
          receiverId,
          message: response.message,
        });
      }

      // Refetch conversations to update lastMessage
      refetchConversations();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Loading: Auth check
  if (authLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Not authorized - redirect handled by useRequireAuth
  if (!isAuthorized) {
    return <LoadingScreen message="Redirecting to login..." />;
  }

  // Loading: Conversations
  if (conversationsLoading) {
    return <LoadingScreen message="Loading messages..." />;
  }

  // Error: Failed to load conversations
  if (conversationsError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <Card className="text-center py-12 px-8 max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Failed to Load Messages
          </h2>
          <p className="text-gray-600 mb-6">
            There was an error loading your conversations. Please try again.
          </p>
          <button onClick={refetchConversations} className="btn-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <Section variant="primary" className="py-12 md:py-16">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <span className="text-white font-semibold text-sm">
                💬 Messaging Center
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Your Messages
            </h1>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">
              Connect with dog owners and breeders
            </p>
          </div>
          <button
            onClick={refetchConversations}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Refresh conversations"
          >
            <RefreshCw
              className={`h-5 w-5 ${conversationsLoading ? 'animate-spin' : ''}`}
            />
          </button>
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
                    <EmptyConversations hasSearch={!!searchQuery} />
                  ) : (
                    filteredConversations.map((conversation) => (
                      <ConversationItem
                        key={conversation._id || conversation.id}
                        conversation={conversation}
                        isSelected={
                          (selectedConversation?._id || selectedConversation?.id) ===
                          (conversation._id || conversation.id)
                        }
                        otherUser={getOtherParticipant(conversation)}
                        onSelect={() => setSelectedConversation(conversation)}
                      />
                    ))
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
                    <ChatHeader
                      otherUser={getOtherParticipant(selectedConversation)}
                    />

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2">
                      {messagesLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">
                              Loading messages...
                            </p>
                          </div>
                        </div>
                      ) : messages.length === 0 ? (
                        <EmptyMessages />
                      ) : (
                        messages.map((message, index) => (
                          <MessageBubble
                            key={message._id || message.id}
                            message={message}
                            isOwnMessage={
                              (message.sender._id || message.sender.id) === userId
                            }
                            showAvatar={
                              index === 0 ||
                              (messages[index - 1].sender._id ||
                                messages[index - 1].sender.id) !==
                                (message.sender._id || message.sender.id)
                            }
                          />
                        ))
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
                  <NoConversationSelected />
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============ Helper Components ============

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

function EmptyConversations({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <MessageSquare className="h-10 w-10 text-gray-400" />
      </div>
      <p className="text-gray-500 font-medium mb-2">
        {hasSearch ? 'No conversations found' : 'No conversations yet'}
      </p>
      <p className="text-gray-400 text-sm">
        {hasSearch
          ? 'Try a different search'
          : 'Start browsing dogs to connect with owners'}
      </p>
    </div>
  );
}

function ConversationItem({
  conversation,
  isSelected,
  otherUser,
  onSelect,
}: {
  conversation: Conversation;
  isSelected: boolean;
  otherUser: Conversation['participants'][0] | undefined;
  onSelect: () => void;
}) {
  if (!otherUser) return null;

  return (
    <button
      onClick={onSelect}
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
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                isSelected
                  ? 'bg-white/20 border-white'
                  : 'bg-gradient-to-br from-primary-100 to-primary-200 border-primary-300'
              }`}
            >
              <User
                className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-primary-600'}`}
              />
            </div>
          )}
          {otherUser.verified && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`font-bold truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}
          >
            {otherUser.firstName} {otherUser.lastName}
          </p>
          {conversation.lastMessage && (
            <p
              className={`text-sm truncate ${isSelected ? 'text-white/80' : 'text-gray-500'}`}
            >
              {conversation.lastMessage}
            </p>
          )}
        </div>
        {conversation.lastMessageAt && (
          <div className="flex flex-col items-end">
            <span
              className={`text-xs flex items-center ${isSelected ? 'text-white/80' : 'text-gray-400'}`}
            >
              <Clock className="h-3 w-3 mr-1" />
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

function ChatHeader({
  otherUser,
}: {
  otherUser: Conversation['participants'][0] | undefined;
}) {
  if (!otherUser) return null;

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
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
            {(otherUser.location || otherUser.city) && (
              <p className="text-sm text-gray-500">
                {otherUser.location?.city || otherUser.city}
                {(otherUser.location?.state || otherUser.county) &&
                  `, ${otherUser.location?.state || otherUser.county}`}
              </p>
            )}
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

function EmptyMessages() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-10 w-10 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No messages yet</p>
        <p className="text-gray-400 text-sm">Start the conversation!</p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isOwnMessage,
  showAvatar,
}: {
  message: Message;
  isOwnMessage: boolean;
  showAvatar: boolean;
}) {
  return (
    <div
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
}

function NoConversationSelected() {
  return (
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
  );
}