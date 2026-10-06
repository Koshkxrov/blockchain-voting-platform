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
    const tokens = db.collection('tokens');

    const tokenList = await tokens.find({}).toArray();

    return NextResponse.json({ tokens: tokenList });
  } catch (error) {
    console.error('Token list error:', error);
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

    const { name, symbol, totalSupply } = await req.json();

    if (!name || !symbol || !totalSupply) {
      return NextResponse.json(
        { error: 'Name, symbol and total supply are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const tokens = db.collection('tokens');

    const token = await tokens.insertOne({
      name,
      symbol,
      totalSupply,
      holders: 0,
      createdAt: new Date(),
      createdBy: session.user.id
    });

    return NextResponse.json({
      success: true,
      tokenId: token.insertedId
    });
  } catch (error) {
    console.error('Token creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
