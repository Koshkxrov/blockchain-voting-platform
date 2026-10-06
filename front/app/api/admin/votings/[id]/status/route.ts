import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const users = db.collection('users');
    const user = await users.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    if (!['pending', 'active', 'ended', 'deleted', 'blocked'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const votings = db.collection('votings');
    const voting = await votings.findOne({ id: Number(params.id) });
    if (!voting) {
      return NextResponse.json(
        { error: 'Voting not found' },
        { status: 404 }
      );
    }

    // Validate status transition
    if (voting.status === 'ended' && status !== 'ended') {
      return NextResponse.json(
        { error: 'Cannot reactivate ended voting' },
        { status: 400 }
      );
    }

    if (voting.status === 'active' && status === 'pending') {
      return NextResponse.json(
        { error: 'Cannot set active voting to pending' },
        { status: 400 }
      );
    }

    const result = await votings.updateOne(
      { id: Number(params.id) },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Voting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Voting status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
