import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getContract } from '@/lib/contract';
import { keccak256, toUtf8Bytes } from 'ethers';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { choice, email } = body;

    const contract = await getContract();
    const voting = await contract.votings(params.id);

    if (!voting) {
      return NextResponse.json(
        { error: 'Voting not found' },
        { status: 404 }
      );
    }

    if (!voting.isActive) {
      return NextResponse.json(
        { error: 'Voting is not active' },
        { status: 400 }
      );
    }

    // For private voting, we need the email
    if (voting.isPrivate && !email) {
      return NextResponse.json(
        { error: 'Email is required for private voting' },
        { status: 400 }
      );
    }

    // Проверка email через БД для приватного голосования
    if (voting.isPrivate) {
      const { db } = await connectToDatabase();
      const votingsCollection = db.collection('votings');
      let votingDoc = null;
      try {
        const { ObjectId } = await import('mongodb');
        if (ObjectId.isValid(params.id)) {
          votingDoc = await votingsCollection.findOne({ _id: new ObjectId(params.id) });
        }
      } catch (e) {}
      if (!votingDoc) {
        // Пробуем искать по votingId (если такое поле есть)
        votingDoc = await votingsCollection.findOne({ votingId: params.id });
      }
      if (!votingDoc) {
        return NextResponse.json(
          { error: 'Voting not found in DB' },
          { status: 404 }
        );
      }
      const allowedEmails = votingDoc.allowedEmails || [];
      if (!allowedEmails.includes(email)) {
        return NextResponse.json(
          { error: 'Email is not allowed to vote in this private voting' },
          { status: 403 }
        );
      }
    }

    // Hash the email for private voting
    const voterIdentifier = voting.isPrivate
      ? keccak256(toUtf8Bytes(email))
      : session.user.email || '';

    // Check if user has already voted
    const hasVoted = await contract.hasVoted(params.id, voterIdentifier);
    if (hasVoted) {
      return NextResponse.json(
        { error: 'Already voted' },
        { status: 400 }
      );
    }

    // Submit the vote
    const tx = await contract.vote(params.id, choice, voterIdentifier);
    await tx.wait();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    );
  }
}
