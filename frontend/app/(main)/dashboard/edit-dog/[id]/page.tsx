// app/(dashboard)/dogs/[id]/edit/page.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { dogsApi } from '@/lib/api/dogs';
import { getImageUrl } from '@/lib/api/client';
import { Dog, UpdateDogData } from '@/types';
import { 
  Upload, X, Loader2, Dog as DogIcon, Shield, 
  Heart, MapPin, Image as ImageIcon, Check, Edit 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import toast from 'react-hot-toast';

const POPULAR_BREEDS = [
  'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'French Bulldog',
  'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Cocker Spaniel',
  'Border Collie', 'Staffordshire Bull Terrier', 'Other'
];

const TEMPERAMENT_OPTIONS = [
  'Friendly', 'Gentle', 'Energetic', 'Calm', 'Loyal', 'Intelligent',
  'Protective', 'Playful', 'Independent', 'Affectionate'
];

// Helper function to format date for input
const formatDateForInput = (date: string | Date | undefined): string => {
  if (!date) return '';
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

// Helper function to get owner ID from Dog
const getOwnerIdFromDog = (dog: Dog): string | null => {
  if (dog.ownerId) return dog.ownerId;
  if (!dog.owner) return null;
  if (typeof dog.owner === 'string') return dog.owner;
  return dog.owner._id || dog.owner.id || null;
};

export default function EditDogPage() {
  const params = useParams();
  const router = useRouter();
  
  const { user, loading: authLoading, isAuthorized } = useRequireAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [dogOwnerId, setDogOwnerId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    gender: 'male' as 'male' | 'female',
    dateOfBirth: '',
    weight: '',
    color: '',
    description: '',
    
    vaccinated: false,
    neutered: false,
    vetName: '',
    vetContact: '',
    medicalHistory: '',
    
    registered: false,
    registrationNumber: '',
    registry: '',
    sire: '',
    dam: '',
    
    available: true,
    studFee: '',
    studFeeNegotiable: false,
    previousLitters: '0',
    temperament: [] as string[],
    
    address: '',
    city: '',
    county: '',
    postcode: '',
  });

  const fetchDog = useCallback(async () => {
    try {
      const response = await dogsApi.getById(params.id as string);
      const dogData = response.dog;
      
      setDogOwnerId(getOwnerIdFromDog(dogData));
      setExistingImages(dogData.images || []);

      // Get values from either direct fields or nested objects
      const vaccinated = dogData.vaccinated ?? dogData.healthInfo?.vaccinated ?? false;
      const neutered = dogData.neutered ?? dogData.healthInfo?.neutered ?? false;
      const vetName = dogData.vetName ?? dogData.healthInfo?.veterinarian?.name ?? '';
      const vetContact = dogData.vetContact ?? dogData.healthInfo?.veterinarian?.contact ?? '';
      const medicalHistory = dogData.medicalHistory ?? dogData.healthInfo?.medicalHistory ?? '';

      const registered = dogData.registered ?? dogData.pedigree?.registered ?? false;
      const registrationNumber = dogData.registrationNumber ?? dogData.pedigree?.registrationNumber ?? '';
      const registry = dogData.registry ?? dogData.pedigree?.registry ?? '';
      const sire = dogData.sire ?? dogData.pedigree?.sire ?? '';
      const dam = dogData.dam ?? dogData.pedigree?.dam ?? '';

      const available = dogData.available ?? dogData.breeding?.available ?? true;
      const studFee = dogData.studFee ?? dogData.breeding?.studFee ?? dogData.breeding?.fee ?? '';
      const studFeeNegotiable = dogData.studFeeNegotiable ?? dogData.breeding?.studFeeNegotiable ?? dogData.breeding?.feeNegotiable ?? false;
      const previousLitters = dogData.previousLitters ?? dogData.breeding?.previousLitters ?? 0;
      const temperament = dogData.temperament ?? dogData.breeding?.temperament ?? [];

      const address = dogData.address ?? dogData.location?.address ?? '';
      const city = dogData.city ?? dogData.location?.city ?? '';
      const county = dogData.county ?? dogData.location?.state ?? '';
      const postcode = dogData.postcode ?? dogData.location?.zipCode ?? '';

      setFormData({
        name: dogData.name,
        breed: dogData.breed,
        gender: dogData.gender,
        dateOfBirth: formatDateForInput(dogData.dateOfBirth),
        weight: dogData.weight?.toString() || '',
        color: dogData.color,
        description: dogData.description,
        
        vaccinated,
        neutered,
        vetName: vetName || '',
        vetContact: vetContact || '',
        medicalHistory: medicalHistory || '',
        
        registered,
        registrationNumber: registrationNumber || '',
        registry: registry || '',
        sire: sire || '',
        dam: dam || '',
        
        available,
        studFee: studFee?.toString() || '',
        studFeeNegotiable,
        previousLitters: previousLitters.toString(),
        temperament,
        
        address: address || '',
        city: city || '',
        county: county || '',
        postcode: postcode || '',
      });
    } catch {
      toast.error('Failed to load dog details');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (isAuthorized) {
      fetchDog();
    }
  }, [isAuthorized, fetchDog]);

  useEffect(() => {
    if (!loading && dogOwnerId && user) {
      const userId = user._id || user.id;
      const isOwner = dogOwnerId === userId;
      const isAdmin = user.role === 'ADMIN';
      
      if (!isOwner && !isAdmin) {
        toast.error('You can only edit your own dogs');
        router.push('/dashboard');
      }
    }
  }, [loading, dogOwnerId, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTemperamentToggle = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      temperament: prev.temperament.includes(trait)
        ? prev.temperament.filter(t => t !== trait)
        : [...prev.temperament, trait]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length + existingImages.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingImages.length === 0 && images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setSubmitting(true);

    try {
      const birthDate = new Date(formData.dateOfBirth);
      const age = new Date().getFullYear() - birthDate.getFullYear();

      const updateData: UpdateDogData = {
        name: formData.name,
        breed: formData.breed,
        gender: formData.gender.toUpperCase() as 'MALE' | 'FEMALE',
        dateOfBirth: formData.dateOfBirth,
        age,
        weight: parseFloat(formData.weight),
        color: formData.color,
        description: formData.description,

        vaccinated: formData.vaccinated,
        neutered: formData.neutered,
        vetName: formData.vetName || undefined,
        vetContact: formData.vetContact || undefined,
        medicalHistory: formData.medicalHistory || undefined,

        registered: formData.registered,
        registrationNumber: formData.registrationNumber || undefined,
        registry: formData.registry || undefined,
        sire: formData.sire || undefined,
        dam: formData.dam || undefined,

        available: formData.available,
        studFee: formData.studFee ? parseFloat(formData.studFee) : undefined,
        studFeeNegotiable: formData.studFeeNegotiable,
        previousLitters: parseInt(formData.previousLitters) || 0,
        temperament: formData.temperament,

        address: formData.address || undefined,
        city: formData.city,
        county: formData.county,
        postcode: formData.postcode || undefined,
        country: 'UK',

        // Pass existing images to keep
        images: existingImages,
      };

      console.log('📤 Submitting update:', updateData);

      // Update dog data
      await dogsApi.update(params.id as string, updateData);

      // Upload new images if any
      if (images.length > 0) {
        console.log('📸 Uploading', images.length, 'new images...');
        await dogsApi.uploadImages(params.id as string, images);
      }

      toast.success('Dog updated successfully! 🎉');
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('❌ Update failed:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update dog';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <Section variant="primary" className="py-12 md:py-16">
        <div className="text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <span className="text-white font-semibold text-sm">✏️ Edit Listing</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Update {formData.name || 'Dog'}&apos;s Profile
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            Make changes to your dog&apos;s profile
          </p>
        </div>
      </Section>

      {/* Main Form */}
      <section className="py-12 -mt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images Section */}
            <Card>
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-xl mr-4">
                  <ImageIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Photos</h2>
                  <p className="text-sm text-gray-600">Manage your dog&apos;s images (max 10 total)</p>
                </div>
              </div>
              
              <label className="block w-full cursor-pointer mb-6">
                <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-primary-500 hover:bg-primary-50 transition-all group">
                  <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="h-10 w-10 text-primary-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    Click to upload more images
                  </p>
                  <p className="text-sm text-gray-600">
                    PNG, JPG, WEBP up to 10MB each
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </label>

              {(existingImages.length > 0 || previews.length > 0) && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-700">
                      {existingImages.length + previews.length} image{(existingImages.length + previews.length) > 1 ? 's' : ''}
                    </p>
                    {existingImages.length > 0 && previews.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {existingImages.length} existing • {previews.length} new
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Existing Images */}
                    {existingImages.map((image, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-primary-400 transition-all">
                          <Image
                            src={getImageUrl(image)}
                            alt={`Existing ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg transform hover:scale-110 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                            Main Photo
                          </div>
                        )}
                      </div>
                    ))}

                    {/* New Images */}
                    {previews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden border-2 border-blue-200 group-hover:border-blue-400 transition-all">
                          <Image
                            src={preview}
                            alt={`New ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg transform hover:scale-110 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                          New
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Basic Information */}
            <Card>
              <div className="flex items-center mb-6">
                <div className="bg-purple-100 p-3 rounded-xl mr-4">
                  <DogIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                  <p className="text-sm text-gray-600">Essential details about your dog</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Breed <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="breed"
                    required
                    value={formData.breed}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select breed</option>
                    {POPULAR_BREEDS.map(breed => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Weight (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    required
                    value={formData.weight}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Colour <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="color"
                    required
                    value={formData.color}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="input-field"
                  placeholder="Tell us about your dog's personality, habits, and what makes them special..."
                />
              </div>
            </Card>

            {/* Health Information */}
            <Card>
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-xl mr-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Health Information</h2>
                  <p className="text-sm text-gray-600">Medical history and veterinary details</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      name="vaccinated"
                      checked={formData.vaccinated}
                      onChange={handleChange}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                      Vaccinated
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      name="neutered"
                      checked={formData.neutered}
                      onChange={handleChange}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                      Neutered/Spayed
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Veterinarian Name
                    </label>
                    <input
                      type="text"
                      name="vetName"
                      value={formData.vetName}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Dr. Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Veterinarian Contact
                    </label>
                    <input
                      type="text"
                      name="vetContact"
                      value={formData.vetContact}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="+44 20 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Medical History
                  </label>
                  <textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    rows={4}
                    className="input-field"
                    placeholder="Any medical conditions, surgeries, or ongoing treatments..."
                  />
                </div>
              </div>
            </Card>

            {/* Pedigree Information */}
            <Card>
              <div className="flex items-center mb-6">
                <div className="bg-indigo-100 p-3 rounded-xl mr-4">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Pedigree Information</h2>
                  <p className="text-sm text-gray-600">Registration and lineage details</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="registered"
                    checked={formData.registered}
                    onChange={handleChange}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                    Registered with a kennel club
                  </span>
                </label>

                {formData.registered && (
                  <div className="pl-8 space-y-6 border-l-4 border-primary-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Registry
                        </label>
                        <input
                          type="text"
                          name="registry"
                          value={formData.registry}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="e.g., The Kennel Club"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Registration Number
                        </label>
                        <input
                          type="text"
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Registration #"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Sire (Father)
                        </label>
                        <input
                          type="text"
                          name="sire"
                          value={formData.sire}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Father's name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Dam (Mother)
                        </label>
                        <input
                          type="text"
                          name="dam"
                          value={formData.dam}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Mother's name"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Breeding Information */}
            <Card>
              <div className="flex items-center mb-6">
                <div className="bg-pink-100 p-3 rounded-xl mr-4">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Breeding Information</h2>
                  <p className="text-sm text-gray-600">Availability and breeding details</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-xl border border-primary-200">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleChange}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                    />
                    <span className="ml-3 text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      Available for Breeding
                    </span>
                  </label>
                </div>

                {formData.available && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Stud Fee (£)
                        </label>
                        <input
                          type="number"
                          name="studFee"
                          value={formData.studFee}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="e.g., 500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Previous Litters
                        </label>
                        <input
                          type="number"
                          name="previousLitters"
                          value={formData.previousLitters}
                          onChange={handleChange}
                          className="input-field"
                          min="0"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        name="studFeeNegotiable"
                        checked={formData.studFeeNegotiable}
                        onChange={handleChange}
                        className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                        Stud Fee Negotiable
                      </span>
                    </label>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Temperament Traits
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TEMPERAMENT_OPTIONS.map(trait => (
                          <button
                            key={trait}
                            type="button"
                            onClick={() => handleTemperamentToggle(trait)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              formData.temperament.includes(trait)
                                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md scale-105'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {formData.temperament.includes(trait) && <Check className="inline h-4 w-4 mr-1" />}
                            {trait}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Location */}
            <Card>
              <div className="flex items-center mb-6">
                <div className="bg-orange-100 p-3 rounded-xl mr-4">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Location</h2>
                  <p className="text-sm text-gray-600">Where is your dog located?</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="London"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    County <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="county"
                    required
                    value={formData.county}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Greater London"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Postcode
                  </label>
                  <input
                    type="text"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="SW1A 1AA"
                  />
                </div>
              </div>
            </Card>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 group btn-primary py-4 text-lg font-bold flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    Update Dog
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 btn-secondary py-4 text-lg font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}