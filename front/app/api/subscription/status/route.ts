import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.email) {
      console.log('No user email in session');
      return NextResponse.json({ isActive: false }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne(
      { email: session.user.email },
      { projection: { subscription: 1 } }
    );

    console.log('User from DB:', user);

    if (!user) {
      console.log('User not found in DB');
      return NextResponse.json({ isActive: false }, { status: 404 });
    }

    console.log('User subscription:', user.subscription);

    const isActive = user.subscription?.isActive || false;
    const expiresAt = user.subscription?.expiresAt;

    // Check if subscription is active and not expired
    const isValid = isActive && (!expiresAt || new Date(expiresAt) > new Date());

    console.log('Subscription status:', {
      isActive,
      expiresAt,
      isValid
    });

    return NextResponse.json({
      isActive: isValid,
      expiresAt: expiresAt
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
