import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ethers, Log } from 'ethers';

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
    const tokens = db.collection('tokens');
    const events = db.collection('events');

    const token = await tokens.findOne({ _id: params.id });
    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    // Get event history
    const eventHistory = await events
      .find({ tokenId: params.id })
      .sort({ blockNumber: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      events: eventHistory
    });
  } catch (error) {
    console.error('Event history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const tokens = db.collection('tokens');
    const events = db.collection('events');

    const token = await tokens.findOne({ _id: params.id });
    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    // Create provider
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

    // Create contract instance
    const contract = new ethers.Contract(
      token.contractAddress,
      token.abi,
      provider
    );

    // Get latest block number
    const latestBlock = await provider.getBlockNumber();

    // Get events from the last 1000 blocks
    const fromBlock = Math.max(0, latestBlock - 1000);

    // Get all events
    const filter = contract.filters;
    const logs = await provider.getLogs({
      address: token.contractAddress,
      fromBlock,
      toBlock: latestBlock
    });

    // Process and store events
    const processedEvents = [];

    for (const log of logs) {
      try {
        const parsedLog = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });

        if (!parsedLog) continue;

        const eventData = {
          tokenId: params.id,
          eventType: parsedLog.name,
          args: parsedLog.args,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          timestamp: new Date()
        };

        await events.insertOne(eventData);
        processedEvents.push(eventData);
      } catch (error) {
        console.error('Error parsing log:', error);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      events: processedEvents
    });
  } catch (error) {
    console.error('Event processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
