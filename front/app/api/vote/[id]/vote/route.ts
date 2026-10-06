import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ethers } from 'ethers';
import { VOTING_PLATFORM_ABI } from '@/lib/contracts';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const votingId = parseInt(params.id);
    if (isNaN(votingId)) {
      return NextResponse.json(
        { error: 'Invalid voting ID' },
        { status: 400 }
      );
    }

    const { optionIndex } = await req.json();
    if (!optionIndex || ![1, 2].includes(optionIndex)) {
      return NextResponse.json(
        { error: 'Valid option index (1 or 2) is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    const votings = db.collection('votings');

    // Get user data
    const user = await users.findOne(
      { email: session.user.email },
      { projection: { walletAddress: 1 } }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get voting data
    const voting = await votings.findOne({ _id: votingId });
    if (!voting) {
      return NextResponse.json(
        { error: 'Voting not found' },
        { status: 404 }
      );
    }

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
      VOTING_PLATFORM_ABI,
      provider
    );

    // Cast vote on blockchain
    const tx = await contract.vote(
      votingId,
      optionIndex,
      session.user.email,
      '' // confirmation code (not used in current implementation)
    );

    // Wait for transaction
    await tx.wait();

    return NextResponse.json({
      success: true,
      transactionHash: tx.hash
    });
  } catch (error) {
    console.error('Voting error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
