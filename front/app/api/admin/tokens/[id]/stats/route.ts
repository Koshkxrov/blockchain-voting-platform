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

    // Get total supply
    const totalSupply = await contract.totalSupply();

    // Get transaction statistics
    const txStats = await transactions.aggregate([
      { $match: { tokenId: params.id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: { $toDouble: '$amount' } }
        }
      }
    ]).toArray();

    // Get daily transaction volume
    const dailyVolume = await transactions.aggregate([
      { $match: { tokenId: params.id } },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 },
          volume: { $sum: { $toDouble: '$amount' } }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 30 }
    ]).toArray();

    // Get top holders
    const topHolders = await transactions.aggregate([
      { $match: { tokenId: params.id } },
      {
        $group: {
          _id: '$to',
          balance: { $sum: { $toDouble: '$amount' } }
        }
      },
      { $sort: { balance: -1 } },
      { $limit: 10 }
    ]).toArray();

    return NextResponse.json({
      totalSupply: totalSupply.toString(),
      transactionStats: txStats,
      dailyVolume,
      topHolders
    });
  } catch (error) {
    console.error('Token statistics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
