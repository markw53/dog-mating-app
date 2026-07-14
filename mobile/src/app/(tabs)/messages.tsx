import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { messagesApi } from '@/lib/api/messages';
import { useAuthStore } from '@/lib/store/authStore';
import { Conversation } from '@/lib/types';
import { colors } from '@/constants/colors';

export default function MessagesScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await messagesApi.getConversations();
      setConversations(data.conversations);
    } catch {
      // Pull-to-refresh retries
    }
  }, []);

  // Refresh whenever the tab regains focus so previews stay current
  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const otherParticipant = (conversation: Conversation) =>
    conversation.participants.find((p) => p.id !== user?.id);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary600} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={conversations.length === 0 ? { flex: 1 } : undefined}
      data={conversations}
      keyExtractor={(c) => c.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary600}
        />
      }
      renderItem={({ item }) => {
        const other = otherParticipant(item);
        if (!other) return null;
        return (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/chat/${item.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {other.firstName[0]}
                {other.lastName[0]}
              </Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowName}>
                {other.firstName} {other.lastName}
              </Text>
              <Text style={styles.rowPreview} numberOfLines={1}>
                {item.lastMessage || 'No messages yet'}
              </Text>
            </View>
            {item.dog && <Text style={styles.dogTag}>🐕 {item.dog.name}</Text>}
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <View style={styles.center}>
          <Ionicons name="chatbubbles-outline" size={48} color={colors.gray400} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptyText}>Message a dog owner from their listing</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: colors.gray600, marginTop: 8 },
  emptyText: { fontSize: 14, color: colors.gray400 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary700, fontWeight: '700' },
  rowBody: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: '600', color: colors.gray900 },
  rowPreview: { fontSize: 14, color: colors.gray500, marginTop: 2 },
  dogTag: { fontSize: 12, color: colors.gray500 },
});
