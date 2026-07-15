import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { dogsApi } from '@/lib/api/dogs';
import { Dog } from '@/lib/types';
import { colors } from '@/constants/colors';

// Centered on the UK
const UK_REGION: Region = {
  latitude: 54.3,
  longitude: -2.5,
  latitudeDelta: 11,
  longitudeDelta: 9,
};

export default function MapScreen() {
  const router = useRouter();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await dogsApi.getAll({ limit: 100 });
      setDogs(data.dogs.filter((dog) => dog.latitude != null && dog.longitude != null));
    } catch {
      // Refresh button retries
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={UK_REGION}>
        {dogs.map((dog) => (
          <Marker
            key={dog.id}
            coordinate={{ latitude: dog.latitude!, longitude: dog.longitude! }}
            pinColor={String(dog.gender).toUpperCase() === 'FEMALE' ? '#ec4899' : colors.primary600}
          >
            <Callout onPress={() => router.push(`/dog/${dog.id}`)}>
              <View style={styles.callout}>
                <Text style={styles.calloutName}>{dog.name}</Text>
                <Text style={styles.calloutBreed}>{dog.breed}</Text>
                <Text style={styles.calloutMeta}>
                  {dog.city} · {dog.age} {dog.age === 1 ? 'yr' : 'yrs'}
                </Text>
                <Text style={styles.calloutLink}>View profile →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.primary600} />
          <Text style={styles.loadingText}>Loading dogs...</Text>
        </View>
      )}

      {!loading && (
        <View style={styles.countBadge}>
          <Ionicons name="paw" size={14} color={colors.primary600} />
          <Text style={styles.countText}>
            {dogs.length} {dogs.length === 1 ? 'dog' : 'dogs'} on the map
          </Text>
          <TouchableOpacity onPress={() => { setLoading(true); load(); }} hitSlop={8}>
            <Ionicons name="refresh" size={14} color={colors.gray500} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  loadingText: { fontSize: 13, color: colors.gray600 },
  countBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  countText: { fontSize: 13, fontWeight: '600', color: colors.gray900 },
  callout: { minWidth: 160, padding: 4 },
  calloutName: { fontSize: 15, fontWeight: '700', color: colors.gray900 },
  calloutBreed: { fontSize: 13, color: colors.primary700 },
  calloutMeta: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  calloutLink: { fontSize: 12, fontWeight: '600', color: colors.primary600, marginTop: 6 },
});
