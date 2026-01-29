'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store/authStore';
import { dogsApi } from '@/lib/api/dogs';
import { 
  Upload, X, Dog as DogIcon, Heart, Shield, 
  MapPin, Loader2, Image as ImageIcon, Check, Info
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import toast from 'react-hot-toast';

const POPULAR_BREEDS = [
  'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'French Bulldog',
  'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 
  'Cocker Spaniel', 'Border Collie', 'Staffordshire Bull Terrier', 'Other'
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
  const currentStep = 1

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
      data.append('location[state]', formData.state);
      data.append('location[zipCode]', formData.zipCode);
      data.append('location[country]', 'UK');

      images.forEach(image => {
        data.append('images', image);
      });

      await dogsApi.create(data);
      toast.success('Dog added successfully! 🎉');
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

  const steps = [
    { number: 1, name: 'Photos & Basic Info', icon: ImageIcon },
    { number: 2, name: 'Health & Pedigree', icon: Shield },
    { number: 3, name: 'Breeding & Location', icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <Section variant="primary" className="py-12 md:py-16">
        <div className="text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <span className="text-white font-semibold text-sm">📝 New Listing</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Add Your Dog
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            Create a detailed profile to connect with potential breeding partners
          </p>
        </div>
      </Section>

      {/* Progress Steps */}
      <section className="py-8 -mt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-all ${
                      currentStep >= step.number
                        ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStep > step.number ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                    </div>
                    <span className={`text-xs md:text-sm font-medium text-center ${
                      currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 rounded ${
                      currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Main Form */}
      <section className="pb-12">
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
                  <p className="text-sm text-gray-600">Upload up to 10 images (first image will be the main photo)</p>
                </div>
              </div>
              
              <label className="block w-full cursor-pointer">
                <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-primary-500 hover:bg-primary-50 transition-all group">
                  <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="h-10 w-10 text-primary-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    Click to upload images
                  </p>
                  <p className="text-sm text-gray-600">
                    PNG, JPG, WEBP up to 10MB each (max 10 images)
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

              {previews.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-700">
                      {previews.length} image{previews.length > 1 ? 's' : ''} uploaded
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-primary-400 transition-all">
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
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
                  <p className="text-sm text-gray-600">Tell us about your dog</p>
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
                    placeholder="e.g., Max"
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
                    Weight (lbs) <span className="text-red-500">*</span>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color <span className="text-red-500">*</span>
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
                    name="state"
                    required
                    value={formData.state}
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
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="SW1A 1AA"
                  />
                </div>
              </div>
            </Card>

            {/* Info Box */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg mr-4">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">Review Before Submission</h3>
                  <p className="text-sm text-blue-800">
                    Your listing will be reviewed by our team before going live. This usually takes 24-48 hours. You&apos;ll receive an email notification once it&apos;s approved.
                  </p>
                </div>
              </div>
            </Card>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 group btn-primary py-4 text-lg font-bold flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Adding Dog...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    Add Dog
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