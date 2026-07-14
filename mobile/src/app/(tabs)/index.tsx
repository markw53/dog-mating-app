import { useCallback, useEffect, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { dogsApi } from '@/lib/api/dogs';
import { Dog } from '@/lib/types';
import { colors } from '@/constants/colors';

const PAGE_SIZE = 12;

export default function BrowseScreen() {
  const router = useRouter();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (pageToLoad: number, replace: boolean) => {
    try {
      const data = await dogsApi.getAll({ page: pageToLoad, limit: PAGE_SIZE });
      setDogs((prev) => (replace ? data.dogs : [...prev, ...data.dogs]));
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch {
      // Keep whatever is on screen; pull-to-refresh retries
    }
  }, []);

  useEffect(() => {
    load(1, true).finally(() => setLoading(false));
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load(1, true);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || loading || page >= totalPages) return;
    setLoadingMore(true);
    await load(page + 1, false);
    setLoadingMore(false);
  };

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
      contentContainerStyle={styles.listContent}
      data={dogs}
      keyExtractor={(dog) => dog.id}
      renderItem={({ item }) => <DogCard dog={item} onPress={() => router.push(`/dog/${item.id}`)} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary600}
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No dogs listed yet</Text>
          <Text style={styles.emptyText}>Pull down to refresh</Text>
        </View>
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary600} />
        ) : null
      }
    />
  );
}

function DogCard({ dog, onPress }: { dog: Dog; onPress: () => void }) {
  const imageUrl = dog.mainImage || dog.images?.[0];
  const gender = String(dog.gender).toUpperCase();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" transition={150} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ fontSize: 40 }}>🐕</Text>
          </View>
        )}
        <View style={[styles.genderBadge, gender === 'FEMALE' ? styles.female : styles.male]}>
          <Ionicons name={gender === 'FEMALE' ? 'female' : 'male'} size={14} color={colors.white} />
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.name}>{dog.name}</Text>
        <Text style={styles.breed}>{dog.breed}</Text>
        <View style={styles.meta}>
          <Ionicons name="location-outline" size={14} color={colors.gray500} />
          <Text style={styles.metaText}>
            {dog.city}, {dog.county}
          </Text>
          <Text style={styles.metaText}>
            · {dog.age} {dog.age === 1 ? 'year' : 'years'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.gray50 },
  listContent: { padding: 16, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.gray600 },
  emptyText: { fontSize: 14, color: colors.gray400, marginTop: 4 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 200 },
  imagePlaceholder: {
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 999,
    padding: 6,
  },
  male: { backgroundColor: colors.primary600 },
  female: { backgroundColor: '#ec4899' },
  cardBody: { padding: 14 },
  name: { fontSize: 18, fontWeight: '700', color: colors.gray900 },
  breed: { fontSize: 14, color: colors.primary700, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  metaText: { fontSize: 13, color: colors.gray500 },
});
