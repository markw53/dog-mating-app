import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { dogsApi } from '@/lib/api/dogs';
import { matchingApi, Match } from '@/lib/api/matching';
import { Dog } from '@/lib/types';
import { colors } from '@/constants/colors';

export default function MatchesScreen() {
  const router = useRouter();
  const [myDogs, setMyDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingDogs, setLoadingDogs] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Reload my dogs when the tab gains focus (a new dog may have been added)
  useFocusEffect(
    useCallback(() => {
      dogsApi
        .getMyDogs()
        .then((data) => {
          setMyDogs(data.dogs);
          setSelectedDogId((current) => {
            if (current && data.dogs.some((d) => d.id === current)) return current;
            return data.dogs[0]?.id ?? null;
          });
        })
        .catch(() => {})
        .finally(() => setLoadingDogs(false));
    }, []),
  );

  const loadMatches = useCallback(async (dogId: string) => {
    setLoadingMatches(true);
    try {
      const data = await matchingApi.findMatches(dogId, { limit: 20 });
      setMatches(data.matches);
    } catch {
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDogId) {
      loadMatches(selectedDogId);
    } else {
      setMatches([]);
    }
  }, [selectedDogId, loadMatches]);

  const handleRefresh = async () => {
    if (!selectedDogId) return;
    setRefreshing(true);
    await loadMatches(selectedDogId);
    setRefreshing(false);
  };

  if (loadingDogs) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary600} />
      </View>
    );
  }

  // No dogs yet: matching needs a dog of your own
  if (myDogs.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🐾</Text>
        <Text style={styles.emptyTitle}>Add your dog to find matches</Text>
        <Text style={styles.emptyText}>
          Matching compares breed, age, health, temperament, and distance.
        </Text>
        <Link href="/add-dog" asChild>
          <TouchableOpacity style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Add Your Dog</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  const selectedDog = myDogs.find((d) => d.id === selectedDogId);
  const pending = selectedDog && String(selectedDog.status).toUpperCase() !== 'ACTIVE';

  return (
    <View style={styles.container}>
      {/* Dog selector */}
      {myDogs.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selector}
          contentContainerStyle={styles.selectorContent}
        >
          {myDogs.map((dog) => {
            const active = dog.id === selectedDogId;
            return (
              <TouchableOpacity
                key={dog.id}
                style={[styles.dogChip, active && styles.dogChipActive]}
                onPress={() => setSelectedDogId(dog.id)}
              >
                <Text style={[styles.dogChipText, active && styles.dogChipTextActive]}>
                  {dog.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {loadingMatches ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary600} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={matches}
          keyExtractor={(match) => match.dog.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary600}
            />
          }
          renderItem={({ item }) => (
            <MatchCard match={item} onPress={() => router.push(`/dog/${item.dog.id}`)} />
          )}
          ListHeaderComponent={
            selectedDog ? (
              <Text style={styles.listHeader}>
                Matches for <Text style={{ fontWeight: '700' }}>{selectedDog.name}</Text>
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="heart-dislike-outline" size={44} color={colors.gray400} />
              <Text style={styles.emptyTitle}>No matches yet</Text>
              <Text style={styles.emptyText}>
                {pending
                  ? `${selectedDog?.name}'s listing is awaiting approval — matches appear once it's live.`
                  : 'Check back as more dogs join in your area.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function scoreStyle(score: number) {
  if (score >= 80) return { badge: styles.scoreExcellent, label: 'Excellent match' };
  if (score >= 60) return { badge: styles.scoreGreat, label: 'Great match' };
  if (score >= 40) return { badge: styles.scoreGood, label: 'Good match' };
  return { badge: styles.scoreFair, label: 'Fair match' };
}

function MatchCard({ match, onPress }: { match: Match; onPress: () => void }) {
  const { dog, matchScore, matchReasons, distance } = match;
  const imageUrl = dog.mainImage || dog.images?.[0];
  const { badge, label } = scoreStyle(matchScore);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.cardImage} contentFit="cover" />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Text style={{ fontSize: 32 }}>🐕</Text>
        </View>
      )}

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName}>{dog.name}</Text>
            <Text style={styles.cardBreed}>{dog.breed}</Text>
          </View>
          <View style={[styles.scoreBadge, badge]}>
            <Text style={styles.scoreText}>{matchScore}%</Text>
          </View>
        </View>

        <Text style={styles.scoreLabel}>{label}</Text>

        {matchReasons.slice(0, 3).map((reason) => (
          <View key={reason} style={styles.reasonRow}>
            <Ionicons name="checkmark-circle-outline" size={14} color={colors.green500} />
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        ))}

        <View style={styles.cardFooter}>
          {dog.location?.city && (
            <Text style={styles.footerText}>
              <Ionicons name="location-outline" size={12} color={colors.gray500} />{' '}
              {dog.location.city}
              {dog.location.state ? `, ${dog.location.state}` : ''}
            </Text>
          )}
          {distance != null && (
            <Text style={styles.footerText}>· {Math.round(distance)} km away</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 48,
    gap: 6,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.gray600, marginTop: 8 },
  emptyText: { fontSize: 14, color: colors.gray500, textAlign: 'center', lineHeight: 20 },
  emptyButton: {
    backgroundColor: colors.primary600,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 16,
  },
  emptyButtonText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  selector: { flexGrow: 0, backgroundColor: colors.white },
  selectorContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  dogChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.gray50,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dogChipActive: { backgroundColor: colors.primary600, borderColor: colors.primary600 },
  dogChipText: { fontSize: 14, fontWeight: '600', color: colors.gray600 },
  dogChipTextActive: { color: colors.white },
  listContent: { padding: 16, gap: 14, flexGrow: 1 },
  listHeader: { fontSize: 15, color: colors.gray600, marginBottom: 2 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImage: { width: 110 },
  cardImagePlaceholder: {
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, padding: 12 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cardName: { fontSize: 17, fontWeight: '700', color: colors.gray900 },
  cardBreed: { fontSize: 13, color: colors.primary700 },
  scoreBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  scoreExcellent: { backgroundColor: '#dcfce7' },
  scoreGreat: { backgroundColor: colors.primary100 },
  scoreGood: { backgroundColor: '#fef9c3' },
  scoreFair: { backgroundColor: colors.gray100 },
  scoreText: { fontSize: 13, fontWeight: '700', color: colors.gray900 },
  scoreLabel: { fontSize: 12, color: colors.gray500, marginTop: 2, marginBottom: 6 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  reasonText: { fontSize: 12.5, color: colors.gray600, flex: 1 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  footerText: { fontSize: 12, color: colors.gray500 },
});
