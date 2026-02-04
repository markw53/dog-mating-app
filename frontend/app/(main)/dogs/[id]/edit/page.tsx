// app/(main)/dogs/[id]/edit/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dogsApi } from '@/lib/api/dogs';
import { Dog, UpdateDogData } from '@/types';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { AxiosError } from 'axios';

const UK_COUNTIES = [
  'Greater London',
  'West Midlands',
  'Greater Manchester',
  'West Yorkshire',
  'Merseyside',
  'South Yorkshire',
  'Tyne and Wear',
  'Bedfordshire',
  'Berkshire',
  'Bristol',
  'Buckinghamshire',
  'Cambridgeshire',
  'Cheshire',
  'Cornwall',
  'Cumbria',
  'Derbyshire',
  'Devon',
  'Dorset',
  'Durham',
  'East Riding of Yorkshire',
  'East Sussex',
  'Essex',
  'Gloucestershire',
  'Hampshire',
  'Herefordshire',
  'Hertfordshire',
  'Isle of Wight',
  'Kent',
  'Lancashire',
  'Leicestershire',
  'Lincolnshire',
  'Norfolk',
  'North Yorkshire',
  'Northamptonshire',
  'Northumberland',
  'Nottinghamshire',
  'Oxfordshire',
  'Rutland',
  'Shropshire',
  'Somerset',
  'Staffordshire',
  'Suffolk',
  'Surrey',
  'Warwickshire',
  'West Sussex',
  'Wiltshire',
  'Worcestershire',
];

const TEMPERAMENT_OPTIONS = [
  'Friendly',
  'Energetic',
  'Calm',
  'Playful',
  'Loyal',
  'Protective',
  'Gentle',
  'Intelligent',
  'Independent',
  'Affectionate',
  'Alert',
  'Patient',
];

export default function EditDogPage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dog, setDog] = useState<Dog | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    dateOfBirth: '',
    age: 0,
    weight: 0,
    color: '',
    description: '',
    
    // Health
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
    studFee: 0,
    studFeeNegotiable: false,
    previousLitters: 0,
    temperament: [] as string[],
    
    // Location
    address: '',
    city: '',
    county: '',
    postcode: '',
    country: 'UK',
  });

  const fetchDog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dogsApi.getById(dogId);
      const dogData = response.dog;
      setDog(dogData);
      
      console.log('📝 Fetched dog data:', dogData);
      
      // Populate form with existing data
      setFormData({
        name: dogData.name || '',
        breed: dogData.breed || '',
        gender: (dogData.gender?.toUpperCase() as 'MALE' | 'FEMALE') || 'MALE',
        dateOfBirth: dogData.dateOfBirth 
          ? new Date(dogData.dateOfBirth).toISOString().split('T')[0] 
          : '',
        age: dogData.age || 0,
        weight: dogData.weight || 0,
        color: dogData.color || '',
        description: dogData.description || '',
        
        // Health
        vaccinated: dogData.vaccinated || false,
        neutered: dogData.neutered || false,
        vetName: dogData.vetName || '',
        vetContact: dogData.vetContact || '',
        medicalHistory: dogData.medicalHistory || '',
        
        // Pedigree
        registered: dogData.registered || false,
        registrationNumber: dogData.registrationNumber || '',
        registry: dogData.registry || '',
        sire: dogData.sire || '',
        dam: dogData.dam || '',
        
        // Breeding
        available: dogData.breeding?.available ?? dogData.available ?? true,
        studFee: dogData.breeding?.studFee ?? dogData.studFee ?? 0,
        studFeeNegotiable: dogData.breeding?.studFeeNegotiable ?? dogData.studFeeNegotiable ?? false,
        previousLitters: dogData.breeding?.previousLitters ?? dogData.previousLitters ?? 0,
        temperament: dogData.temperament || [],
        
        // Location
        address: dogData.location?.address || dogData.address || '',
        city: dogData.location?.city || dogData.city || '',
        county: dogData.location?.state || dogData.county || '',
        postcode: dogData.location?.zipCode || dogData.postcode || '',
        country: dogData.location?.country || dogData.country || 'UK',
      });
      
      console.log('✅ Form populated with data');
    } catch (error) {
      console.error('❌ Failed to fetch dog:', error);
      toast.error('Failed to load dog information');
    } finally {
      setLoading(false);
    }
  }, [dogId]);

  useEffect(() => {
    fetchDog();
  }, [fetchDog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      console.log('📤 Submitting form data:', formData);

      // Create update data with proper types
      const updateData: UpdateDogData = {
        name: formData.name,
        breed: formData.breed,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        age: Number(formData.age),
        weight: Number(formData.weight),
        color: formData.color,
        description: formData.description,
        
        // Health - explicitly convert to boolean
        vaccinated: Boolean(formData.vaccinated),
        neutered: Boolean(formData.neutered),
        vetName: formData.vetName || undefined,
        vetContact: formData.vetContact || undefined,
        medicalHistory: formData.medicalHistory || undefined,
        
        // Pedigree
        registered: Boolean(formData.registered),
        registrationNumber: formData.registrationNumber || undefined,
        registry: formData.registry || undefined,
        sire: formData.sire || undefined,
        dam: formData.dam || undefined,
        
        // Breeding
        available: Boolean(formData.available),
        studFee: formData.studFee ? Number(formData.studFee) : 0,
        studFeeNegotiable: Boolean(formData.studFeeNegotiable),
        previousLitters: Number(formData.previousLitters) || 0,
        temperament: formData.temperament,
        
        // Location
        address: formData.address || undefined,
        city: formData.city,
        county: formData.county,
        postcode: formData.postcode || undefined,
        country: formData.country,
      };

      console.log('📤 Processed update data:', updateData);

      await dogsApi.update(dogId, updateData);
      toast.success('Dog updated successfully!');
      router.push(`/dogs/${dogId}`);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      console.error('❌ Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update dog');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    console.log(`Field ${name} changing:`, { type, value });

    // Handle checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      console.log(`✅ Checkbox ${name} = ${checked}`);
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    }
    // Handle radio buttons
    else if (type === 'radio') {
      const radioValue = value === 'true';
      console.log(`🔘 Radio ${name} = ${radioValue}`);
      setFormData(prev => ({
        ...prev,
        [name]: radioValue,
      }));
    }
    // Handle regular inputs
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTemperamentChange = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      temperament: prev.temperament.includes(trait)
        ? prev.temperament.filter(t => t !== trait)
        : [...prev.temperament, trait],
    }));
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dog information...</p>
        </div>
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Dog not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit {dog?.name}</h1>
          <p className="text-gray-600 mt-2">Update your dog&apos;s information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Breed <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age (years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tell us about your dog's personality, behavior, and any special characteristics..."
              />
            </div>
          </section>

          {/* Location */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address (optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  County <span className="text-red-500">*</span>
                </label>
                <select
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select County</option>
                  {UK_COUNTIES.map(county => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postcode
                </label>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  placeholder="e.g., SW1A 1AA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                  readOnly
                />
              </div>
            </div>
          </section>

          {/* Health Information */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Health Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Vaccinated <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="vaccinated"
                      value="true"
                      checked={formData.vaccinated === true}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="vaccinated"
                      value="false"
                      checked={formData.vaccinated === false}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Neutered <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="neutered"
                      value="true"
                      checked={formData.neutered === true}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="neutered"
                      value="false"
                      checked={formData.neutered === false}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">No</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vet Name
                  </label>
                  <input
                    type="text"
                    name="vetName"
                    value={formData.vetName}
                    onChange={handleChange}
                    placeholder="Your vet's name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vet Contact
                  </label>
                  <input
                    type="text"
                    name="vetContact"
                    value={formData.vetContact}
                    onChange={handleChange}
                    placeholder="Phone or email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical History
                </label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any medical conditions, surgeries, or ongoing treatments..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Pedigree Information */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Pedigree Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Registered <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="registered"
                      value="true"
                      checked={formData.registered === true}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="registered"
                      value="false"
                      checked={formData.registered === false}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {formData.registered && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registry
                    </label>
                    <input
                      type="text"
                      name="registry"
                      value={formData.registry}
                      onChange={handleChange}
                      placeholder="e.g., The Kennel Club"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sire (Father)
                    </label>
                    <input
                      type="text"
                      name="sire"
                      value={formData.sire}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dam (Mother)
                    </label>
                    <input
                      type="text"
                      name="dam"
                      value={formData.dam}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Breeding Information */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Breeding Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available for Breeding <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="available"
                      value="true"
                      checked={formData.available === true}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="available"
                      value="false"
                      checked={formData.available === false}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {formData.available && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stud Fee (£)
                      </label>
                      <input
                        type="number"
                        name="studFee"
                        value={formData.studFee}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Previous Litters
                      </label>
                      <input
                        type="number"
                        name="previousLitters"
                        value={formData.previousLitters}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="studFeeNegotiable"
                        checked={formData.studFeeNegotiable}
                        onChange={handleChange}
                        className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Stud fee is negotiable
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Temperament
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {TEMPERAMENT_OPTIONS.map(trait => (
                        <label key={trait} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.temperament.includes(trait)}
                            onChange={() => handleTemperamentChange(trait)}
                            className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                          />
                          <span className="text-sm text-gray-700">{trait}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex gap-4 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Dog'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}