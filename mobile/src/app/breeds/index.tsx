import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { breedsApi } from '@/lib/api/breeds';
import { Breed } from '@/lib/types';
import { colors } from '@/constants/colors';

export default function BreedsScreen() {
  const router = useRouter();
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  useEffect(() => {
    breedsApi
      .getAll()
      .then((data) => setBreeds(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(
    () => [...new Set(breeds.map((b) => b.type))].sort(),
    [breeds],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return breeds.filter(
      (b) =>
        (!typeFilter || b.type === typeFilter) &&
        (!q || b.name.toLowerCase().includes(q)),
    );
  }, [breeds, query, typeFilter]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary600} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.gray400} />
        <TextInput
          style={styles.search}
          placeholder="Search 225 breeds..."
          placeholderTextColor={colors.gray400}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filtersContent}
      >
        <FilterChip
          label="All"
          active={typeFilter === null}
          onPress={() => setTypeFilter(null)}
        />
        {types.map((type) => (
          <FilterChip
            key={type}
            label={type}
            active={typeFilter === type}
            onPress={() => setTypeFilter(typeFilter === type ? null : type)}
          />
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/breeds/${item.slug}`)}
            activeOpacity={0.7}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]}>
                <Text style={{ fontSize: 22 }}>🐕</Text>
              </View>
            )}
            <View style={styles.rowBody}>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowMeta}>
                {item.type}
                {item.size ? ` · ${item.size}` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.gray400} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No breeds match your search</Text>
        }
      />
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    marginBottom: 8,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  search: { flex: 1, paddingVertical: 12, fontSize: 16, color: colors.gray900 },
  filters: { flexGrow: 0 },
  filtersContent: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.gray50,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: colors.primary600, borderColor: colors.primary600 },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.gray600 },
  chipTextActive: { color: colors.white },
  listContent: { paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  thumb: { width: 52, height: 52, borderRadius: 10 },
  thumbPlaceholder: {
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: '600', color: colors.gray900 },
  rowMeta: { fontSize: 13, color: colors.gray500, marginTop: 1 },
  empty: { textAlign: 'center', color: colors.gray400, marginTop: 40 },
});
