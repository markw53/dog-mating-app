import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/lib/store/authStore';
import { colors } from '@/constants/colors';

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password) {
      Alert.alert('Missing details', 'Please fill in all fields.');
      return;
    }
    if (form.password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      Alert.alert('Registration failed', err.response?.data?.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🐾</Text>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Join the DogMate community</Text>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="First name"
            placeholderTextColor={colors.gray400}
            value={form.firstName}
            onChangeText={set('firstName')}
          />
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="Last name"
            placeholderTextColor={colors.gray400}
            value={form.lastName}
            onChangeText={set('lastName')}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.gray400}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={form.email}
          onChangeText={set('email')}
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min 8 characters)"
          placeholderTextColor={colors.gray400}
          secureTextEntry
          value={form.password}
          onChangeText={set('password')}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor={colors.gray400}
          secureTextEntry
          value={form.confirmPassword}
          onChangeText={set('confirmPassword')}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/login" style={styles.footerLink}>
            Sign in
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary50 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 48 },
  logo: { fontSize: 56, textAlign: 'center', marginBottom: 8 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gray900,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: 32,
  },
  row: { flexDirection: 'row', gap: 12 },
  rowInput: { flex: 1 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
    color: colors.gray900,
  },
  button: {
    backgroundColor: colors.primary600,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: colors.gray500 },
  footerLink: { color: colors.primary600, fontWeight: '600' },
});
