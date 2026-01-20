'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dogsApi } from '@/lib/api/dogs';
import { reviewsApi } from '@/lib/api/reviews';
import { messagesApi } from '@/lib/api/messages';
import { useAuthStore } from '@/lib/store/authStore';
import { Dog, Review } from '@/types';
import Image from 'next/image';
import { 
  MapPin, MessageCircle, Share2, 
  CheckCircle, XCircle, Star, Loader2, User
} from 'lucide-react';
import { formatAge, formatCurrency, formatDate } from '@/lib/utils/formatters';
import toast from 'react-hot-toast';
import ReviewCard from '@/components/dog/ReviewCard';
import ReviewForm from '@/components/dog/ReviewForm';

export default function DogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [dog, setDog] = useState<Dog | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState({ total: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchDog = useCallback(async () => {
    if (!params.id) return;
    
    try {
      const response = await dogsApi.getById(params.id as string);
      setDog(response.dog);
      setSelectedImage(response.dog.mainImage || response.dog.images[0]);
    } catch {
      toast.error('Failed to load dog details');
      router.push('/browse');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  const fetchReviews = useCallback(async () => {
    if (!params.id) return;
    
    try {
      const response = await reviewsApi.getDogReviews(params.id as string);
      setReviews(response.reviews);
      setReviewStats(response.stats);
    } catch {
      console.error('Failed to load reviews');
    }
  }, [params.id]);

  useEffect(() => {
    fetchDog();
    fetchReviews();
  }, [fetchDog, fetchReviews]);

  const handleContactOwner = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to contact the owner');
      router.push('/login');
      return;
    }

    try {
      const response = await messagesApi.getOrCreateConversation(
        dog!.owner._id || dog!.owner.id,
        dog!._id
      );
      router.push(`/messages?conversation=${response.conversation._id}`);
    } catch {
      toast.error('Failed to start conversation');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${dog?.name} - ${dog?.breed}`,
        text: `Check out ${dog?.name} on DogMate!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!dog) {
    return null;
  }

  const isOwner = user?._id === dog.owner._id || user?.id === dog.owner.id;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-primary-600 hover:text-primary-700 mb-4"
          >
            ← Back to browse
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="card">
              <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden mb-4">
                <Image
                  src={selectedImage || '/placeholder-dog.jpg'}
                  alt={dog.name}
                  width={800}
                  height={600}
                  className="object-cover w-full h-96"
                  onError={() => setSelectedImage('/placeholder-dog.jpg')}
                />
              </div>

              {/* Image Thumbnails */}
              {dog.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {dog.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImage === image ? 'border-primary-600' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image || '/placeholder-dog.jpg'}
                        alt={`${dog.name} ${index + 1}`}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">About {dog.name}</h2>
              <p className="text-gray-700 whitespace-pre-line">{dog.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <InfoItem label="Breed" value={dog.breed} />
                <InfoItem label="Gender" value={dog.gender} />
                <InfoItem label="Age" value={formatAge(dog.dateOfBirth)} />
                <InfoItem label="Weight" value={`${dog.weight} lbs`} />
                <InfoItem label="Color" value={dog.color} />
                <InfoItem label="Views" value={dog.views.toString()} />
              </div>
            </div>

            {/* Health Information */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Health Information</h2>
              <div className="space-y-3">
                <HealthItem
                  label="Vaccinated"
                  value={dog.healthInfo.vaccinated}
                />
                <HealthItem
                  label="Neutered/Spayed"
                  value={dog.healthInfo.neutered}
                />
                {dog.healthInfo.veterinarian && (
                  <div>
                    <p className="font-semibold">Veterinarian</p>
                    <p className="text-gray-700">{dog.healthInfo.veterinarian.name}</p>
                    <p className="text-gray-600 text-sm">{dog.healthInfo.veterinarian.contact}</p>
                  </div>
                )}
                {dog.healthInfo.medicalHistory && (
                  <div>
                    <p className="font-semibold">Medical History</p>
                    <p className="text-gray-700">{dog.healthInfo.medicalHistory}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pedigree */}
            {dog.pedigree.registered && (
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Pedigree Information</h2>
                <div className="space-y-3">
                  <InfoItem label="Registry" value={dog.pedigree.registry || 'N/A'} />
                  <InfoItem label="Registration Number" value={dog.pedigree.registrationNumber || 'N/A'} />
                  {dog.pedigree.sire && <InfoItem label="Sire" value={dog.pedigree.sire} />}
                  {dog.pedigree.dam && <InfoItem label="Dam" value={dog.pedigree.dam} />}
                </div>
              </div>
            )}

            {/* Breeding Info */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Breeding Information</h2>
              <div className="space-y-3">
                <HealthItem
                  label="Available for Breeding"
                  value={dog.breeding.available}
                />
                {dog.breeding.studFee && (
                  <InfoItem
                    label="Stud Fee"
                    value={`${formatCurrency(dog.breeding.studFee)}${
                      dog.breeding.studFeeNegotiable ? ' (Negotiable)' : ''
                    }`}
                  />
                )}
                <InfoItem
                  label="Previous Litters"
                  value={dog.breeding.previousLitters.toString()}
                />
                {dog.breeding.temperament.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2">Temperament</p>
                    <div className="flex flex-wrap gap-2">
                      {dog.breeding.temperament.map((trait, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  Reviews ({reviewStats.total})
                </h2>
                {isAuthenticated && !isOwner && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="btn-primary"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {reviewStats.total > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="h-6 w-6 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold">{reviewStats.avgRating.toFixed(1)}</span>
                    <span className="text-gray-600">out of 5</span>
                  </div>
                </div>
              )}

              {showReviewForm && (
                <ReviewForm
                  dogId={dog._id}
                  onSuccess={() => {
                    setShowReviewForm(false);
                    fetchReviews();
                  }}
                  onCancel={() => setShowReviewForm(false)}
                />
              )}

              <div className="space-y-4 mt-6">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
                {reviews.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Owner Info and Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Dog Title Card */}
              <div className="card">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{dog.name}</h1>
                <p className="text-xl text-gray-600 mb-4">{dog.breed}</p>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{dog.location.city}, {dog.location.state}</span>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  {dog.breeding.available ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      Available for Breeding
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                      Not Available
                    </span>
                  )}
                </div>

                {!isOwner && (
                  <div className="space-y-2">
                    <button
                      onClick={handleContactOwner}
                      className="btn-primary w-full flex items-center justify-center"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Contact Owner
                    </button>
                    <button
                      onClick={handleShare}
                      className="btn-secondary w-full flex items-center justify-center"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Share
                    </button>
                  </div>
                )}

                {isOwner && (
                  <button
                    onClick={() => router.push(`/dashboard/edit-dog/${dog._id}`)}
                    className="btn-primary w-full"
                  >
                    Edit Listing
                  </button>
                )}
              </div>

              {/* Owner Info */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {dog.owner.avatar ? (
                      <Image
                        src={dog.owner.avatar}
                        alt={dog.owner.firstName}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">
                        {dog.owner.firstName} {dog.owner.lastName}
                      </p>
                      {dog.owner.verified && (
                        <p className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verified Owner
                        </p>
                      )}
                    </div>
                  </div>

                  {dog.owner.location && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <p>{dog.owner.location.city}, {dog.owner.location.state}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-500">
                      Member since {formatDate(dog.owner.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posted</span>
                    <span className="font-semibold">{formatDate(dog.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-semibold">{dog.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-semibold ${
                      dog.status === 'active' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {dog.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-semibold capitalize">{value}</p>
    </div>
  );
}

function HealthItem({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      {value ? (
        <CheckCircle className="h-5 w-5 text-green-600" />
      ) : (
        <XCircle className="h-5 w-5 text-red-600" />
      )}
    </div>
  );
}