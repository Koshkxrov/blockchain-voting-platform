import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ethers } from 'ethers';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

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

    const { amount, recipients } = await req.json();

    if (!amount || amount <= 0 || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: 'Valid amount and recipients array are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const tokens = db.collection('tokens');

    // Get token information
    const token = await tokens.findOne({ _id: params.id });
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
      ['function transfer(address to, uint256 amount)'],
      signer
    );

    // Distribute tokens to recipients
    for (const recipient of recipients) {
      await contract.transfer(recipient, amount);
    }

    // Update token holders count
    await tokens.updateOne(
      { _id: params.id },
      { $inc: { holders: recipients.length } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Token distribution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
