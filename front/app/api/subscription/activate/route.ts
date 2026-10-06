import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';

const SUBSCRIPTION_CODE = process.env.SUBSCRIPTION_CODE;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json(
        { message: 'Subscription code is required' },
        { status: 400 }
      );
    }

    if (!SUBSCRIPTION_CODE) {
      return NextResponse.json(
        { message: 'Subscription service is not configured' },
        { status: 503 }
      );
    }

    if (code !== SUBSCRIPTION_CODE) {
      return NextResponse.json(
        { message: 'Invalid subscription code' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Calculate expiration date (1 year from now)
    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setFullYear(now.getFullYear() + 1);

    // Update user's subscription
    const result = await db.collection('users').updateOne(
      { email: session.user.email },
      {
        $set: {
          subscription: {
            isActive: true,
            status: 'active',
            type: 'unlimited',
            expiresAt: expirationDate
          }
        }
      }
    );

    console.log('Subscription update result:', result);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the update
    const updatedUser = await db.collection('users').findOne(
      { email: session.user.email },
      { projection: { subscription: 1 } }
    );

    console.log('Updated user subscription:', updatedUser?.subscription);

    return NextResponse.json({
      message: 'Subscription activated successfully',
      subscription: updatedUser?.subscription
    });
  } catch (error) {
    console.error('Error activating subscription:', error);
    return NextResponse.json(
      { message: 'Failed to activate subscription' },
      { status: 500 }
    );
  }
}
