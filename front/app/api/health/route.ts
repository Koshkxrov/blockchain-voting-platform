import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });

    return NextResponse.json({ status: 'ok', message: 'Database connection successful' });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Database connection failed'
      },
      { status: 500 }
    );
  }
}
