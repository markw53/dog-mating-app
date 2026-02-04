// app/(main)/profile/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { apiClient, getImageUrl } from '@/lib/api/client';
import { UpdateProfileData } from '@/types';
import { 
  User, MapPin, Mail, Phone, Camera, Loader2, Edit, 
  Check, Shield, Calendar, Save, X 
} from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { formatDate } from '@/lib/utils/formatters';
import { AxiosError } from 'axios';

function ProfilePageContent() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || user?.location?.address || '',
    city: user?.city || user?.location?.city || '',
    county: user?.county || user?.location?.state || '',
    postcode: user?.postcode || user?.location?.zipCode || '',
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data.user);
      toast.success('Profile picture updated! 📸');
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: UpdateProfileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        county: formData.county || undefined,
        postcode: formData.postcode || undefined,
        country: 'UK',
      };

      const response = await authApi.updateProfile(updateData);
      setUser(response.user);
      toast.success('Profile updated successfully! ✅');
      setEditing(false);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const avatarUrl = user.avatar ? getImageUrl(user.avatar) : null;

  // Get display location (prefer direct properties, fallback to location object)
  const displayCity = user.city || user.location?.city;
  const displayCounty = user.county || user.location?.state;
  const hasLocation = displayCity || displayCounty;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <Section variant="primary" className="py-12 md:py-16">
        <div className="text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <span className="text-white font-semibold text-sm">👤 Your Profile</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Account Settings
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            Manage your personal information and preferences
          </p>
        </div>
      </Section>

      {/* Main Content */}
      <section className="py-12 -mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card - Sidebar */}
            <div className="lg:col-span-1">
              <Card className="text-center sticky top-4">
                {/* Avatar Section */}
                <div className="relative inline-block mb-6">
                  <div className="relative group">
                    {avatarUrl ? (
                      <div className="w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-white shadow-xl group-hover:scale-105 transition-transform">
                        <Image
                          src={avatarUrl}
                          alt={user.firstName}
                          width={128}
                          height={128}
                          className="rounded-full object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-xl group-hover:scale-105 transition-transform">
                        <User className="h-16 w-16 text-primary-600" />
                      </div>
                    )}
                    <button
                      onClick={handleAvatarClick}
                      disabled={uploadingAvatar}
                      className="absolute bottom-2 right-2 bg-gradient-to-br from-primary-600 to-primary-700 text-white p-3 rounded-full hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 shadow-lg transform hover:scale-110 transition-all"
                      title="Change profile picture"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Camera className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600 mb-4">{user.email}</p>

                {/* Verified Badge */}
                {user.verified && (
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold shadow-md mb-6">
                    <Check className="h-4 w-4 mr-2" />
                    Verified User
                  </div>
                )}

                {/* Quick Info */}
                <div className="pt-6 border-t space-y-4">
                  {user.phone && (
                    <div className="flex items-center text-gray-700 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">{user.phone}</span>
                    </div>
                  )}
                  {hasLocation && (
                    <div className="flex items-center text-gray-700 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">
                        {displayCity}{displayCity && displayCounty ? ', ' : ''}{displayCounty}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-700 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500">Member since</p>
                      <span className="text-sm font-medium">
                        {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-center">
                    <div className="bg-primary-100 p-2 rounded-lg mr-2">
                      <Shield className="h-5 w-5 text-primary-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 capitalize">
                      {user.role.toLowerCase()} Account
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Edit Form - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-xl mr-4">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                      <p className="text-sm text-gray-600">Update your personal details</p>
                    </div>
                  </div>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-primary flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`input-field ${!editing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`input-field ${!editing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          disabled
                          className="input-field pl-10 bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Email cannot be changed for security reasons
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!editing}
                          className={`input-field pl-10 ${!editing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                          placeholder="+44 20 1234 5678"
                        />
                      </div>
                    </div>
                  </div>

                  {editing && (
                    <div className="flex gap-4 pt-4 border-t">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 btn-primary flex items-center justify-center py-3"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          if (user) {
                            setFormData({
                              firstName: user.firstName || '',
                              lastName: user.lastName || '',
                              email: user.email || '',
                              phone: user.phone || '',
                              address: user.address || user.location?.address || '',
                              city: user.city || user.location?.city || '',
                              county: user.county || user.location?.state || '',
                              postcode: user.postcode || user.location?.zipCode || '',
                            });
                          }
                        }}
                        className="flex-1 btn-secondary flex items-center justify-center py-3"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </Card>

              {/* Address Card */}
              <Card>
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 p-3 rounded-xl mr-4">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Address Information</h2>
                    <p className="text-sm text-gray-600">Your location details</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!editing}
                      className={`input-field ${!editing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`input-field ${!editing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="London"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        County
                      </label>
                      <input
                        type="text"
                        name="county"
                        value={formData.county}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`input-field ${!editing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
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
                        disabled={!editing}
                        className={`input-field ${!editing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="SW1A 1AA"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value="United Kingdom"
                        disabled
                        className="input-field bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}