'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema, type PropertyFormData } from '@/lib/validations';
import { 
  Home, 
  ArrowLeft, 
  Upload, 
  X, 
  MapPin, 
  Building, 
  DollarSign,
  Bed,
  Bath,
  Square,
  Calendar,
  Car,
  Plus,
  Trash2,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Property extends PropertyFormData {
  _id: string;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetchingProperty, setFetchingProperty] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>(['']);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema)
  });

  const watchedListingType = watch('listingType');

  const fetchProperty = useCallback(async () => {
    try {
      setFetchingProperty(true);
      const response = await fetch(`/api/properties/${propertyId}`);
      
      if (!response.ok) {
        throw new Error('Property not found');
      }
      
      const data = await response.json();
      const propertyData = data.property;
      
      setProperty(propertyData);
      
      // Populate form with existing data
      reset({
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price,
        location: propertyData.location,
        propertyType: propertyData.propertyType,
        listingType: propertyData.listingType,
        features: propertyData.features,
        agent: propertyData.agent,
        status: propertyData.status,
        featured: propertyData.featured
      });
      
      // Set amenities
      setAmenities(propertyData.features.amenities || ['']);
      
      // Set existing image previews
      if (propertyData.images && propertyData.images.length > 0) {
        setImagePreviews(propertyData.images.map((img: { url: string }) => img.url));
      }
      
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property data');
      router.push('/admin');
    } finally {
      setFetchingProperty(false);
    }
  }, [propertyId, router, reset]);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, fetchProperty]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const newFiles = [...imageFiles, ...files];
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setImageFiles(newFiles);
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    if (imagePreviews[index] && imagePreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const addAmenity = () => {
    setAmenities([...amenities, '']);
  };

  const updateAmenity = (index: number, value: string) => {
    const newAmenities = [...amenities];
    newAmenities[index] = value;
    setAmenities(newAmenities);
  };

  const removeAmenity = (index: number) => {
    if (amenities.length > 1) {
      setAmenities(amenities.filter((_, i) => i !== index));
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    // In a real application, you would upload to Cloudinary or similar service
    // For now, we'll return placeholder URLs for new images
    return files.map((_, index) => `/api/placeholder/800/600?id=${Date.now()}-${index}`);
  };

  const onSubmit = async (data: PropertyFormData) => {
    setLoading(true);
    
    try {
      // Upload new images if any
      let newImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        newImageUrls = await uploadImages(imageFiles);
      }
      
      // Combine existing images (URLs that don't start with 'blob:') with new image URLs
      const existingImageUrls = imagePreviews.filter(url => !url.startsWith('blob:'));
      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      // Prepare the property data
      const propertyData = {
        ...data,
        features: {
          ...data.features,
          amenities: amenities.filter(a => a.trim() !== '')
        },
        images: allImageUrls.map((url, index) => ({
          url,
          alt: `${data.title} - Image ${index + 1}`,
          isPrimary: index === 0
        }))
      };

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (response.ok) {
        toast.success('Property updated successfully!');
        router.push('/admin');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Property deleted successfully!');
        router.push('/admin');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  if (fetchingProperty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading property data...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-4">The property you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/admin"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Admin</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Home className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">Edit Property</span>
              </div>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Building className="h-6 w-6 mr-2 text-blue-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter property title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the property..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  {...register('propertyType')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="villa">Villa</option>
                  <option value="commercial">Commercial</option>
                  <option value="land">Land</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Type *
                </label>
                <select
                  {...register('listingType')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ({watchedListingType === 'rent' ? 'per month' : 'total'}) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...register('price', { valueAsNumber: true })}
                    type="number"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center">
                <input
                  {...register('featured')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Mark as featured property</span>
              </label>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-blue-600" />
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  {...register('location.address')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full address"
                />
                {errors.location?.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  {...register('location.city')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city"
                />
                {errors.location?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  {...register('location.state')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter state"
                />
                {errors.location?.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.state.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code *
                </label>
                <input
                  {...register('location.zipCode')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter zip code"
                />
                {errors.location?.zipCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.zipCode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Property Features */}
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Property Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <div className="relative">
                  <Bed className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...register('features.bedrooms', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <div className="relative">
                  <Bath className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...register('features.bathrooms', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.5"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (sq ft) *
                </label>
                <div className="relative">
                  <Square className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...register('features.area', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Built
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...register('features.yearBuilt', { valueAsNumber: true })}
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="YYYY"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parking Spaces
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    {...register('features.parking', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Amenities
              </label>
              <div className="space-y-3">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={amenity}
                      onChange={(e) => updateAmenity(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter amenity"
                    />
                    {amenities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAmenity}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Amenity</span>
                </button>
              </div>
            </div>
          </div>

          {/* Agent Information */}
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Agent Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Name *
                </label>
                <input
                  {...register('agent.name')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter agent name"
                />
                {errors.agent?.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.agent.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Email *
                </label>
                <input
                  {...register('agent.email')}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter agent email"
                />
                {errors.agent?.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.agent.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Phone *
                </label>
                <input
                  {...register('agent.phone')}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter agent phone"
                />
                {errors.agent?.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.agent.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Upload className="h-6 w-6 mr-2 text-blue-600" />
              Property Images
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Max 10)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Click to upload images
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG, JPEG up to 10MB each</p>
              </div>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <Loader className="animate-spin h-4 w-4" />
              ) : (
                <Building className="h-4 w-4" />
              )}
              <span>{loading ? 'Updating...' : 'Update Property'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
