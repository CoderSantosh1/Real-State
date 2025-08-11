import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { loginSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate the request body
    const validatedData = loginSchema.parse(body);
    
    // Find user and include password for comparison
    const user = await User.findOne({ email: validatedData.email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check password
    const isValidPassword = await user.comparePassword(validatedData.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    // Prepare user response
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
    
    const response = NextResponse.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
    
    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    
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
