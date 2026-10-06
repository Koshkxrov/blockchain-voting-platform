import { NextResponse } from 'next/server';
import { CONTRACT_ABI } from '../../constants/contractABI';
import { ethers } from 'ethers';

export async function POST(request: Request) {
  try {
    const votingData = await request.json();

    // Get contract address from environment variables
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('Contract address not configured');
    }

    // Create provider and wallet
    const rpcUrl = process.env.NEXT_PRIVATE_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL;
    if (!rpcUrl) {
      throw new Error('RPC URL not configured');
    }
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const privateKey = process.env.PRIVATE_KEY || process.env.ADMIN_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('Private key not configured');
    }

    // Create wallet instance
    const wallet = new ethers.Wallet(privateKey, provider);

    // Prepare data for contract
    const name = votingData.name.trim();
    const isPublic = true; // or get from votingData
    const isEducational = false;
    const hasNFT = false;
    const endTime = BigInt(votingData.endTime);
    const options = votingData.options.filter((opt: string) => opt.trim() !== "");
    const subscriptionCode = process.env.SUBSCRIPTION_CODE;
    if (!subscriptionCode) {
      throw new Error('Subscription code not configured');
    }

    console.log('Creating voting with data:', {
      name,
      isPublic,
      isEducational,
      hasNFT,
      endTime: endTime.toString(),
      options
    });

    // Create contract interface
    const iface = new ethers.Interface(CONTRACT_ABI);

    // Encode function data
    const data = iface.encodeFunctionData("createVoting", [
      name,
      isPublic,
      isEducational,
      hasNFT,
      endTime,
      options,
      subscriptionCode
    ]);

    // Send transaction
    const tx = await wallet.sendTransaction({
      to: contractAddress,
      data: data,
      gasLimit: 2000000n
    });

    console.log('Transaction sent:', tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('No transaction receipt received');
    }

    if (receipt.status === 0) {
      throw new Error('Transaction failed');
    }

    console.log('Transaction confirmed:', receipt);

    return NextResponse.json({
      success: true,
      hash: tx.hash,
      receipt: {
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status
      }
    });
  } catch (error) {
    console.error('Error creating voting:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create voting',
        details: error instanceof Error ? error : undefined
      },
      { status: 500 }
    );
  }
}
