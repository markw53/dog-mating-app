'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { apiClient, getImageUrl } from '@/lib/api/client';
import { User, MapPin, Mail, Phone, Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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
    address: user?.location?.address || '',
    city: user?.location?.city || '',
    county: user?.location?.state || '',
    postcode: user?.location?.zipCode || '',
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
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
      toast.success('Profile picture updated!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
      toast.error(errorMessage);
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
      const response = await authApi.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.county,
          zipCode: formData.postcode,
          country: 'UK',
        },
      });

      setUser(response.user);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const avatarUrl = user.avatar ? getImageUrl(user.avatar) : null;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <div className="relative inline-block mb-4">
                {avatarUrl ? (
                  <div className="w-30 h-30 rounded-full overflow-hidden mx-auto relative">
                    <Image
                      src={avatarUrl}
                      alt={user.firstName}
                      width={120}
                      height={120}
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-30 h-30 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600">{user.email}</p>

              {user.verified && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Verified User
                  </span>
                </div>
              )}

              <div className="mt-6 pt-6 border-t text-left space-y-3">
                {user.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-sm">
                      {user.location.city}, {user.location.state}
                    </span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-2" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Account Information</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-primary"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="input-field bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                      placeholder="e.g., 07700 900000"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4">Address</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!editing}
                        className="input-field"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          disabled={!editing}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          County
                        </label>
                        <input
                          type="text"
                          name="county"
                          value={formData.county}
                          onChange={handleChange}
                          disabled={!editing}
                          className="input-field"
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
                          disabled={!editing}
                          className="input-field"
                          placeholder="e.g., SW1A 1AA"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {editing && (
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        // Reset form
                        if (user) {
                          setFormData({
                            firstName: user.firstName || '',
                            lastName: user.lastName || '',
                            email: user.email || '',
                            phone: user.phone || '',
                            address: user.location?.address || '',
                            city: user.location?.city || '',
                            county: user.location?.state || '',
                            postcode: user.location?.zipCode || '',
                          });
                        }
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
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