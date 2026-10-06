import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ethers } from 'ethers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const tokens = db.collection('tokens');

    // Get token information
    const token = await tokens.findOne({ _id: new ObjectId(params.id) });
    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    // Create contract instance
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const signer = new ethers.Wallet(session.user.privateKey, provider);
    const contract = new ethers.Contract(
      token.contractAddress,
      ['function mint(address to, uint256 amount)'],
      signer
    );

    // Mint tokens
    await contract.mint(session.user.walletAddress, amount);

    // Update token holders count
    await tokens.updateOne(
      { _id: new ObjectId(params.id) },
      { $inc: { holders: 1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Token minting error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
