import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const users = db.collection('users');

    const subscriptionList = await users.find(
      { subscription: { $exists: true } },
      { projection: { email: 1, subscription: 1 } }
    ).toArray();

    return NextResponse.json({ subscriptions: subscriptionList });
  } catch (error) {
    console.error('Subscription list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, plan, duration } = await req.json();

    if (!userId || !plan || !duration) {
      return NextResponse.json(
        { error: 'User ID, plan and duration are required' },
        { status: 400 }
      );
    }

    if (!['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const users = db.collection('users');

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + (plan === 'monthly' ? 1 : 12));

    const result = await users.updateOne(
      { _id: userId },
      {
        $set: {
          subscription: {
            plan,
            isActive: true,
            startDate: now,
            expiresAt
          }
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
