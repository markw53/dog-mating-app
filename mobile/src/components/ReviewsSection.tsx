import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AxiosError } from 'axios';
import { reviewsApi } from '@/lib/api/reviews';
import { useAuthStore } from '@/lib/store/authStore';
import { Review } from '@/lib/types';
import { colors } from '@/constants/colors';

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color="#f59e0b"
        />
      ))}
    </View>
  );
}

export default function ReviewsSection({
  dogId,
  ownerId,
}: {
  dogId: string;
  ownerId?: string;
}) {
  const user = useAuthStore((s) => s.user);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ total: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [writeOpen, setWriteOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await reviewsApi.getDogReviews(dogId);
      setReviews(data.reviews);
      setStats(data.stats);
    } catch {
      // Section quietly shows nothing on failure
    } finally {
      setLoading(false);
    }
  }, [dogId]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwner = user?.id === ownerId;
  const alreadyReviewed = reviews.some((r) => r.reviewerId === user?.id);
  const canReview = user && !isOwner && !alreadyReviewed;

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Missing rating', 'Please tap a star rating.');
      return;
    }
    if (comment.trim().length < 5) {
      Alert.alert('Comment too short', 'Please write at least 5 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await reviewsApi.createReview(dogId, rating, comment.trim());
      setWriteOpen(false);
      setRating(0);
      setComment('');
      await load();
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      Alert.alert('Could not post review', err.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 16 }} color={colors.primary600} />;
  }

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {stats.total > 0 && (
          <View style={styles.statsRow}>
            <Stars rating={Math.round(stats.avgRating)} />
            <Text style={styles.statsText}>
              {stats.avgRating} ({stats.total})
            </Text>
          </View>
        )}
      </View>

      {reviews.length === 0 ? (
        <Text style={styles.emptyText}>No reviews yet.</Text>
      ) : (
        reviews.map((review) => (
          <View key={review.id} style={styles.review}>
            <View style={styles.reviewHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {review.reviewer.firstName[0]}
                  {review.reviewer.lastName[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewerName}>
                  {review.reviewer.firstName} {review.reviewer.lastName}
                </Text>
                <View style={styles.reviewMeta}>
                  <Stars rating={review.rating} size={12} />
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))
      )}

      {canReview && (
        <TouchableOpacity style={styles.writeButton} onPress={() => setWriteOpen(true)}>
          <Ionicons name="star-outline" size={16} color={colors.primary600} />
          <Text style={styles.writeButtonText}>Write a review</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={writeOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setWriteOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a review</Text>
              <TouchableOpacity onPress={() => setWriteOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.gray600} />
              </TouchableOpacity>
            </View>

            <View style={styles.starPicker}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} hitSlop={4}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color="#f59e0b"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience with this dog and their owner..."
              placeholderTextColor={colors.gray400}
              multiline
              value={comment}
              onChangeText={setComment}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitText}>Post Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 22 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.gray900 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statsText: { fontSize: 13, fontWeight: '600', color: colors.gray600 },
  emptyText: { fontSize: 14, color: colors.gray400, marginTop: 8 },
  review: { marginTop: 14 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary700, fontWeight: '700', fontSize: 13 },
  reviewerName: { fontSize: 14, fontWeight: '600', color: colors.gray900 },
  reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 1 },
  reviewDate: { fontSize: 12, color: colors.gray400 },
  reviewComment: { fontSize: 14, color: colors.gray600, lineHeight: 20, marginTop: 6 },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary200,
    backgroundColor: colors.primary50,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
  },
  writeButtonText: { color: colors.primary600, fontSize: 14, fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.gray900 },
  starPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  commentInput: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 90,
    textAlignVertical: 'top',
    color: colors.gray900,
  },
  submitButton: {
    backgroundColor: colors.primary600,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 14,
  },
  submitText: { color: colors.white, fontSize: 15, fontWeight: '600' },
});
