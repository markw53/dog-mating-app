// Web fallback: react-native-maps has no web implementation, and the Expo
// web target is only used for quick UI checks — the real web experience is
// the Next.js app. Metro picks this file over map.tsx when bundling for web.
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 48 }}>🗺️</Text>
      <Text style={styles.title}>Map is mobile-only</Text>
      <Text style={styles.text}>
        Open the app on iOS or Android to see dogs near you, or use the DogMate
        website's map page.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 8,
    backgroundColor: colors.gray50,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.gray600 },
  text: { fontSize: 14, color: colors.gray500, textAlign: 'center', lineHeight: 20 },
});
