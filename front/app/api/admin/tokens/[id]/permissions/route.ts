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

    // Get permissions
    const permissions = {
      canMint: await contract.hasRole(await contract.MINTER_ROLE(), process.env.ADMIN_ADDRESS),
      canBurn: await contract.hasRole(await contract.BURNER_ROLE(), process.env.ADMIN_ADDRESS),
      canPause: await contract.hasRole(await contract.PAUSER_ROLE(), process.env.ADMIN_ADDRESS),
      isPaused: await contract.paused()
    };

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error('Permission check error:', error);
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

    const { action, address } = await req.json();

    if (!action || !address) {
      return NextResponse.json(
        { error: 'Action and address are required' },
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

    // Create provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);

    // Create contract instance
    const contract = new ethers.Contract(
      token.contractAddress,
      token.abi,
      signer
    );

    // Execute permission action
    let tx;
    switch (action) {
      case 'grantMinter':
        tx = await contract.grantRole(await contract.MINTER_ROLE(), address);
        break;
      case 'revokeMinter':
        tx = await contract.revokeRole(await contract.MINTER_ROLE(), address);
        break;
      case 'grantBurner':
        tx = await contract.grantRole(await contract.BURNER_ROLE(), address);
        break;
      case 'revokeBurner':
        tx = await contract.revokeRole(await contract.BURNER_ROLE(), address);
        break;
      case 'grantPauser':
        tx = await contract.grantRole(await contract.PAUSER_ROLE(), address);
        break;
      case 'revokePauser':
        tx = await contract.revokeRole(await contract.PAUSER_ROLE(), address);
        break;
      case 'pause':
        tx = await contract.pause();
        break;
      case 'unpause':
        tx = await contract.unpause();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    await tx.wait();

    return NextResponse.json({
      success: true,
      transactionHash: tx.hash
    });
  } catch (error) {
    console.error('Permission management error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
