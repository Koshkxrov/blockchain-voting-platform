import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
      subscription: {
        active: boolean;
        expiresAt: string;
        type: string;
      };
    };

    if (!decoded.subscription) {
      return NextResponse.json({ active: false });
    }

    const now = new Date();
    const expiresAt = new Date(decoded.subscription.expiresAt);
    const isActive = decoded.subscription.active && expiresAt > now;

    return NextResponse.json({
      active: isActive,
      subscription: {
        ...decoded.subscription,
        active: isActive
      }
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}
