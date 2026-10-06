import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ethers } from 'ethers';
import { VOTING_PLATFORM_ABI } from '@/lib/contracts';

export async function GET(
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

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const votings = db.collection('votings');

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

    // Get voting results from blockchain
    const results = await contract.getVotingResults(votingId);

    // Get voting info to check if it's ended
    const [
      name,
      isPublic,
      isEducational,
      hasNFT,
      endTime,
      isEnded,
      allowedEmailsCount
    ] = await contract.getVotingInfo(votingId);

    return NextResponse.json({
      id: votingId,
      name,
      isPublic,
      isEducational,
      hasNFT,
      endTime: new Date(endTime * 1000),
      isEnded,
      allowedEmailsCount,
      results: {
        option1: results[0].toString(),
        option2: results[1].toString()
      },
      totalVotes: (Number(results[0]) + Number(results[1])).toString()
    });
  } catch (error) {
    console.error('Voting results error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
