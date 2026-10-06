import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ethers } from 'ethers';
import { VOTING_PLATFORM_ABI } from '@/lib/contracts';

// Helper function to validate private key
function isValidPrivateKey(privateKey: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(privateKey);
}

export async function POST(req: Request) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_RPC_URL) {
      throw new Error('RPC URL not configured');
    }
    if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured');
    }
    if (!process.env.WALLET_PRIVATE_KEY) {
      throw new Error('Wallet private key not configured');
    }
    if (!process.env.SUBSCRIPTION_CODE) {
      throw new Error('Subscription code not configured');
    }

    // Validate private key format
    if (!isValidPrivateKey(process.env.WALLET_PRIVATE_KEY)) {
      throw new Error('Invalid private key format. Must start with 0x and be 64 characters long');
    }

    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      name,
      isPublic,
      isEducational,
      hasNFT,
      endTime,
      allowedEmails
    } = await req.json();

    // Validate input
    if (!name || !endTime) {
      return NextResponse.json(
        { error: 'Name and end time are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const users = db.collection('users');

    // Check user's subscription
    const user = await users.findOne(
      { email: session.user.email },
      { projection: { subscription: 1, walletAddress: 1 } }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check subscription status
    const now = new Date();
    const isSubscriptionActive = user.subscription?.status === 'active' &&
      user.subscription?.expiresAt &&
      new Date(user.subscription.expiresAt) > now;

    if (!isSubscriptionActive) {
      return NextResponse.json(
        { error: 'Active subscription required to create voting' },
        { status: 403 }
      );
    }

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      VOTING_PLATFORM_ABI,
      wallet
    );

    // Create voting on blockchain
    const tx = await contract.createVoting(
      name,
      isPublic,
      isEducational,
      hasNFT,
      Math.floor(new Date(endTime).getTime() / 1000),
      allowedEmails || [],
      process.env.SUBSCRIPTION_CODE
    );

    // Wait for transaction
    await tx.wait();

    // Store voting metadata in MongoDB
    const votings = db.collection('votings');
    await votings.insertOne({
      name,
      isPublic,
      isEducational,
      hasNFT,
      endTime: new Date(endTime),
      allowedEmails: allowedEmails || [],
      createdBy: session.user.email,
      createdAt: new Date(),
      status: 'active',
      transactionHash: tx.hash
    });

    return NextResponse.json({
      success: true,
      transactionHash: tx.hash
    });
  } catch (error) {
    console.error('Voting creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
