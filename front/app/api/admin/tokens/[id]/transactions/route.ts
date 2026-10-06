import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ethers } from 'ethers';

export async function GET(
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

    const { db } = await connectToDatabase();
    const tokens = db.collection('tokens');
    const transactions = db.collection('transactions');

    const token = await tokens.findOne({ _id: new ObjectId(params.id) });
    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    // Get transaction history
    const txHistory = await transactions
      .find({ tokenId: params.id })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      transactions: txHistory
    });
  } catch (error) {
    console.error('Transaction history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { from, to, amount, type } = await req.json();

    if (!from || !to || !amount || !type) {
      return NextResponse.json(
        { error: 'From, to, amount and type are required' },
        { status: 400 }
      );
    }

    if (!ethers.isAddress(from) || !ethers.isAddress(to)) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!['transfer', 'mint', 'burn'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const tokens = db.collection('tokens');
    const transactions = db.collection('transactions');

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

    // Execute transaction based on type
    let tx;
    switch (type) {
      case 'transfer':
        tx = await contract.transfer(to, amount);
        break;
      case 'mint':
        tx = await contract.mint(to, amount);
        break;
      case 'burn':
        tx = await contract.burn(amount);
        break;
    }

    await tx.wait();

    // Record transaction
    await transactions.insertOne({
      tokenId: params.id,
      type,
      from,
      to,
      amount: amount.toString(),
      hash: tx.hash,
      timestamp: new Date()
    });

    return NextResponse.json({
      success: true,
      transactionHash: tx.hash
    });
  } catch (error) {
    console.error('Transaction execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
