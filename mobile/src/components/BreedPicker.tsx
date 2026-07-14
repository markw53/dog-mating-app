import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { breedsApi } from '@/lib/api/breeds';
import { Breed } from '@/lib/types';
import { colors } from '@/constants/colors';

interface BreedPickerProps {
  visible: boolean;
  onSelect: (breedName: string) => void;
  onClose: () => void;
}

export default function BreedPicker({ visible, onSelect, onClose }: BreedPickerProps) {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible || breeds.length > 0) return;
    setLoading(true);
    breedsApi
      .getAll()
      .then((data) => setBreeds(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visible, breeds.length]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return breeds;
    return breeds.filter((b) => b.name.toLowerCase().includes(q));
  }, [breeds, query]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Breed</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.gray600} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.gray400} />
          <TextInput
            style={styles.search}
            placeholder="Search breeds..."
            placeholderTextColor={colors.gray400}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 32 }} color={colors.primary600} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(b) => b.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                onPress={() => {
                  onSelect(item.name);
                  setQuery('');
                  onClose();
                }}
              >
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowType}>{item.type}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No breeds match &quot;{query}&quot;</Text>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.gray900 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  search: { flex: 1, paddingVertical: 12, fontSize: 16, color: colors.gray900 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  rowName: { fontSize: 16, color: colors.gray900 },
  rowType: { fontSize: 13, color: colors.gray400 },
  empty: { textAlign: 'center', color: colors.gray400, marginTop: 32 },
});
