import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { breedsApi } from '@/lib/api/breeds';
import { BreedDetail } from '@/lib/types';
import { colors } from '@/constants/colors';

export default function BreedDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [breed, setBreed] = useState<BreedDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    breedsApi
      .getBySlug(slug)
      .then((data) => setBreed(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary600} />
      </View>
    );
  }

  if (!breed) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Breed not found</Text>
      </View>
    );
  }

  const facts = [
    { label: 'Size', value: breed.size },
    { label: 'Height', value: breed.height },
    { label: 'Weight', value: breed.weight },
    { label: 'Lifespan', value: breed.longevity },
    { label: 'Exercise', value: breed.exerciseNeeds },
    { label: 'Grooming', value: breed.grooming },
    { label: 'Good with children', value: breed.goodWithChildren },
  ].filter((f) => f.value);

  return (
    <>
      <Stack.Screen options={{ title: breed.name }} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        {breed.imageUrl ? (
          <Image source={{ uri: breed.imageUrl }} style={styles.hero} contentFit="cover" />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Text style={{ fontSize: 56 }}>🐕</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.name}>{breed.name}</Text>
          <Text style={styles.type}>
            {breed.type}
            {breed.kennelClubCategory ? ` · ${breed.kennelClubCategory} group` : ''}
          </Text>

          {facts.length > 0 && (
            <View style={styles.facts}>
              {facts.map((fact) => (
                <View key={fact.label} style={styles.factRow}>
                  <Text style={styles.factLabel}>{fact.label}</Text>
                  <Text style={styles.factValue}>{fact.value}</Text>
                </View>
              ))}
            </View>
          )}

          {breed.temperament && (
            <Section title="Temperament">
              <Text style={styles.paragraph}>{breed.temperament}</Text>
            </Section>
          )}

          {breed.healthProblems && (
            <Section title="Health Considerations">
              <Text style={styles.paragraph}>{breed.healthProblems}</Text>
            </Section>
          )}

          <Section title={`Available ${breed.name}s`}>
            {breed.dogs && breed.dogs.length > 0 ? (
              breed.dogs.map((dog) => (
                <TouchableOpacity
                  key={dog.id}
                  style={styles.dogRow}
                  onPress={() => router.push(`/dog/${dog.id}`)}
                  activeOpacity={0.7}
                >
                  {dog.mainImage ? (
                    <Image
                      source={{ uri: dog.mainImage }}
                      style={styles.dogThumb}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.dogThumb, styles.heroPlaceholder]}>
                      <Text style={{ fontSize: 18 }}>🐕</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dogName}>{dog.name}</Text>
                    <Text style={styles.dogMeta}>
                      {String(dog.gender).toLowerCase()} · {dog.age}{' '}
                      {dog.age === 1 ? 'yr' : 'yrs'} · {dog.city}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.gray400} />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.paragraph}>
                No {breed.name}s are listed right now — check back soon.
              </Text>
            )}
          </Section>

          <Text style={styles.disclaimer}>
            Breed information is sourced from The Royal Kennel Club and provided for
            guidance only.
          </Text>
        </View>
      </ScrollView>
    </>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: colors.gray600 },
  hero: { width: '100%', height: 240 },
  heroPlaceholder: {
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 20 },
  name: { fontSize: 26, fontWeight: '700', color: colors.gray900 },
  type: { fontSize: 15, color: colors.primary700, marginTop: 2 },
  facts: {
    backgroundColor: colors.gray50,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 18,
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 16,
  },
  factLabel: { fontSize: 14, color: colors.gray500 },
  factValue: { fontSize: 14, fontWeight: '600', color: colors.gray900, flexShrink: 1, textAlign: 'right' },
  section: { marginTop: 22 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.gray900, marginBottom: 8 },
  paragraph: { fontSize: 15, color: colors.gray600, lineHeight: 22 },
  dogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  dogThumb: { width: 48, height: 48, borderRadius: 10 },
  dogName: { fontSize: 15, fontWeight: '600', color: colors.gray900 },
  dogMeta: { fontSize: 13, color: colors.gray500, textTransform: 'capitalize' },
  disclaimer: { fontSize: 12, color: colors.gray400, marginTop: 28, lineHeight: 17 },
});
