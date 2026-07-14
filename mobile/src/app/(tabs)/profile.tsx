import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/lib/store/authStore';
import { colors } from '@/constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.firstName[0]}
            {user.lastName[0]}
          </Text>
        </View>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
        {(user.city || user.county) && (
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={14} color={colors.gray500} />{' '}
            {[user.city, user.county].filter(Boolean).join(', ')}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Row icon="paw-outline" label="My Dogs" hint="Coming soon" />
        <Row icon="settings-outline" label="Edit Profile" hint="Coming soon" />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.red500} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({ icon, label, hint }: { icon: any; label: string; hint?: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={22} color={colors.primary600} />
      <Text style={styles.rowLabel}>{label}</Text>
      {hint && <Text style={styles.rowHint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 32,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: colors.white, fontSize: 28, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: colors.gray900 },
  email: { fontSize: 14, color: colors.gray500, marginTop: 2 },
  location: { fontSize: 14, color: colors.gray500, marginTop: 6 },
  section: { backgroundColor: colors.white, marginTop: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  rowLabel: { flex: 1, fontSize: 16, color: colors.gray900 },
  rowHint: { fontSize: 12, color: colors.gray400 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 16,
  },
  logoutText: { color: colors.red500, fontSize: 16, fontWeight: '600' },
});
