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
import { Image } from 'expo-image';
import { useRouter, useFocusEffect, Stack, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { dogsApi } from '@/lib/api/dogs';
import { Dog } from '@/lib/types';
import { colors } from '@/constants/colors';

// Owners see all their listings here regardless of approval status —
// the only mobile route to a PENDING dog's detail/edit screens
export default function MyDogsScreen() {
  const router = useRouter();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await dogsApi.getMyDogs();
      setDogs(data.dogs);
    } catch {
      // Pull-to-refresh retries
    }
  }, []);

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

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Dogs',
          headerRight: () => (
            <Link href="/add-dog" asChild>
              <TouchableOpacity hitSlop={8}>
                <Ionicons name="add-circle" size={26} color={colors.primary600} />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary600} />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={dogs.length === 0 ? { flex: 1 } : styles.listContent}
          data={dogs}
          keyExtractor={(dog) => dog.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary600}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push(`/dog/${item.id}`)}
              activeOpacity={0.7}
            >
              {item.mainImage || item.images?.[0] ? (
                <Image
                  source={{ uri: item.mainImage || item.images![0] }}
                  style={styles.thumb}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Text style={{ fontSize: 22 }}>🐕</Text>
                </View>
              )}
              <View style={styles.rowBody}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowMeta}>{item.breed}</Text>
                <StatusBadge status={String(item.status).toUpperCase()} />
              </View>
              <View style={styles.rowRight}>
                {item.views != null && (
                  <Text style={styles.views}>
                    <Ionicons name="eye-outline" size={12} color={colors.gray400} /> {item.views}
                  </Text>
                )}
                <Ionicons name="chevron-forward" size={18} color={colors.gray400} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 48 }}>🐾</Text>
              <Text style={styles.emptyTitle}>No dogs listed yet</Text>
              <Text style={styles.emptyText}>
                Add your dog to start finding breeding matches.
              </Text>
              <Link href="/add-dog" asChild>
                <TouchableOpacity style={styles.emptyButton}>
                  <Text style={styles.emptyButtonText}>Add Your Dog</Text>
                </TouchableOpacity>
              </Link>
            </View>
          }
        />
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config =
    status === 'ACTIVE'
      ? { label: 'Live', bg: '#dcfce7', fg: '#15803d' }
      : status === 'PENDING'
        ? { label: 'Awaiting approval', bg: '#fef9c3', fg: '#a16207' }
        : { label: 'Not listed', bg: colors.gray100, fg: colors.gray500 };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.fg }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.white },
  listContent: { paddingVertical: 4 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 6,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.gray600, marginTop: 8 },
  emptyText: { fontSize: 14, color: colors.gray500, textAlign: 'center' },
  emptyButton: {
    backgroundColor: colors.primary600,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 16,
  },
  emptyButtonText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  thumb: { width: 64, height: 64, borderRadius: 12 },
  thumbPlaceholder: {
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: 2 },
  rowName: { fontSize: 16, fontWeight: '600', color: colors.gray900 },
  rowMeta: { fontSize: 13, color: colors.gray500 },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  rowRight: { alignItems: 'flex-end', gap: 6 },
  views: { fontSize: 12, color: colors.gray400 },
});
