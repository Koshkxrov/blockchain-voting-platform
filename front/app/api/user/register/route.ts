import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { hash } from 'bcryptjs';

interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  walletAddress: string;
  privateKey: string;
  role: string;
  createdAt: Date;
  subscription: {
    isActive: boolean;
    expiresAt: null;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Generate a new wallet
    const wallet = ethers.Wallet.createRandom();

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user: User = {
      email,
      password: await hash(password, 10),
      walletAddress: wallet.address,
      privateKey: wallet.privateKey,
      role: 'user',
      createdAt: new Date(),
      subscription: {
        isActive: false,
        expiresAt: null
      }
    };

    const result = await users.insertOne(user);

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      id: result.insertedId,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function hashPassword(password: string): Promise<string> {
  // Implement password hashing using bcrypt or similar
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
