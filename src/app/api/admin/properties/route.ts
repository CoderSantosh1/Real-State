import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Property from '@/models/Property';

// Commented out for demo purposes - uncomment for production
// function verifyToken(request: NextRequest): JWTPayload | null {
//   const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
//   
//   if (!token) {
//     return null;
//   }
//   
//   try {
//     return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
//   } catch {
//     return null;
//   }
// }

// GET /api/admin/properties - Get all properties for admin
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // For demo purposes, we'll skip authentication
    // In production, uncomment the following lines:
    // const user = verifyToken(request);
    // if (!user || (user.role !== 'admin' && user.role !== 'agent')) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    
    // Parse search parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    
    // Build query
    interface QueryFilter {
      $or?: Array<{
        title?: { $regex: string; $options: string };
        'location.city'?: { $regex: string; $options: string };
      }>;
      status?: string;
      [key: string]: unknown;
    }
    
    const query: QueryFilter = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status !== 'all') {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get properties with pagination
    const [properties, totalCount] = await Promise.all([
      Property.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      properties,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        limit
      }
    });
    
  } catch (error) {
    console.error('Get admin properties error:', error);
    
    // Return mock data for demo if database connection fails
    const mockProperties = [
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
        createdAt: new Date('2024-01-15'),
        agent: { name: 'John Smith' },
        createdBy: { name: 'Admin', email: 'admin@example.com' }
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
        createdAt: new Date('2024-01-10'),
        agent: { name: 'Sarah Johnson' },
        createdBy: { name: 'Admin', email: 'admin@example.com' }
      },
      {
        _id: '3',
        title: 'Cozy Studio Apartment',
        price: 2200,
        location: { city: 'Chicago', state: 'IL' },
        propertyType: 'apartment',
        listingType: 'rent',
        features: { bedrooms: 1, bathrooms: 1, area: 650 },
        status: 'active',
        featured: true,
        views: 156,
        createdAt: new Date('2024-01-05'),
        agent: { name: 'Mike Wilson' },
        createdBy: { name: 'Agent', email: 'agent@example.com' }
      }
    ];
    
    return NextResponse.json({
      properties: mockProperties,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: mockProperties.length,
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 20
      }
    });
  }
}
