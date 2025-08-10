'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  Star,
  TrendingUp,
  Users,
  Building,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X
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
  status: string;
  featured: boolean;
  views: number;
  createdAt: string;
  agent: {
    name: string;
  };
}

interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  totalViews: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeProperties: 0,
    soldProperties: 0,
    totalViews: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchProperties();
    fetchStats();
  }, []);

  const fetchProperties = async () => {
    try {
      // In a real app, this would require authentication
      const response = await fetch('/api/admin/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Fallback with mock data for demo
      setProperties([
        {
          _id: '1',
          title: 'Luxury Downtown Condo',
          price: 850000,
          location: { city: 'New York', state: 'NY' },
          propertyType: 'condo',
          listingType: 'sale',
          features: { bedrooms: 2, bathrooms: 2, area: 1200 },
          status: 'active',
          featured: true,
          views: 245,
          createdAt: '2024-01-15',
          agent: { name: 'John Smith' }
        },
        {
          _id: '2',
          title: 'Modern Family Home',
          price: 650000,
          location: { city: 'Los Angeles', state: 'CA' },
          propertyType: 'house',
          listingType: 'sale',
          features: { bedrooms: 4, bathrooms: 3, area: 2400 },
          status: 'active',
          featured: false,
          views: 189,
          createdAt: '2024-01-10',
          agent: { name: 'Sarah Johnson' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // In a real app, this would require authentication
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback with mock data for demo
      setStats({
        totalProperties: 127,
        activeProperties: 89,
        soldProperties: 38,
        totalViews: 15420,
        totalRevenue: 2850000
      });
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        // In a real app, this would be an actual API call
        setProperties(properties.filter(p => p._id !== id));
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  const toggleFeatured = async (id: string) => {
    try {
      // In a real app, this would be an actual API call
      setProperties(properties.map(p => 
        p._id === id ? { ...p, featured: !p.featured } : p
      ));
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || property.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-6 px-6">
          <div className="space-y-2">
            <a href="#" className="flex items-center space-x-3 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              <TrendingUp className="h-5 w-5" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg">
              <Building className="h-5 w-5" />
              <span>Properties</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg">
              <Users className="h-5 w-5" />
              <span>Users</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </a>
          </div>
          
          <div className="mt-8 pt-8 border-t">
            <Link
              href="/"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg"
            >
              <Home className="h-5 w-5" />
              <span>Back to Site</span>
            </Link>
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-red-600 hover:bg-gray-50 px-3 py-2 rounded-lg">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/properties/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Property</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeProperties}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sold Properties</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.soldProperties}</p>
                </div>
                <Home className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalViews.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-green-700">{formatPrice(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-700" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Properties Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Property</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Location</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Price</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Views</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-4 px-6">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredProperties.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 px-6 text-center text-gray-500">
                        No properties found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProperties.map((property) => (
                      <tr key={property._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{property.title}</h3>
                              <p className="text-sm text-gray-500 capitalize">{property.propertyType} • {property.listingType}</p>
                            </div>
                            {property.featured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{property.location.city}, {property.location.state}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-lg text-blue-600">
                            {formatPrice(property.price)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize
                            ${property.status === 'active' ? 'bg-green-100 text-green-800' :
                              property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              property.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'}
                          `}>
                            {property.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center text-gray-600">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{property.views}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleFeatured(property._id)}
                              className={`p-2 rounded-lg transition-colors ${
                                property.featured 
                                  ? 'text-yellow-600 hover:bg-yellow-50' 
                                  : 'text-gray-400 hover:bg-gray-50'
                              }`}
                              title={property.featured ? 'Remove from featured' : 'Mark as featured'}
                            >
                              <Star className={`h-4 w-4 ${property.featured ? 'fill-current' : ''}`} />
                            </button>
                            <Link
                              href={`/admin/properties/edit/${property._id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit property"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProperty(property._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete property"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <Link
                              href={`/properties/${property._id}`}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="View property"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
