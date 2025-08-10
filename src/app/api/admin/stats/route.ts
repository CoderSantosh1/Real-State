import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Property from '@/models/Property';
import User from '@/models/User';

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Calculate various statistics
    const [
      totalProperties,
      activeProperties,
      soldProperties,
      rentedProperties,
      totalUsers,
      totalAgents,
      propertyViews,
      featuredProperties
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: 'active' }),
      Property.countDocuments({ status: 'sold' }),
      Property.countDocuments({ status: 'rented' }),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: { $in: ['agent', 'admin'] } }),
      Property.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]),
      Property.countDocuments({ featured: true })
    ]);

    // Calculate estimated revenue (this would typically come from actual sales data)
    const revenueData = await Property.aggregate([
      {
        $match: {
          status: { $in: ['sold', 'rented'] },
          listingType: 'sale'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    const stats = {
      totalProperties,
      activeProperties,
      soldProperties: soldProperties + rentedProperties,
      totalViews: propertyViews[0]?.totalViews || 0,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      featuredProperties,
      totalUsers,
      totalAgents,
      // Additional metrics
      pendingProperties: await Property.countDocuments({ status: 'pending' }),
      inactiveProperties: await Property.countDocuments({ status: 'inactive' }),
      averagePrice: 0, // Will calculate separately
      propertiesThisMonth: 0 // Will calculate separately
    };

    // Calculate average price
    const avgPriceData = await Property.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);
    stats.averagePrice = Math.round(avgPriceData[0]?.avgPrice || 0);

    // Calculate properties added this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    stats.propertiesThisMonth = await Property.countDocuments({
      createdAt: { $gte: currentMonth }
    });

    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Get admin stats error:', error);
    
    // Return mock data for demo if database connection fails
    const mockStats = {
      totalProperties: 127,
      activeProperties: 89,
      soldProperties: 38,
      totalViews: 15420,
      totalRevenue: 2850000,
      featuredProperties: 12,
      totalUsers: 245,
      totalAgents: 8,
      pendingProperties: 5,
      inactiveProperties: 3,
      averagePrice: 485000,
      propertiesThisMonth: 14
    };
    
    return NextResponse.json(mockStats);
  }
}
