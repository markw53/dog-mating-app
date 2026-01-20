'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store/authStore';
import { dogsApi } from '@/lib/api/dogs';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const POPULAR_BREEDS = [
  'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'French Bulldog',
  'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Other'
];

const TEMPERAMENT_OPTIONS = [
  'Friendly', 'Gentle', 'Energetic', 'Calm', 'Loyal', 'Intelligent',
  'Protective', 'Playful', 'Independent', 'Affectionate'
];

export default function AddDogPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    gender: 'male' as 'male' | 'female',
    dateOfBirth: '',
    weight: '',
    color: '',
    description: '',
    
    // Health Info
    vaccinated: false,
    neutered: false,
    vetName: '',
    vetContact: '',
    medicalHistory: '',
    
    // Pedigree
    registered: false,
    registrationNumber: '',
    registry: '',
    sire: '',
    dam: '',
    
    // Breeding
    available: true,
    studFee: '',
    studFeeNegotiable: false,
    previousLitters: '0',
    temperament: [] as string[],
    
    // Location
    address: user?.location?.address || '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    zipCode: user?.location?.zipCode || '',
  });

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
    if (files.length + images.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setImages([...images, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // Basic info
      data.append('name', formData.name);
      data.append('breed', formData.breed);
      data.append('gender', formData.gender);
      data.append('dateOfBirth', formData.dateOfBirth);
      data.append('weight', formData.weight);
      data.append('color', formData.color);
      data.append('description', formData.description);

      // Calculate age
      const birthDate = new Date(formData.dateOfBirth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      data.append('age', age.toString());

      // Health info
      data.append('healthInfo[vaccinated]', formData.vaccinated.toString());
      data.append('healthInfo[neutered]', formData.neutered.toString());
      if (formData.vetName) data.append('healthInfo[veterinarian][name]', formData.vetName);
      if (formData.vetContact) data.append('healthInfo[veterinarian][contact]', formData.vetContact);
      if (formData.medicalHistory) data.append('healthInfo[medicalHistory]', formData.medicalHistory);

      // Pedigree
      data.append('pedigree[registered]', formData.registered.toString());
      if (formData.registrationNumber) data.append('pedigree[registrationNumber]', formData.registrationNumber);
      if (formData.registry) data.append('pedigree[registry]', formData.registry);
      if (formData.sire) data.append('pedigree[sire]', formData.sire);
      if (formData.dam) data.append('pedigree[dam]', formData.dam);

      // Breeding
      data.append('breeding[available]', formData.available.toString());
      if (formData.studFee) data.append('breeding[studFee]', formData.studFee);
      data.append('breeding[studFeeNegotiable]', formData.studFeeNegotiable.toString());
      data.append('breeding[previousLitters]', formData.previousLitters);
      formData.temperament.forEach((trait, index) => {
        data.append(`breeding[temperament][${index}]`, trait);
      });

      // Location
      data.append('location[address]', formData.address);
      data.append('location[city]', formData.city);
      data.append('location[state]', formData.state);
      data.append('location[zipCode]', formData.zipCode);
      data.append('location[country]', 'USA');

      // Images
      images.forEach(image => {
        data.append('images', image);
      });

      await dogsApi.create(data);
      toast.success('Dog added successfully!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const message = error instanceof Object && 'response' in error && error.response instanceof Object && 'data' in error.response && error.response.data instanceof Object && 'message' in error.response.data
        ? (error.response.data as { message: string }).message
        : 'Failed to add dog';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Dog</h1>
          <p className="text-gray-600 mt-1">Fill in the details about your dog</p>
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
                    Click to upload images (max 10)
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

            {previews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      width={128}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
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
              </div>
            )}
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
                  placeholder="e.g., Max"
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
                  placeholder="e.g., 65"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color *
                </label>
                <input
                  type="text"
                  name="color"
                  required
                  value={formData.color}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Golden"
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
                placeholder="Tell us about your dog..."
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
                  placeholder="Any medical conditions or history..."
                />
              </div>
            </div>
          </div>

          {/* Pedigree Information */}
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
                <>
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
                        placeholder="e.g., AKC"
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
                </>
              )}
            </div>
          </div>

          {/* Breeding Information */}
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
                        Stud Fee ($)
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
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Adding Dog...' : 'Add Dog'}
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