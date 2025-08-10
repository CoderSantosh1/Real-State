import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Property from '@/models/Property';
import User from '@/models/User';

// GET /api/seed - Seed the database with sample data
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Check if data already exists
    const existingProperties = await Property.countDocuments();
    const existingUsers = await User.countDocuments();
    
    if (existingProperties > 0 && existingUsers > 0) {
      return NextResponse.json({
        message: 'Database already seeded',
        properties: existingProperties,
        users: existingUsers
      });
    }
    
    // Create sample users
    const sampleUsers = [
      {
        name: 'Admin User',
        email: 'admin@estatehub.com',
        password: 'admin123',
        role: 'admin',
        phone: '+1-555-0001',
        isVerified: true
      },
      {
        name: 'John Smith',
        email: 'john.smith@realty.com',
        password: 'agent123',
        role: 'agent',
        phone: '+1-555-0101',
        isVerified: true,
        agentProfile: {
          license: 'RE12345',
          company: 'Premium Realty',
          experience: 8,
          specializations: ['luxury', 'commercial'],
          rating: 4.8,
          reviewCount: 142
        }
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@homes.com',
        password: 'agent123',
        role: 'agent',
        phone: '+1-555-0102',
        isVerified: true,
        agentProfile: {
          license: 'RE67890',
          company: 'Dream Homes Realty',
          experience: 5,
          specializations: ['residential', 'first-time buyers'],
          rating: 4.6,
          reviewCount: 98
        }
      }
    ];
    
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`Created ${createdUsers.length} users`);
    
    // Create sample properties
    const sampleProperties = [
      {
        title: 'Luxury Downtown Penthouse',
        description: 'Stunning penthouse with panoramic city views, featuring premium finishes throughout. This exceptional property offers the ultimate in luxury living with floor-to-ceiling windows, gourmet kitchen, and private terrace.',
        price: 2850000,
        location: {
          address: '123 Fifth Avenue, Penthouse 45',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        propertyType: 'condo',
        listingType: 'sale',
        features: {
          bedrooms: 3,
          bathrooms: 3,
          area: 2200,
          yearBuilt: 2019,
          parking: 2,
          amenities: ['Concierge Service', 'Fitness Center', 'Rooftop Pool', 'Private Elevator', 'Wine Storage']
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop', alt: 'Luxury penthouse living room', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', alt: 'Modern kitchen', isPrimary: false },
          { url: 'https://images.unsplash.com/photo-1540518614846-7eded47ee3f5?w=800&h=600&fit=crop', alt: 'Master bedroom', isPrimary: false }
        ],
        agent: {
          name: 'John Smith',
          email: 'john.smith@realty.com',
          phone: '+1-555-0101'
        },
        status: 'active',
        featured: true,
        createdBy: createdUsers[1]._id,
        views: 245
      },
      {
        title: 'Modern Family Home with Pool',
        description: 'Beautiful 4-bedroom family home in a quiet neighborhood. Features include a sparkling pool, updated kitchen, hardwood floors, and a spacious backyard perfect for entertaining.',
        price: 875000,
        location: {
          address: '456 Maple Street',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210'
        },
        propertyType: 'house',
        listingType: 'sale',
        features: {
          bedrooms: 4,
          bathrooms: 3,
          area: 2800,
          yearBuilt: 2015,
          parking: 2,
          amenities: ['Swimming Pool', 'Home Theater', 'Walk-in Closets', 'Hardwood Floors', 'Garden']
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop', alt: 'Beautiful family home exterior', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop', alt: 'Spacious living room', isPrimary: false },
          { url: 'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800&h=600&fit=crop', alt: 'Backyard with pool', isPrimary: false }
        ],
        agent: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@homes.com',
          phone: '+1-555-0102'
        },
        status: 'active',
        featured: true,
        createdBy: createdUsers[2]._id,
        views: 189
      },
      {
        title: 'Cozy Studio in Arts District',
        description: 'Charming studio apartment in the heart of the Arts District. Perfect for young professionals, featuring exposed brick walls, high ceilings, and modern appliances. Walking distance to galleries, cafes, and public transit.',
        price: 2200,
        location: {
          address: '789 Industrial Way, Unit 12',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60607'
        },
        propertyType: 'apartment',
        listingType: 'rent',
        features: {
          bedrooms: 0,
          bathrooms: 1,
          area: 650,
          yearBuilt: 2018,
          parking: 0,
          amenities: ['Exposed Brick', 'High Ceilings', 'In-unit Laundry', 'Bike Storage', 'Rooftop Deck']
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop', alt: 'Cozy studio apartment', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop', alt: 'Kitchen area', isPrimary: false }
        ],
        agent: {
          name: 'John Smith',
          email: 'john.smith@realty.com',
          phone: '+1-555-0101'
        },
        status: 'active',
        featured: false,
        createdBy: createdUsers[1]._id,
        views: 156
      },
      {
        title: 'Luxury Waterfront Villa',
        description: 'Exquisite waterfront villa with private beach access. This architectural masterpiece features soaring ceilings, floor-to-ceiling windows, gourmet kitchen, and infinity pool overlooking the ocean.',
        price: 3850000,
        location: {
          address: '321 Ocean Boulevard',
          city: 'Miami',
          state: 'FL',
          zipCode: '33139'
        },
        propertyType: 'villa',
        listingType: 'sale',
        features: {
          bedrooms: 5,
          bathrooms: 6,
          area: 4500,
          yearBuilt: 2020,
          parking: 3,
          amenities: ['Private Beach', 'Infinity Pool', 'Wine Cellar', 'Home Gym', 'Guest House', 'Boat Dock']
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop', alt: 'Luxury waterfront villa', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop', alt: 'Ocean view terrace', isPrimary: false },
          { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop', alt: 'Infinity pool', isPrimary: false }
        ],
        agent: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@homes.com',
          phone: '+1-555-0102'
        },
        status: 'active',
        featured: true,
        createdBy: createdUsers[2]._id,
        views: 412
      },
      {
        title: 'Downtown Loft with City Views',
        description: 'Stunning loft conversion in historic building. Features original architectural details, exposed beams, polished concrete floors, and floor-to-ceiling windows with amazing city views.',
        price: 3800,
        location: {
          address: '654 Broadway, Loft 8',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98102'
        },
        propertyType: 'apartment',
        listingType: 'rent',
        features: {
          bedrooms: 1,
          bathrooms: 1,
          area: 1200,
          yearBuilt: 1925,
          parking: 1,
          amenities: ['Exposed Beams', 'Concrete Floors', 'City Views', 'Historic Building', 'Secure Entry']
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', alt: 'Industrial loft apartment', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop', alt: 'Open floor plan', isPrimary: false }
        ],
        agent: {
          name: 'John Smith',
          email: 'john.smith@realty.com',
          phone: '+1-555-0101'
        },
        status: 'active',
        featured: false,
        createdBy: createdUsers[1]._id,
        views: 87
      },
      {
        title: 'Suburban Townhouse Community',
        description: 'Brand new townhouse in family-friendly community. Features include 3 bedrooms, 2.5 baths, attached garage, and access to community amenities including playground and walking trails.',
        price: 425000,
        location: {
          address: '147 Community Drive',
          city: 'Austin',
          state: 'TX',
          zipCode: '78704'
        },
        propertyType: 'townhouse',
        listingType: 'sale',
        features: {
          bedrooms: 3,
          bathrooms: 3,
          area: 1800,
          yearBuilt: 2023,
          parking: 2,
          amenities: ['Attached Garage', 'Community Pool', 'Playground', 'Walking Trails', 'New Construction']
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop', alt: 'Modern townhouse', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', alt: 'Modern kitchen', isPrimary: false }
        ],
        agent: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@homes.com',
          phone: '+1-555-0102'
        },
        status: 'active',
        featured: false,
        createdBy: createdUsers[2]._id,
        views: 134
      }
    ];
    
    const createdProperties = await Property.insertMany(sampleProperties);
    console.log(`Created ${createdProperties.length} properties`);
    
    return NextResponse.json({
      message: 'Database seeded successfully!',
      users: createdUsers.length,
      properties: createdProperties.length,
      data: {
        users: createdUsers.map(u => ({ _id: u._id, name: u.name, email: u.email, role: u.role })),
        properties: createdProperties.map(p => ({ _id: p._id, title: p.title, price: p.price, location: p.location }))
      }
    });
    
  } catch (error) {
    console.error('Seed database error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed database', 
        details: error instanceof Error ? error.message : 'Unknown error',
        note: 'Make sure your MongoDB connection is working properly'
      },
      { status: 500 }
    );
  }
}
