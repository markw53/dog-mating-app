'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dogsApi } from '@/lib/api/dogs';
import { reviewsApi } from '@/lib/api/reviews';
import { messagesApi } from '@/lib/api/messages';
import { adminApi } from '@/lib/api/admin';
import { getImageUrl } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';
import { Dog, Review, User } from '@/types';
import Image from 'next/image';
import {
  MapPin, MessageCircle, Share2, CheckCircle, XCircle, Star, 
  Loader2, User as UserIcon, ShieldCheck, ArrowLeft, Heart, Eye, Calendar,
} from 'lucide-react';
import { formatAge, formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import ReviewCard from '@/components/dog/ReviewCard';
import ReviewForm from '@/components/dog/ReviewForm';
import DogImagePlaceholder from '@/components/ui/DogImagePlaceholder';
import Link from 'next/link';

// Helper function to safely get owner info
function getOwnerInfo(owner: User | string | undefined): User | null {
  if (!owner || typeof owner === 'string') return null;
  return owner;
}

// Helper function to safely get breeding info
function getBreedingInfo(dog: Dog) {
  return {
    available: dog.breeding?.available ?? dog.available ?? false,
    studFee: dog.breeding?.studFee ?? dog.studFee,
    studFeeNegotiable: dog.breeding?.studFeeNegotiable ?? dog.studFeeNegotiable ?? false,
    previousLitters: dog.breeding?.previousLitters ?? dog.previousLitters ?? 0,
    temperament: dog.breeding?.temperament ?? dog.temperament ?? [],
  };
}

// Helper function to safely get health info
function getHealthInfo(dog: Dog) {
  return {
    vaccinated: dog.healthInfo?.vaccinated ?? dog.vaccinated ?? false,
    neutered: dog.healthInfo?.neutered ?? dog.neutered ?? false,
    veterinarian: dog.healthInfo?.veterinarian ?? (dog.vetName ? {
      name: dog.vetName,
      contact: dog.vetContact || ''
    } : undefined),
    medicalHistory: dog.healthInfo?.medicalHistory ?? dog.medicalHistory,
  };
}

// Helper function to safely get pedigree info
function getPedigreeInfo(dog: Dog) {
  return {
    registered: dog.pedigree?.registered ?? dog.registered ?? false,
    registrationNumber: dog.pedigree?.registrationNumber ?? dog.registrationNumber,
    registry: dog.pedigree?.registry ?? dog.registry,
    sire: dog.pedigree?.sire ?? dog.sire,
    dam: dog.pedigree?.dam ?? dog.dam,
  };
}

export default function DogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [dog, setDog] = useState<Dog | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState({ total: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [adminActionLoading, setAdminActionLoading] = useState(false);

  // Derived values
  const ownerInfo = dog ? getOwnerInfo(dog.owner) : null;
  const breedingInfo = dog ? getBreedingInfo(dog) : null;
  const healthInfo = dog ? getHealthInfo(dog) : null;
  const pedigreeInfo = dog ? getPedigreeInfo(dog) : null;

  const fetchDog = useCallback(async () => {
    if (!params.id) return;

    try {
      const response = await dogsApi.getById(params.id as string);
      setDog(response.dog);
      const mainImg = response.dog.mainImage || response.dog.images?.[0] || '';
      setSelectedImage(mainImg);
      setImageError(false);
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

    if (!ownerInfo) {
      toast.error('Owner information not available');
      return;
    }

    try {
      const response = await messagesApi.getOrCreateConversation(
        ownerInfo._id || ownerInfo.id,
        dog!._id || dog!.id
      );
      router.push(`/messages?conversation=${response.conversation._id || response.conversation.id}`);
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

  const handleApprove = async () => {
    const id = dog!._id || dog!.id;
    setAdminActionLoading(true);
    try {
      await adminApi.approveDog(id);
      toast.success('Dog approved successfully');
      await fetchDog();
    } catch {
      toast.error('Failed to approve dog');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleReject = async () => {
    const id = dog!._id || dog!.id;
    setAdminActionLoading(true);
    try {
      await adminApi.rejectDog(id);
      toast.success('Dog rejected');
      router.push('/admin');
    } catch {
      toast.error('Failed to reject dog');
    } finally {
      setAdminActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dog details...</p>
        </div>
      </div>
    );
  }

  if (!dog) {
    return null;
  }

  const isOwner = ownerInfo && user && (user._id === ownerInfo._id || user.id === ownerInfo.id);
  const isAdmin = user?.role === 'ADMIN';
  const isPending = dog.status === 'pending';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section with Breadcrumb */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-primary-100 hover:text-white transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Browse
            </button>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center text-primary-100 hover:text-white transition-colors"
              >
                <ShieldCheck className="h-5 w-5 mr-2" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card hover={false} className="overflow-hidden">
                <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-4 h-96 md:h-[500px]">
                  {selectedImage && !imageError ? (
                    <Image
                      src={getImageUrl(selectedImage)}
                      alt={dog.name}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                      unoptimized
                    />
                  ) : (
                    <DogImagePlaceholder className="w-full h-full" />
                  )}
                  
                  {/* Image overlay with quick info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                    <div className="flex items-center gap-4 text-white">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        <span className="text-sm font-medium">{dog.views ?? 0} views</span>
                      </div>
                      {reviewStats.total > 0 && (
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{reviewStats.avgRating.toFixed(1)} ({reviewStats.total})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image Thumbnails */}
                {dog.images && dog.images.length > 1 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {dog.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImage(image);
                          setImageError(false);
                        }}
                        className={`group aspect-square rounded-lg overflow-hidden border-2 relative transition-all ${
                          selectedImage === image 
                            ? 'border-primary-600 ring-2 ring-primary-200' 
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <Image
                          src={getImageUrl(image)}
                          alt={`${dog.name} ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform"
                          sizes="(max-width: 768px) 25vw, 150px"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {/* About Section */}
              <Card>
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 p-2 rounded-lg mr-3">
                    <UserIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">About {dog.name}</h2>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                  {dog.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <StatBox icon="🐕" label="Breed" value={dog.breed} />
                  <StatBox icon="⚤" label="Gender" value={dog.gender} />
                  <StatBox icon="🎂" label="Age" value={formatAge(dog.dateOfBirth)} />
                  <StatBox icon="⚖️" label="Weight" value={`${dog.weight} lbs`} />
                  <StatBox icon="🎨" label="Color" value={dog.color} />
                  <StatBox icon="👁️" label="Views" value={String(dog.views ?? 0)} />
                </div>
              </Card>

              {/* Health Information */}
              {healthInfo && (
                <Card>
                  <div className="flex items-center mb-6">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Health Information</h2>
                  </div>
                  <div className="grid gap-4">
                    <HealthStatusCard
                      label="Vaccinated"
                      value={healthInfo.vaccinated}
                      description="Up to date with all vaccinations"
                    />
                    <HealthStatusCard
                      label="Neutered/Spayed"
                      value={healthInfo.neutered}
                      description="Surgical procedure completed"
                    />
                    {healthInfo.veterinarian && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="font-semibold text-blue-900 mb-2">Veterinarian</p>
                        <p className="text-blue-800">{healthInfo.veterinarian.name}</p>
                        {healthInfo.veterinarian.contact && (
                          <p className="text-blue-600 text-sm">{healthInfo.veterinarian.contact}</p>
                        )}
                      </div>
                    )}
                    {healthInfo.medicalHistory && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-gray-900 mb-2">Medical History</p>
                        <p className="text-gray-700">{healthInfo.medicalHistory}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Pedigree */}
              {pedigreeInfo?.registered && (
                <Card>
                  <div className="flex items-center mb-6">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <ShieldCheck className="h-6 w-6 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Pedigree Information</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoCard label="Registry" value={pedigreeInfo.registry || 'N/A'} />
                    <InfoCard label="Registration Number" value={pedigreeInfo.registrationNumber || 'N/A'} />
                    {pedigreeInfo.sire && <InfoCard label="Sire (Father)" value={pedigreeInfo.sire} />}
                    {pedigreeInfo.dam && <InfoCard label="Dam (Mother)" value={pedigreeInfo.dam} />}
                  </div>
                </Card>
              )}

              {/* Breeding Info */}
              {breedingInfo && (
                <Card>
                  <div className="flex items-center mb-6">
                    <div className="bg-pink-100 p-2 rounded-lg mr-3">
                      <Heart className="h-6 w-6 text-pink-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Breeding Information</h2>
                  </div>
                  <div className="space-y-4">
                    <HealthStatusCard
                      label="Available for Breeding"
                      value={breedingInfo.available}
                      description={breedingInfo.available ? "Currently accepting breeding requests" : "Not available at this time"}
                    />
                    {breedingInfo.studFee && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-sm font-medium text-green-800 mb-1">Stud Fee</p>
                        <p className="text-2xl font-bold text-green-900">
                          {formatCurrency(breedingInfo.studFee)}
                          {breedingInfo.studFeeNegotiable && (
                            <span className="text-sm font-normal text-green-700 ml-2">(Negotiable)</span>
                          )}
                        </p>
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <InfoCard label="Previous Litters" value={breedingInfo.previousLitters.toString()} />
                    </div>
                    {breedingInfo.temperament && breedingInfo.temperament.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-900 mb-3">Temperament Traits</p>
                        <div className="flex flex-wrap gap-2">
                          {breedingInfo.temperament.map((trait, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Reviews */}
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Reviews ({reviewStats.total})
                    </h2>
                  </div>
                  {isAuthenticated && !isOwner && !isPending && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="btn-primary text-sm"
                    >
                      Write Review
                    </button>
                  )}
                </div>

                {reviewStats.total > 0 && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center justify-center space-x-3">
                      <Star className="h-10 w-10 text-yellow-500 fill-current" />
                      <div>
                        <div className="text-4xl font-bold text-gray-900">{reviewStats.avgRating.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">out of 5</div>
                      </div>
                    </div>
                  </div>
                )}

                {showReviewForm && (
                  <div className="mb-6">
                    <ReviewForm
                      dogId={dog._id || dog.id}
                      onSuccess={() => {
                        setShowReviewForm(false);
                        fetchReviews();
                      }}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id || review.id} review={review} />
                  ))}
                  {reviews.length === 0 && (
                    <div className="text-center py-12">
                      <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium mb-2">No reviews yet</p>
                      <p className="text-gray-400">Be the first to share your experience!</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                {/* Dog Info Card */}
                <Card hover={false} className="bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{dog.name}</h1>
                      <p className="text-xl text-gray-600">{dog.breed}</p>
                    </div>
                    {isPending && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                        PENDING
                      </span>
                    )}
                  </div>

                  {dog.location && (
                    <div className="flex items-center text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                      <span className="font-medium">{dog.location.city}, {dog.location.state}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-6">
                    {breedingInfo?.available ? (
                      <span className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-bold text-center shadow-sm">
                        ✓ Available for Breeding
                      </span>
                    ) : (
                      <span className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold text-center">
                        Not Available
                      </span>
                    )}
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && isPending && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="h-5 w-5 text-amber-600" />
                        <p className="font-bold text-amber-900">Admin Review Required</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleApprove}
                          disabled={adminActionLoading}
                          className="flex-1 btn-primary flex items-center justify-center text-sm"
                        >
                          {adminActionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={adminActionLoading}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm disabled:opacity-50 flex items-center justify-center"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!isOwner && ownerInfo && (
                    <div className="space-y-2">
                      <button
                        onClick={handleContactOwner}
                        className="w-full btn-primary flex items-center justify-center py-3"
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Contact Owner
                      </button>
                      <button
                        onClick={handleShare}
                        className="w-full btn-secondary flex items-center justify-center py-3"
                      >
                        <Share2 className="h-5 w-5 mr-2" />
                        Share
                      </button>
                      <Link
                        href={`/dogs/${dog._id || dog.id}/matches`}
                        className="w-full btn-primary flex items-center justify-center py-3"
                      >
                        <Heart className="w-5 h-5 mr-2" />
                        Find Matches
                      </Link>
                    </div>
                  )}

                  {isOwner && (
                    <>
                      <button
                        onClick={() => router.push(`/dashboard/edit-dog/${dog._id || dog.id}`)}
                        className="w-full btn-primary py-3 mb-2"
                      >
                        Edit Listing
                      </button>
                      <Link
                        href={`/dogs/${dog._id || dog.id}/matches`}
                        className="w-full btn-secondary flex items-center justify-center py-3"
                      >
                        <Heart className="w-5 h-5 mr-2" />
                        Find Matches
                      </Link>
                    </>
                  )}
                </Card>

                {/* Owner Info Card */}
                {ownerInfo && (
                  <Card hover={false}>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Owner Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        {ownerInfo.avatar ? (
                          <Image
                            src={getImageUrl(ownerInfo.avatar)}
                            alt={ownerInfo.firstName}
                            width={56}
                            height={56}
                            className="rounded-full ring-2 ring-gray-200"
                            unoptimized
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center ring-2 ring-gray-200">
                            <UserIcon className="h-7 w-7 text-primary-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">
                            {ownerInfo.firstName} {ownerInfo.lastName}
                          </p>
                          {ownerInfo.verified && (
                            <p className="text-sm text-green-600 flex items-center font-medium">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verified Owner
                            </p>
                                                      )}
                        </div>
                      </div>

                      {(ownerInfo.location || ownerInfo.city) && (
                        <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="text-sm text-gray-700">
                            <p className="font-medium">
                              {ownerInfo.location?.city || ownerInfo.city}
                              {(ownerInfo.location?.state || ownerInfo.county) && 
                                `, ${ownerInfo.location?.state || ownerInfo.county}`
                              }
                            </p>
                          </div>
                        </div>
                      )}

                      {ownerInfo.createdAt && (
                        <div className="pt-3 border-t flex items-center justify-between">
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm">Member since</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatDate(ownerInfo.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Quick Stats Card */}
                <Card hover={false} className="bg-gradient-to-br from-primary-50 to-primary-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    {dog.createdAt && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">Posted</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {formatDate(dog.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <Eye className="h-4 w-4 mr-2" />
                        <span className="text-sm">Views</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{dog.views ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Status</span>
                      </div>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                        dog.status === 'active' 
                          ? 'bg-green-500 text-white' 
                          : dog.status === 'pending'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {dog.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper Components
function StatBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="font-bold text-gray-900 capitalize truncate">{value}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="font-bold text-gray-900">{value}</p>
    </div>
  );
}

function HealthStatusCard({ 
  label, 
  value, 
  description 
}: { 
  label: string; 
  value: boolean; 
  description: string;
}) {
  return (
    <div className={`p-4 rounded-lg border-2 ${
      value 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`font-bold ${value ? 'text-green-900' : 'text-red-900'}`}>
          {label}
        </span>
        {value ? (
          <CheckCircle className="h-6 w-6 text-green-600" />
        ) : (
          <XCircle className="h-6 w-6 text-red-600" />
        )}
      </div>
      <p className={`text-sm ${value ? 'text-green-700' : 'text-red-700'}`}>
        {description}
      </p>
    </div>
  );
}
                