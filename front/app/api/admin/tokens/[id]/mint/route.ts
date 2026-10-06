import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ethers } from 'ethers';

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

    const { amount, recipient } = await req.json();

    if (!amount || !recipient) {
      return NextResponse.json(
        { error: 'Amount and recipient are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!ethers.isAddress(recipient)) {
      return NextResponse.json(
        { error: 'Invalid recipient address' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const tokens = db.collection('tokens');

    const token = await tokens.findOne({ _id: new ObjectId(params.id) });
    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    // Create provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);

    // Create contract instance
    const contract = new ethers.Contract(
      token.contractAddress,
      token.abi,
      signer
    );

    // Mint tokens
    const tx = await contract.mint(recipient, amount);
    await tx.wait();

    // Update token holders count
    const result = await tokens.updateOne(
      { _id: new ObjectId(params.id) },
      { $inc: { holders: 1 } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transactionHash: tx.hash
    });
  } catch (error) {
    console.error('Token minting error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
