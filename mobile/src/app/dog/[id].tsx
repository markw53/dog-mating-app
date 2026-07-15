import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { dogsApi } from '@/lib/api/dogs';
import { messagesApi } from '@/lib/api/messages';
import { useAuthStore } from '@/lib/store/authStore';
import { Dog } from '@/lib/types';
import ReviewsSection from '@/components/ReviewsSection';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function DogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);

  // Refetch on focus so returning from the edit screen shows fresh data
  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      dogsApi
        .getById(id)
        .then((data) => setDog(data.dog))
        .catch(() => Alert.alert('Error', 'Could not load this dog.'))
        .finally(() => setLoading(false));
    }, [id]),
  );

  const handleMessageOwner = async () => {
    if (!dog?.owner || contacting) return;
    setContacting(true);
    try {
      const data = await messagesApi.createConversation(dog.owner.id, dog.id);
      router.push(`/chat/${data.conversation.id}`);
    } catch {
      Alert.alert('Error', 'Could not start the conversation.');
    } finally {
      setContacting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary600} />
      </View>
    );
  }

  if (!dog) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Dog not found</Text>
      </View>
    );
  }

  const images = dog.images?.length ? dog.images : dog.mainImage ? [dog.mainImage] : [];
  const isOwnDog = user?.id === (dog.ownerId || dog.owner?.id);

  return (
    <>
      <Stack.Screen
        options={{
          title: dog.name,
          headerRight: isOwnDog
            ? () => (
                <Link href={`/edit-dog/${dog.id}`} asChild>
                  <TouchableOpacity hitSlop={8}>
                    <Ionicons name="create-outline" size={24} color={colors.primary600} />
                  </TouchableOpacity>
                </Link>
              )
            : undefined,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        {images.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {images.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.image} contentFit="cover" />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ fontSize: 64 }}>🐕</Text>
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{dog.name}</Text>
              <Text style={styles.breed}>{dog.breed}</Text>
            </View>
            {dog.available && (
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>Available</Text>
              </View>
            )}
          </View>

          <View style={styles.factsRow}>
            <Fact label="Age" value={`${dog.age} ${dog.age === 1 ? 'yr' : 'yrs'}`} />
            <Fact label="Gender" value={String(dog.gender).toLowerCase()} />
            <Fact label="Weight" value={`${dog.weight} kg`} />
            <Fact label="Color" value={dog.color} />
          </View>

          <Section title="About">
            <Text style={styles.description}>{dog.description}</Text>
          </Section>

          <Section title="Health & Pedigree">
            <Check label="Vaccinated" ok={dog.vaccinated} />
            <Check label="Not neutered (breeding-ready)" ok={!dog.neutered} />
            <Check label="Pedigree registered" ok={dog.registered} />
          </Section>

          {dog.studFee != null && (
            <Section title="Stud Fee">
              <Text style={styles.studFee}>
                £{dog.studFee}
                {dog.studFeeNegotiable ? ' (negotiable)' : ''}
              </Text>
            </Section>
          )}

          <Section title="Location">
            <Text style={styles.description}>
              <Ionicons name="location-outline" size={14} color={colors.gray500} /> {dog.city},{' '}
              {dog.county}
            </Text>
          </Section>

          <ReviewsSection dogId={dog.id} ownerId={dog.ownerId || dog.owner?.id} />

          {dog.owner && !isOwnDog && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleMessageOwner}
              disabled={contacting}
            >
              {contacting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="chatbubble-outline" size={18} color={colors.white} />
                  <Text style={styles.contactText}>
                    Message {dog.owner.firstName}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factValue}>{value}</Text>
      <Text style={styles.factLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Check({ label, ok }: { label: string; ok: boolean }) {
  return (
    <View style={styles.checkRow}>
      <Ionicons
        name={ok ? 'checkmark-circle' : 'close-circle'}
        size={18}
        color={ok ? colors.green500 : colors.gray400}
      />
      <Text style={styles.checkLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: colors.gray600 },
  image: { width, height: 300 },
  imagePlaceholder: {
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  name: { fontSize: 26, fontWeight: '700', color: colors.gray900 },
  breed: { fontSize: 16, color: colors.primary700, marginTop: 2 },
  availableBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  availableText: { color: '#15803d', fontSize: 12, fontWeight: '600' },
  factsRow: {
    flexDirection: 'row',
    backgroundColor: colors.gray50,
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
  },
  fact: { flex: 1, alignItems: 'center' },
  factValue: { fontSize: 15, fontWeight: '700', color: colors.gray900, textTransform: 'capitalize' },
  factLabel: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  section: { marginTop: 22 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.gray900, marginBottom: 8 },
  description: { fontSize: 15, color: colors.gray600, lineHeight: 22 },
  studFee: { fontSize: 20, fontWeight: '700', color: colors.primary700 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  checkLabel: { fontSize: 15, color: colors.gray600 },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary600,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 28,
  },
  contactText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
