import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Property from '@/models/Property';
import { propertySchema, searchSchema } from '@/lib/validations';
import { ZodError } from 'zod';

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

// GET /api/properties - Get all properties with search and filtering
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    
    // Parse search parameters
    const searchData = {
      query: searchParams.get('query') || undefined,
      city: searchParams.get('city') || undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      listingType: searchParams.get('listingType') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      minBedrooms: searchParams.get('minBedrooms') ? Number(searchParams.get('minBedrooms')) : undefined,
      maxBedrooms: searchParams.get('maxBedrooms') ? Number(searchParams.get('maxBedrooms')) : undefined,
      minBathrooms: searchParams.get('minBathrooms') ? Number(searchParams.get('minBathrooms')) : undefined,
      maxBathrooms: searchParams.get('maxBathrooms') ? Number(searchParams.get('maxBathrooms')) : undefined,
      minArea: searchParams.get('minArea') ? Number(searchParams.get('minArea')) : undefined,
      maxArea: searchParams.get('maxArea') ? Number(searchParams.get('maxArea')) : undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 12
    };
    
    // Validate search parameters
    const validatedSearch = searchSchema.parse(searchData);
    
    // Build MongoDB query
    interface QueryFilter {
      status: string;
      $or?: Array<{
        title?: { $regex: string; $options: string };
        description?: { $regex: string; $options: string };
        'location.address'?: { $regex: string; $options: string };
      }>;
      'location.city'?: { $regex: string; $options: string };
      propertyType?: string;
      listingType?: string;
      price?: {
        $gte?: number;
        $lte?: number;
      };
      'features.bedrooms'?: {
        $gte?: number;
        $lte?: number;
      };
      'features.bathrooms'?: {
        $gte?: number;
        $lte?: number;
      };
      'features.area'?: {
        $gte?: number;
        $lte?: number;
      };
      [key: string]: unknown;
    }
    
    const query: QueryFilter = { status: 'active' };
    
    if (validatedSearch.query) {
      query.$or = [
        { title: { $regex: validatedSearch.query, $options: 'i' } },
        { description: { $regex: validatedSearch.query, $options: 'i' } },
        { 'location.address': { $regex: validatedSearch.query, $options: 'i' } }
      ];
    }
    
    if (validatedSearch.city) {
      query['location.city'] = { $regex: validatedSearch.city, $options: 'i' };
    }
    
    if (validatedSearch.propertyType) {
      query.propertyType = validatedSearch.propertyType;
    }
    
    if (validatedSearch.listingType) {
      query.listingType = validatedSearch.listingType;
    }
    
    if (validatedSearch.minPrice !== undefined || validatedSearch.maxPrice !== undefined) {
      query.price = {};
      if (validatedSearch.minPrice !== undefined) {
        query.price.$gte = validatedSearch.minPrice;
      }
      if (validatedSearch.maxPrice !== undefined) {
        query.price.$lte = validatedSearch.maxPrice;
      }
    }
    
    if (validatedSearch.minBedrooms !== undefined) {
      query['features.bedrooms'] = { $gte: validatedSearch.minBedrooms };
    }
    
    if (validatedSearch.maxBedrooms !== undefined) {
      query['features.bedrooms'] = { ...query['features.bedrooms'], $lte: validatedSearch.maxBedrooms };
    }
    
    if (validatedSearch.minBathrooms !== undefined) {
      query['features.bathrooms'] = { $gte: validatedSearch.minBathrooms };
    }
    
    if (validatedSearch.maxBathrooms !== undefined) {
      query['features.bathrooms'] = { ...query['features.bathrooms'], $lte: validatedSearch.maxBathrooms };
    }
    
    if (validatedSearch.minArea !== undefined || validatedSearch.maxArea !== undefined) {
      query['features.area'] = {};
      if (validatedSearch.minArea !== undefined) {
        query['features.area'].$gte = validatedSearch.minArea;
      }
      if (validatedSearch.maxArea !== undefined) {
        query['features.area'].$lte = validatedSearch.maxArea;
      }
    }
    
    // Calculate pagination
    const page = validatedSearch.page || 1;
    const limit = validatedSearch.limit || 12;
    const skip = (page - 1) * limit;
    
    // Get properties with pagination (without populating createdBy for demo)
    const [properties, totalCount] = await Promise.all([
      Property.find(query)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(query)
    ]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    return NextResponse.json({
      properties,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPreviousPage,
        limit
      }
    });
    
  } catch (error) {
    console.error('Get properties error:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.issues },
        { status: 400 }
      );
    }
    
    // Return mock data for demo if database connection fails
    const mockProperties = [
      {
        _id: '1',
        title: 'Luxury Downtown Apartment',
        price: 2800,
        location: { city: 'New York', state: 'NY' },
        propertyType: 'apartment',
        listingType: 'rent',
        features: { bedrooms: 2, bathrooms: 2, area: 1100 },
        images: [{ url: '/api/placeholder/400/300', alt: 'Property image', isPrimary: true }],
        agent: { name: 'John Smith' },
        featured: true,
        status: 'active',
        views: 145,
        createdAt: new Date('2024-01-15'),
        createdBy: { name: 'Admin' }
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
        featured: false,
        status: 'active',
        views: 89,
        createdAt: new Date('2024-01-10'),
        createdBy: { name: 'Agent' }
      },
      {
        _id: '3',
        title: 'Modern Condo with City View',
        price: 450000,
        location: { city: 'Chicago', state: 'IL' },
        propertyType: 'condo',
        listingType: 'sale',
        features: { bedrooms: 1, bathrooms: 1, area: 850 },
        images: [{ url: '/api/placeholder/400/300', alt: 'Property image', isPrimary: true }],
        agent: { name: 'Mike Wilson' },
        featured: true,
        status: 'active',
        views: 234,
        createdAt: new Date('2024-01-08'),
        createdBy: { name: 'Agent' }
      },
      {
        _id: '4',
        title: 'Spacious Townhouse',
        price: 3200,
        location: { city: 'Miami', state: 'FL' },
        propertyType: 'townhouse',
        listingType: 'rent',
        features: { bedrooms: 3, bathrooms: 2, area: 1800 },
        images: [{ url: '/api/placeholder/400/300', alt: 'Property image', isPrimary: true }],
        agent: { name: 'Lisa Davis' },
        featured: false,
        status: 'active',
        views: 67,
        createdAt: new Date('2024-01-05'),
        createdBy: { name: 'Agent' }
      },
      {
        _id: '5',
        title: 'Luxury Villa with Pool',
        price: 1250000,
        location: { city: 'San Diego', state: 'CA' },
        propertyType: 'villa',
        listingType: 'sale',
        features: { bedrooms: 5, bathrooms: 4, area: 3500 },
        images: [{ url: '/api/placeholder/400/300', alt: 'Property image', isPrimary: true }],
        agent: { name: 'Robert Brown' },
        featured: true,
        status: 'active',
        views: 312,
        createdAt: new Date('2024-01-01'),
        createdBy: { name: 'Agent' }
      },
      {
        _id: '6',
        title: 'Cozy Studio in Downtown',
        price: 1800,
        location: { city: 'Seattle', state: 'WA' },
        propertyType: 'apartment',
        listingType: 'rent',
        features: { bedrooms: 0, bathrooms: 1, area: 500 },
        images: [{ url: '/api/placeholder/400/300', alt: 'Property image', isPrimary: true }],
        agent: { name: 'Emily Chen' },
        featured: false,
        status: 'active',
        views: 156,
        createdAt: new Date('2023-12-28'),
        createdBy: { name: 'Agent' }
      }
    ];
    
    // Return all mock properties since we can't validate search params in error case
    return NextResponse.json({
      properties: mockProperties.slice(0, 12), // Return first 12 properties
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: mockProperties.length,
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 12
      }
    });
  }
}

// POST /api/properties - Create a new property
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // For demo purposes, skip authentication and use a default user
    // In production, uncomment the authentication code below:
    
    // const user = verifyToken(request);
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Authentication required' },
    //     { status: 401 }
    //   );
    // }
    // if (user.role !== 'admin' && user.role !== 'agent') {
    //   return NextResponse.json(
    //     { error: 'Insufficient permissions' },
    //     { status: 403 }
    //   );
    // }
    
    // Demo user for property creation (using a valid ObjectId format)
    const demoUser = { userId: '507f1f77bcf86cd799439011', role: 'admin' };
    
    const body = await request.json();
    
    // Validate the request body
    const validatedData = propertySchema.parse(body);
    
    // Create new property
    const property = new Property({
      ...validatedData,
      createdBy: demoUser.userId
    });
    
    await property.save();
    
    // Return the created property without populating createdBy for demo
    const createdProperty = await Property.findById(property._id).lean();
    
    return NextResponse.json({
      message: 'Property created successfully',
      property: {
        ...createdProperty,
        createdBy: { name: 'Demo User', email: 'demo@example.com' }
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create property error:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
