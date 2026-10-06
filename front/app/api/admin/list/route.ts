import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const users = db.collection('users');

    // Check if requester is admin
    const requester = await users.findOne(
      { email: session.user.email },
      { projection: { role: 1 } }
    );

    if (!requester || requester.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can view this list' },
        { status: 403 }
      );
    }

    // Get all admins and staff members
    const admins = await users.find(
      { role: { $in: ['admin', 'staff'] } },
      { projection: { email: 1, role: 1, _id: 0 } }
    ).toArray();

    return NextResponse.json({
      admins: admins.map(admin => ({
        email: admin.email,
        role: admin.role
      }))
    });
  } catch (error) {
    console.error('Admin list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
