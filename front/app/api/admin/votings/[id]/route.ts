import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const votings = db.collection('votings');

    const voting = await votings.findOne({ _id: params.id });
    if (!voting) {
      return NextResponse.json(
        { error: 'Voting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ voting });
  } catch (error) {
    console.error('Voting details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, description, startDate, endDate, options, status } = await req.json();

    if (!title || !description || !startDate || !endDate || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'All fields are required and at least 2 options must be provided' },
        { status: 400 }
      );
    }

    if (status && !['pending', 'active', 'ended'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const votings = db.collection('votings');

    const result = await votings.updateOne(
      { _id: params.id },
      {
        $set: {
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          options: options.map((option: string) => ({
            text: option,
            votes: 0
          })),
          ...(status && { status })
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Voting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Voting update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const votings = db.collection('votings');

    const result = await votings.deleteOne({ _id: params.id });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Voting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Voting deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
