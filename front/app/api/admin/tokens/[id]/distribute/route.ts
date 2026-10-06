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

    const { recipients } = await req.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients array is required' },
        { status: 400 }
      );
    }

    // Validate all recipient addresses
    for (const recipient of recipients) {
      if (!recipient.address || !ethers.isAddress(recipient.address)) {
        return NextResponse.json(
          { error: 'Invalid recipient address' },
          { status: 400 }
        );
      }
      if (!recipient.amount || recipient.amount <= 0) {
        return NextResponse.json(
          { error: 'Invalid amount for recipient' },
          { status: 400 }
        );
      }
    }

    const { db } = await connectToDatabase();
    const tokens = db.collection('tokens');

    const token = await tokens.findOne({ _id: params.id });
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

    // Distribute tokens to each recipient
    const transactions = [];
    for (const recipient of recipients) {
      const tx = await contract.transfer(recipient.address, recipient.amount);
      await tx.wait();
      transactions.push(tx.hash);
    }

    // Update token holders count
    const result = await tokens.updateOne(
      { _id: params.id },
      { $inc: { holders: recipients.length } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transactionHashes: transactions
    });
  } catch (error) {
    console.error('Token distribution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
