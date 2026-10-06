import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ethers } from 'ethers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { VotingTokenArtifact } from '@/lib/artifacts';

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
        { error: 'Name, symbol, and total supply are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const tokens = db.collection('tokens');

    // Create provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);

    // Get the contract factory
    const factory = new ethers.ContractFactory(
      VotingTokenArtifact.abi,
      VotingTokenArtifact.bytecode,
      signer
    );

    // Deploy the contract
    const tokenContract = await factory.deploy(
      name,
      symbol,
      totalSupply,
      session.user.walletAddress // owner
    );

    // Wait for deployment to complete
    await tokenContract.waitForDeployment();

    // Get the contract address
    const contractAddress = await tokenContract.getAddress();

    // Save token information to database
    const token = {
      name,
      symbol,
      totalSupply,
      contractAddress,
      owner: session.user.walletAddress,
      createdAt: new Date(),
      holders: 0,
      abi: VotingTokenArtifact.abi
    };

    const result = await tokens.insertOne(token);

    return NextResponse.json({
      id: result.insertedId,
      ...token
    });
  } catch (error) {
    console.error('Token creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
