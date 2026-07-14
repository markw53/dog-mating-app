import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AxiosError } from 'axios';
import { dogsApi } from '@/lib/api/dogs';
import DogForm, { DogFormValues, PickedImage, toDogPayload } from '@/components/DogForm';

export default function AddDogScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: DogFormValues, newImages: PickedImage[]) => {
    setSubmitting(true);
    try {
      const created = await dogsApi.create(toDogPayload(values));

      if (newImages.length > 0) {
        await dogsApi.uploadImages(created.dog.id, newImages);
      }

      Alert.alert(
        'Listing submitted 🎉',
        `${values.name} is now awaiting approval. You'll see the listing in Browse once an admin approves it.`,
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
    <DogForm
      submitLabel="Submit for Approval"
      submitting={submitting}
      footnote="Listings are reviewed by an admin before they appear in Browse."
      onSubmit={handleSubmit}
    />
  );
}
