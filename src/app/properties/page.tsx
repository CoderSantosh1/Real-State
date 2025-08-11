'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Star,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Property {
  _id: string;
  title: string;
  price: number;
  location: {
    city: string;
    state: string;
  };
  propertyType: string;
  listingType: string;
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number;
  };
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  agent: {
    name: string;
  };
  featured: boolean;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('propertyType') || '');
  const [selectedListingType, setSelectedListingType] = useState(searchParams.get('listingType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCity) params.append('city', selectedCity);
      if (selectedType) params.append('propertyType', selectedType);
      if (selectedListingType) params.append('listingType', selectedListingType);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const response = await fetch(`/api/properties?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Fallback with mock data for demo
      setProperties([
        {
          _id: '1',
          title: 'Modern Downtown Apartment',
          price: 2500,
          location: { city: 'New York', state: 'NY' },
          propertyType: 'apartment',
          listingType: 'rent',
          features: { bedrooms: 2, bathrooms: 2, area: 1100 },
          images: [{ url: '/api/placeholder/400/300', alt: 'Property image', isPrimary: true }],
          agent: { name: 'John Smith' },
          featured: true
        },
        {
          _id: '2',
          title: 'Beautiful Family House',
          price: 750000,
          location: { city: 'Los Angeles', state: 'CA' },
          propertyType: 'house',
          listingType: 'sale',
          features: { bedrooms: 4, bathrooms: 3, area: 2400 },
          images: [{ url: '/api/placeholder/400/300', alt: 'Property image', isPrimary: true }],
          agent: { name: 'Sarah Johnson' },
          featured: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCity, selectedType, selectedListingType, minPrice, maxPrice, currentPage]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [searchQuery, selectedCity, selectedType, selectedListingType, minPrice, maxPrice]);

  const handleSearch = () => {
    fetchProperties();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price: number, listingType: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    
    return listingType === 'rent' ? `${formatted}/month` : formatted;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-blue-600" />
              <Link href="/" className="text-2xl font-bold text-gray-900">
                EstateHub
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
              <Link href="/properties" className="text-blue-600 font-semibold">Properties</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About</Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 transition-colors">Login</Link>
              <Link href="/admin" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Admin Panel</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Property</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing properties for sale and rent in your desired location
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any City</option>
              <option value="New York">New York</option>
              <option value="Los Angeles">Los Angeles</option>
              <option value="Chicago">Chicago</option>
              <option value="Miami">Miami</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Property Type</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="villa">Villa</option>
            </select>

            <select
              value={selectedListingType}
              onChange={(e) => setSelectedListingType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any Type</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>

            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Search
            </button>
          </div>

          {/* Price Range */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Price Range:</label>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {pagination.totalCount} Properties Found
          </h2>
          <div className="text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Home className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600">Try adjusting your search criteria to find more properties.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property) => (
                <div key={property._id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={property.images.find(img => img.isPrimary)?.url || '/api/placeholder/400/300'}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {property.featured && (
                      <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold capitalize">
                      {property.listingType}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{property.title}</h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="text-sm">{property.location.city}, {property.location.state}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Bed className="h-3 w-3 mr-1" />
                        <span>{property.features.bedrooms}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-3 w-3 mr-1" />
                        <span>{property.features.bathrooms}</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="h-3 w-3 mr-1" />
                        <span>{property.features.area.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-blue-600">
                        {formatPrice(property.price, property.listingType)}
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      Listed by <span className="font-medium">{property.agent.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const page = i + 1;
                  const isCurrentPage = page === pagination.currentPage;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isCurrentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  );
}
