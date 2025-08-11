import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

// GET /api/test-db - Test database connection
export async function GET() {
  try {
    console.log('Testing database connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    await connectToDatabase();
    
    return NextResponse.json({
      success: true,
      message: '✅ Database connection successful!',
      timestamp: new Date().toISOString(),
      mongoUri: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 
        'Not configured'
    });
    
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: '❌ Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      mongoUri: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 
        'Not configured',
      troubleshooting: {
        steps: [
          '1. Check your .env.local file',
          '2. Make sure MONGODB_URI is set correctly',
          '3. If using MongoDB Atlas, check your IP whitelist',
          '4. Verify your database credentials',
          '5. Ensure your database cluster is running'
        ],
        commonIssues: [
          'Local MongoDB not running (currently showing localhost:27017)',
          'Wrong connection string format',
          'Network/firewall issues',
          'Invalid credentials'
        ]
      }
    }, { status: 500 });
  }
}
