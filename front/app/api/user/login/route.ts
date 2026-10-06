import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { error: 'Authentication service is not configured' },
        { status: 503 }
      );
    }

    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // TODO: Validate against MongoDB
    // For now, mock user data
    const user = {
      email,
      walletAddress: '0x...', // Will be fetched from DB
      role: 'user',
      subscription: null
    };

    // Generate JWT token
    const token = jwt.sign(
      {
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      token,
      user: {
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
