import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ethers } from 'ethers';
import { VOTING_PLATFORM_ABI } from '@/lib/contracts';

export async function GET(
  req: Request,
  { params }: { params: { voteId: string } }
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

    const votingId = parseInt(params.voteId);
    if (isNaN(votingId)) {
      return NextResponse.json(
        { error: 'Invalid voting ID' },
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

    // Get voting info
    const [
      name,
      isPublic,
      isEducational,
      hasNFT,
      endTime,
      isEnded,
      allowedEmailsCount
    ] = await contract.getVotingInfo(votingId);

    // Check if voting has ended
    if (isEnded || Date.now() > endTime * 1000) {
      return NextResponse.json({
        eligible: false,
        reason: 'Voting has ended'
      });
    }

    // Check if user has required NFT
    if (hasNFT) {
      const balance = await contract.balanceOf(user.walletAddress, votingId);
      if (balance === 0n) {
        return NextResponse.json({
          eligible: false,
          reason: 'NFT token required'
        });
      }
    }

    // Check if user's email is allowed for educational voting
    if (isEducational) {
      const allowedEmails = voting.allowedEmails || [];
      if (!allowedEmails.includes(session.user.email)) {
        return NextResponse.json({
          eligible: false,
          reason: 'Email not allowed'
        });
      }
    }

    return NextResponse.json({
      eligible: true,
      reason: 'User is eligible to vote'
    });
  } catch (error) {
    console.error('Eligibility check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
