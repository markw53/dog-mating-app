'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store/authStore';
import { dogsApi } from '@/lib/api/dogs';
import { Upload, X, Loader2 } from 'lucide-react';
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

export default function EditDogPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

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
      setExistingImages(dogData.images || []);

      setFormData({
        name: dogData.name,
        breed: dogData.breed,
        gender: dogData.gender,
        dateOfBirth: dogData.dateOfBirth.split('T')[0],
        weight: dogData.weight.toString(),
        color: dogData.color,
        description: dogData.description,
        
        vaccinated: dogData.healthInfo.vaccinated,
        neutered: dogData.healthInfo.neutered,
        vetName: dogData.healthInfo.veterinarian?.name || '',
        vetContact: dogData.healthInfo.veterinarian?.contact || '',
        medicalHistory: dogData.healthInfo.medicalHistory || '',
        
        registered: dogData.pedigree.registered,
        registrationNumber: dogData.pedigree.registrationNumber || '',
        registry: dogData.pedigree.registry || '',
        sire: dogData.pedigree.sire || '',
        dam: dogData.pedigree.dam || '',
        
        available: dogData.breeding.available,
        studFee: dogData.breeding.studFee?.toString() || '',
        studFeeNegotiable: dogData.breeding.studFeeNegotiable,
        previousLitters: dogData.breeding.previousLitters.toString(),
        temperament: dogData.breeding.temperament || [],
        
        address: dogData.location.address || '',
        city: dogData.location.city,
        county: dogData.location.state, // Using state field for county
        postcode: dogData.location.zipCode || '',
      });
    } catch {
      toast.error('Failed to load dog details');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchDog();
  }, [isAuthenticated, router, fetchDog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTemperamentToggle = (trait: string) => {
    setFormData({
      ...formData,
      temperament: formData.temperament.includes(trait)
        ? formData.temperament.filter(t => t !== trait)
        : [...formData.temperament, trait]
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length + existingImages.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setImages([...images, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingImages.length === 0 && images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();

      data.append('name', formData.name);
      data.append('breed', formData.breed);
      data.append('gender', formData.gender);
      data.append('dateOfBirth', formData.dateOfBirth);
      data.append('weight', formData.weight);
      data.append('color', formData.color);
      data.append('description', formData.description);

      const birthDate = new Date(formData.dateOfBirth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      data.append('age', age.toString());

      data.append('healthInfo[vaccinated]', formData.vaccinated.toString());
      data.append('healthInfo[neutered]', formData.neutered.toString());
      if (formData.vetName) data.append('healthInfo[veterinarian][name]', formData.vetName);
      if (formData.vetContact) data.append('healthInfo[veterinarian][contact]', formData.vetContact);
      if (formData.medicalHistory) data.append('healthInfo[medicalHistory]', formData.medicalHistory);

      data.append('pedigree[registered]', formData.registered.toString());
      if (formData.registrationNumber) data.append('pedigree[registrationNumber]', formData.registrationNumber);
      if (formData.registry) data.append('pedigree[registry]', formData.registry);
      if (formData.sire) data.append('pedigree[sire]', formData.sire);
      if (formData.dam) data.append('pedigree[dam]', formData.dam);

      data.append('breeding[available]', formData.available.toString());
      if (formData.studFee) data.append('breeding[studFee]', formData.studFee);
      data.append('breeding[studFeeNegotiable]', formData.studFeeNegotiable.toString());
      data.append('breeding[previousLitters]', formData.previousLitters);
      formData.temperament.forEach((trait, index) => {
        data.append(`breeding[temperament][${index}]`, trait);
      });

      data.append('location[address]', formData.address);
      data.append('location[city]', formData.city);
      data.append('location[state]', formData.county);
      data.append('location[zipCode]', formData.postcode);
      data.append('location[country]', 'UK');

      // Keep existing images
      existingImages.forEach((img, index) => {
        data.append(`existingImages[${index}]`, img);
      });

      // Add new images
      images.forEach(image => {
        data.append('images', image);
      });

      await dogsApi.update(params.id as string, data);
      toast.success('Dog updated successfully!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update dog';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Dog</h1>
          <p className="text-gray-600 mt-1">Update your dog&apos;s information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Photos</h2>
            
            <div className="mb-4">
              <label className="block w-full">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload images (max 10 total)
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
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Existing Images */}
              {existingImages.map((image, index) => (
                <div key={`existing-${index}`} className="relative">
                  <Image
                    src={image}
                    alt={`Existing ${index + 1}`}
                    width={128}
                    height={128}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}

              {/* New Images */}
              {previews.map((preview, index) => (
                <div key={`new-${index}`} className="relative">
                  <Image
                    src={preview}
                    alt={`New ${index + 1}`}
                    width={128}
                    height={128}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    New
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed *
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (lbs) *
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colour *
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

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input-field"
              />
            </div>
          </div>

          {/* Health Information */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Health Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="vaccinated"
                  id="vaccinated"
                  checked={formData.vaccinated}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="vaccinated" className="ml-2 text-sm text-gray-700">
                  Vaccinated
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="neutered"
                  id="neutered"
                  checked={formData.neutered}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="neutered" className="ml-2 text-sm text-gray-700">
                  Neutered/Spayed
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Veterinarian Name
                  </label>
                  <input
                    type="text"
                    name="vetName"
                    value={formData.vetName}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Veterinarian Contact
                  </label>
                  <input
                    type="text"
                    name="vetContact"
                    value={formData.vetContact}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical History
                </label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  rows={3}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Pedigree */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Pedigree Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="registered"
                  id="registered"
                  checked={formData.registered}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="registered" className="ml-2 text-sm text-gray-700">
                  Registered
                </label>
              </div>

              {formData.registered && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sire (Father)
                    </label>
                    <input
                      type="text"
                      name="sire"
                      value={formData.sire}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dam (Mother)
                    </label>
                    <input
                      type="text"
                      name="dam"
                      value={formData.dam}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Breeding */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Breeding Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="available"
                  id="available"
                  checked={formData.available}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="available" className="ml-2 text-sm text-gray-700">
                  Available for Breeding
                </label>
              </div>

              {formData.available && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Previous Litters
                      </label>
                      <input
                        type="number"
                        name="previousLitters"
                        value={formData.previousLitters}
                        onChange={handleChange}
                        className="input-field"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="studFeeNegotiable"
                      id="studFeeNegotiable"
                      checked={formData.studFeeNegotiable}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="studFeeNegotiable" className="ml-2 text-sm text-gray-700">
                      Stud Fee Negotiable
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperament
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TEMPERAMENT_OPTIONS.map(trait => (
                        <button
                          key={trait}
                          type="button"
                          onClick={() => handleTemperamentToggle(trait)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            formData.temperament.includes(trait)
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {trait}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  County *
                </label>
                <input
                  type="text"
                  name="county"
                  required
                  value={formData.county}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Greater London"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postcode
                </label>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., SW1A 1AA"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? 'Updating...' : 'Update Dog'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}