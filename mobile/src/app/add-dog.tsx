import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AxiosError } from 'axios';
import { dogsApi } from '@/lib/api/dogs';
import BreedPicker from '@/components/BreedPicker';
import { colors } from '@/constants/colors';

const TEMPERAMENT_OPTIONS = [
  'Friendly', 'Gentle', 'Energetic', 'Calm', 'Loyal', 'Intelligent',
  'Protective', 'Playful', 'Independent', 'Affectionate',
];

const MAX_PHOTOS = 10;

interface PickedImage {
  uri: string;
  mimeType?: string;
}

export default function AddDogScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    breed: '',
    gender: 'male' as 'male' | 'female',
    dateOfBirth: null as Date | null,
    weight: '',
    color: '',
    description: '',
    city: '',
    county: '',
    postcode: '',
    vaccinated: false,
    neutered: false,
    available: true,
    studFee: '',
    temperament: [] as string[],
  });
  const [images, setImages] = useState<PickedImage[]>([]);
  const [breedPickerOpen, setBreedPickerOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleTrait = (trait: string) =>
    set(
      'temperament',
      form.temperament.includes(trait)
        ? form.temperament.filter((t) => t !== trait)
        : [...form.temperament, trait],
    );

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to add pictures of your dog.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const picked = result.assets.map((asset) => ({
        uri: asset.uri,
        mimeType: asset.mimeType,
      }));
      setImages((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS));
    }
  };

  const removeImage = (uri: string) =>
    setImages((prev) => prev.filter((image) => image.uri !== uri));

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Please enter your dog’s name.';
    if (!form.breed) return 'Please select a breed.';
    if (!form.dateOfBirth) return 'Please set the date of birth.';
    if (!form.weight || isNaN(parseFloat(form.weight)) || parseFloat(form.weight) <= 0)
      return 'Please enter a valid weight in kg.';
    if (!form.color.trim()) return 'Please enter the coat color.';
    if (form.description.trim().length < 10)
      return 'Please write a description of at least 10 characters.';
    if (!form.city.trim() || !form.county.trim()) return 'Please enter your city and county.';
    return null;
  };

  const handleSubmit = async () => {
    const problem = validate();
    if (problem) {
      Alert.alert('Almost there', problem);
      return;
    }

    setSubmitting(true);
    try {
      const created = await dogsApi.create({
        name: form.name.trim(),
        breed: form.breed,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth!.toISOString().split('T')[0],
        weight: parseFloat(form.weight),
        color: form.color.trim(),
        description: form.description.trim(),
        city: form.city.trim(),
        county: form.county.trim(),
        postcode: form.postcode.trim() || undefined,
        vaccinated: form.vaccinated,
        neutered: form.neutered,
        available: form.available,
        studFee: form.studFee ? parseFloat(form.studFee) : undefined,
        temperament: form.temperament,
      });

      if (images.length > 0) {
        await dogsApi.uploadImages(created.dog.id, images);
      }

      Alert.alert(
        'Listing submitted 🎉',
        `${form.name} is now awaiting approval. You'll see the listing in Browse once an admin approves it.`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      Alert.alert('Something went wrong', err.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photos */}
        <SectionTitle title="Photos" />
        <View style={styles.photosRow}>
          {images.map((image) => (
            <View key={image.uri} style={styles.photoWrap}>
              <Image source={{ uri: image.uri }} style={styles.photo} contentFit="cover" />
              <TouchableOpacity
                style={styles.photoRemove}
                onPress={() => removeImage(image.uri)}
                hitSlop={8}
              >
                <Ionicons name="close" size={14} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < MAX_PHOTOS && (
            <TouchableOpacity style={styles.photoAdd} onPress={pickImages}>
              <Ionicons name="camera-outline" size={26} color={colors.primary600} />
              <Text style={styles.photoAddText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.hint}>Up to {MAX_PHOTOS} photos — the first becomes the main photo</Text>

        {/* Basics */}
        <SectionTitle title="Basics" />
        <Field label="Name">
          <TextInput
            style={styles.input}
            placeholder="e.g. Max"
            placeholderTextColor={colors.gray400}
            value={form.name}
            onChangeText={(v) => set('name', v)}
          />
        </Field>

        <Field label="Breed">
          <TouchableOpacity style={styles.input} onPress={() => setBreedPickerOpen(true)}>
            <Text style={form.breed ? styles.inputText : styles.inputPlaceholder}>
              {form.breed || 'Select breed'}
            </Text>
          </TouchableOpacity>
        </Field>

        <Field label="Gender">
          <View style={styles.toggleRow}>
            {(['male', 'female'] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.toggle, form.gender === g && styles.toggleActive]}
                onPress={() => set('gender', g)}
              >
                <Ionicons
                  name={g === 'male' ? 'male' : 'female'}
                  size={16}
                  color={form.gender === g ? colors.white : colors.gray500}
                />
                <Text style={[styles.toggleText, form.gender === g && styles.toggleTextActive]}>
                  {g === 'male' ? 'Male' : 'Female'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Date of birth">
          <TouchableOpacity style={styles.input} onPress={() => setDatePickerOpen(true)}>
            <Text style={form.dateOfBirth ? styles.inputText : styles.inputPlaceholder}>
              {form.dateOfBirth ? form.dateOfBirth.toLocaleDateString() : 'Select date'}
            </Text>
          </TouchableOpacity>
          {datePickerOpen && (
            <DateTimePicker
              value={form.dateOfBirth ?? new Date()}
              mode="date"
              maximumDate={new Date()}
              onChange={(_event, date) => {
                setDatePickerOpen(Platform.OS === 'ios');
                if (date) set('dateOfBirth', date);
              }}
            />
          )}
        </Field>

        <View style={styles.row}>
          <Field label="Weight (kg)" style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 25"
              placeholderTextColor={colors.gray400}
              keyboardType="decimal-pad"
              value={form.weight}
              onChangeText={(v) => set('weight', v)}
            />
          </Field>
          <Field label="Color" style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Golden"
              placeholderTextColor={colors.gray400}
              value={form.color}
              onChangeText={(v) => set('color', v)}
            />
          </Field>
        </View>

        <Field label="Description">
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Tell others about your dog's personality, pedigree, and what you're looking for..."
            placeholderTextColor={colors.gray400}
            multiline
            value={form.description}
            onChangeText={(v) => set('description', v)}
          />
        </Field>

        {/* Location */}
        <SectionTitle title="Location" />
        <View style={styles.row}>
          <Field label="City" style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Leeds"
              placeholderTextColor={colors.gray400}
              value={form.city}
              onChangeText={(v) => set('city', v)}
            />
          </Field>
          <Field label="County" style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              placeholder="e.g. West Yorkshire"
              placeholderTextColor={colors.gray400}
              value={form.county}
              onChangeText={(v) => set('county', v)}
            />
          </Field>
        </View>
        <Field label="Postcode (improves map accuracy)">
          <TextInput
            style={styles.input}
            placeholder="e.g. LS1 4AP"
            placeholderTextColor={colors.gray400}
            autoCapitalize="characters"
            value={form.postcode}
            onChangeText={(v) => set('postcode', v)}
          />
        </Field>

        {/* Health & breeding */}
        <SectionTitle title="Health & Breeding" />
        <SwitchRow
          label="Vaccinated"
          value={form.vaccinated}
          onChange={(v) => set('vaccinated', v)}
        />
        <SwitchRow label="Neutered" value={form.neutered} onChange={(v) => set('neutered', v)} />
        <SwitchRow
          label="Available for breeding"
          value={form.available}
          onChange={(v) => set('available', v)}
        />
        <Field label="Stud fee (£, optional)">
          <TextInput
            style={styles.input}
            placeholder="e.g. 500"
            placeholderTextColor={colors.gray400}
            keyboardType="decimal-pad"
            value={form.studFee}
            onChangeText={(v) => set('studFee', v)}
          />
        </Field>

        <SectionTitle title="Temperament" />
        <View style={styles.chips}>
          {TEMPERAMENT_OPTIONS.map((trait) => {
            const selected = form.temperament.includes(trait);
            return (
              <TouchableOpacity
                key={trait}
                style={[styles.chip, selected && styles.chipActive]}
                onPress={() => toggleTrait(trait)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>{trait}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.submit} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitText}>Submit for Approval</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.hint}>
          Listings are reviewed by an admin before they appear in Browse.
        </Text>
      </ScrollView>

      <BreedPicker
        visible={breedPickerOpen}
        onSelect={(breed) => set('breed', breed)}
        onClose={() => setBreedPickerOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function SwitchRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary500 }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { padding: 20, paddingBottom: 48 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.gray900,
    marginTop: 20,
    marginBottom: 10,
  },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoWrap: { position: 'relative' },
  photo: { width: 84, height: 84, borderRadius: 12 },
  photoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.gray900,
    borderRadius: 10,
    padding: 3,
  },
  photoAdd: {
    width: 84,
    height: 84,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary200,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddText: { fontSize: 12, color: colors.primary600, marginTop: 2 },
  hint: { fontSize: 12, color: colors.gray400, marginTop: 8, textAlign: 'center' },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.gray600, marginBottom: 6 },
  input: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.gray900,
    justifyContent: 'center',
  },
  inputText: { fontSize: 16, color: colors.gray900 },
  inputPlaceholder: { fontSize: 16, color: colors.gray400 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingVertical: 12,
    backgroundColor: colors.gray50,
  },
  toggleActive: { backgroundColor: colors.primary600, borderColor: colors.primary600 },
  toggleText: { fontSize: 15, fontWeight: '600', color: colors.gray500 },
  toggleTextActive: { color: colors.white },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchLabel: { fontSize: 16, color: colors.gray900 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.gray50,
  },
  chipActive: { backgroundColor: colors.primary600, borderColor: colors.primary600 },
  chipText: { fontSize: 14, color: colors.gray600 },
  chipTextActive: { color: colors.white },
  submit: {
    backgroundColor: colors.primary600,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  submitText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
