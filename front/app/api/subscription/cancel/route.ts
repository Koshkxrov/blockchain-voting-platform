import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Update user's subscription
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          subscription: {
            isActive: false,
            status: 'canceled',
            type: null,
            expiresAt: null
          }
        }
      }
    );

    console.log('Subscription cancellation result:', result);

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
      message: 'Subscription canceled successfully',
      subscription: updatedUser?.subscription
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { message: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
