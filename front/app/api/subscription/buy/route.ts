import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!session.user.id || !ObjectId.isValid(session.user.id)) {
      return NextResponse.json(
        { error: 'Invalid user session' },
        { status: 401 }
      );
    }

    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const users = db.collection('users');

    // Get plan details
    const plans = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/subscription/plans`);
    const availablePlans = await plans.json();
    const selectedPlan = availablePlans.find((plan: any) => plan.id === planId);

    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Calculate expiration date
    const now = new Date();
    const expiresAt = new Date(now);
    if (planId === 'monthly') {
      expiresAt.setMonth(now.getMonth() + 1);
    } else if (planId === 'yearly') {
      expiresAt.setFullYear(now.getFullYear() + 1);
    }

    // Update user subscription
    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          subscription: {
            isActive: true,
            planId,
            expiresAt,
            features: selectedPlan.features
          }
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscription purchase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
