import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { messagesApi } from '@/lib/api/messages';
import { TOKEN_KEY, getSocketUrl } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';
import { Message } from '@/lib/types';
import { colors } from '@/constants/colors';

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  const socketRef = useRef<Socket | null>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    messagesApi
      .getMessages(conversationId)
      .then((data) => {
        setMessages(data.messages);
        scrollToEnd();
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    void messagesApi.markAsRead(conversationId).catch(() => {});

    // Live updates for this conversation
    let socket: Socket | undefined;
    void SecureStore.getItemAsync(TOKEN_KEY).then((token) => {
      if (!token) return;
      socket = io(getSocketUrl(), { transports: ['websocket'], auth: { token } });
      socketRef.current = socket;
      socket.on('newMessage', (message: Message) => {
        if (message.conversationId === conversationId) {
          setMessages((prev) => [...prev, message]);
          scrollToEnd();
        }
      });
    });

    return () => {
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [conversationId, scrollToEnd]);

  const otherName =
    messages.find((m) => m.sender.id !== user?.id)?.sender.firstName ?? 'Chat';

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending || !conversationId) return;

    const receiver = messages.find((m) => m.sender.id !== user?.id)?.sender;
    if (!receiver) return;

    setSending(true);
    try {
      const data = await messagesApi.sendMessage(conversationId, content, receiver.id);
      setMessages((prev) => [...prev, data.message]);
      setText('');
      scrollToEnd();
    } catch {
      // Keep the text in the input so the user can retry
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: otherName }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary600} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => {
              const mine = item.sender.id === user?.id;
              return (
                <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                  <Text style={mine ? styles.mineText : styles.theirsText}>{item.content}</Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>Say hello 👋</Text>
              </View>
            }
          />
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.gray400}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!text.trim() || sending) && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyText: { color: colors.gray400, fontSize: 15 },
  list: { flex: 1 },
  listContent: { padding: 16, gap: 8 },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary600,
    borderBottomRightRadius: 4,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray100,
    borderBottomLeftRadius: 4,
  },
  mineText: { color: colors.white, fontSize: 15, lineHeight: 21 },
  theirsText: { color: colors.gray900, fontSize: 15, lineHeight: 21 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray200,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    color: colors.gray900,
  },
  sendButton: {
    backgroundColor: colors.primary600,
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
