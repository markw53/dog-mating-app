import { Review } from '@/types';
import { Star, User } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/formatters';
import Image from 'next/image';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border-b border-gray-200 pb-4 last:border-0">
      <div className="flex items-start space-x-3">
        {review.reviewer.avatar ? (
          <Image
            src={review.reviewer.avatar}
            alt={review.reviewer.firstName}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold">
              {review.reviewer.firstName} {review.reviewer.lastName}
            </p>
            <span className="text-sm text-gray-500">
              {formatRelativeTime(review.createdAt)}
            </span>
          </div>

          <div className="flex items-center mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>

          <p className="text-gray-700">{review.comment}</p>
        </div>
      </div>
    </div>
  );
}