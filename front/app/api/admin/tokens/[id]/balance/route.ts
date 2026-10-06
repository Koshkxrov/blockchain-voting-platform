import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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

    const { address } = req.nextUrl.searchParams;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      );
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

    // Create provider
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

    // Create contract instance
    const contract = new ethers.Contract(
      token.contractAddress,
      token.abi,
      provider
    );

    // Get balance
    const balance = await contract.balanceOf(address);

    return NextResponse.json({
      address,
      balance: balance.toString()
    });
  } catch (error) {
    console.error('Token balance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
