import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    const votings = db.collection('votings');

    const votingList = await votings.find({}).toArray();

    return NextResponse.json({ votings: votingList });
  } catch (error) {
    console.error('Voting list error:', error);
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

    const { title, description, startDate, endDate, options } = await req.json();

    if (!title || !description || !startDate || !endDate || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'All fields are required and at least 2 options must be provided' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const votings = db.collection('votings');

    const voting = await votings.insertOne({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      options: options.map((option: string) => ({
        text: option,
        votes: 0
      })),
      status: 'pending',
      totalVotes: 0,
      createdAt: new Date(),
      createdBy: session.user.id
    });

    return NextResponse.json({
      success: true,
      votingId: voting.insertedId
    });
  } catch (error) {
    console.error('Voting creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
