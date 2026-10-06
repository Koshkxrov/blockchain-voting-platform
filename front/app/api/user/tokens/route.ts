import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ethers } from 'ethers';
import { VOTING_PLATFORM_ABI } from '@/lib/contracts';

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

    // Get user data
    const user = await users.findOne(
      { email: session.user.email },
      { projection: { walletAddress: 1, _id: 0 } }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
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

    // Get user's token balances
    const tokens = await contract.balanceOfBatch(
      [user.walletAddress],
      [0] // Token IDs to check
    );

    return NextResponse.json({
      tokens: tokens.map((balance: bigint, index: number) => ({
        tokenId: index,
        balance: balance.toString()
      }))
    });
  } catch (error) {
    console.error('Token fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
