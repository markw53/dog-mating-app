import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { AxiosError } from 'axios';
import { dogsApi } from '@/lib/api/dogs';
import { useAuthStore } from '@/lib/store/authStore';
import { Dog } from '@/lib/types';
import DogForm, { DogFormValues, PickedImage, toDogPayload } from '@/components/DogForm';
import { colors } from '@/constants/colors';

export default function EditDogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    dogsApi
      .getById(id)
      .then((data) => {
        const fetched = data.dog;
        const ownerId = fetched.ownerId || fetched.owner?.id;
        if (user && ownerId !== user.id && user.role !== 'ADMIN') {
          Alert.alert('Not allowed', 'You can only edit your own dogs.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
          return;
        }
        setDog(fetched);
      })
      .catch(() => {
        Alert.alert('Error', 'Could not load this dog.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      })
      .finally(() => setLoading(false));
  }, [id, user, router]);

  const handleSubmit = async (
    values: DogFormValues,
    newImages: PickedImage[],
    keptImages: string[],
  ) => {
    if (!dog) return;
    setSubmitting(true);
    try {
      await dogsApi.update(dog.id, {
        ...toDogPayload(values),
        // The kept list drives removals; backend re-points mainImage if the
        // current one was removed
        images: keptImages,
      });

      if (newImages.length > 0) {
        await dogsApi.uploadImages(dog.id, newImages);
      }

      Alert.alert('Saved', `${values.name}'s listing has been updated.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      Alert.alert('Something went wrong', err.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !dog) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary600} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `Edit ${dog.name}` }} />
      <DogForm
        initial={{
          name: dog.name,
          breed: dog.breed,
          gender: String(dog.gender).toLowerCase() as 'male' | 'female',
          dateOfBirth: dog.dateOfBirth ? new Date(dog.dateOfBirth) : null,
          weight: String(dog.weight ?? ''),
          color: dog.color,
          description: dog.description,
          city: dog.city,
          county: dog.county,
          postcode: dog.postcode ?? '',
          vaccinated: dog.vaccinated,
          neutered: dog.neutered,
          available: dog.available,
          studFee: dog.studFee != null ? String(dog.studFee) : '',
          temperament: dog.temperament ?? [],
        }}
        initialImages={dog.images ?? []}
        submitLabel="Save Changes"
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </>
  );
}
