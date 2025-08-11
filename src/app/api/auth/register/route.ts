import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { userSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate the request body
    const validatedData = userSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }
    
    // Create new user
    const user = new User(validatedData);
    await user.save();
    
    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      isVerified: user.isVerified,
      agentProfile: user.agentProfile,
      createdAt: user.createdAt
    };
    
    return NextResponse.json({
      message: 'User registered successfully',
      user: userResponse
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message.includes('E11000')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
