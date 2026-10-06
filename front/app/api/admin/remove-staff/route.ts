import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Here you would update the user's role in your database
    // For example:
    // await db.users.update({ email }, { role: 'user' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing staff role:', error);
    return NextResponse.json(
      { error: 'Failed to remove staff role' },
      { status: 500 }
    );
  }
}
