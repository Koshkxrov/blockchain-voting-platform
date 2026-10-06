import { ethers } from 'ethers';
import votingAbi from '@/contracts/VotingPlatform.json';

const VOTING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const RPC_URL = process.env.NEXT_RPC_URL;

export type VotingContract = ethers.Contract;

if (!RPC_URL) {
  throw new Error('RPC URL not found in environment variables');
}

// Create provider instance
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Initialize provider connection
let providerInitialized = false;
const initializeProvider = async () => {
  if (!providerInitialized) {
    try {
      const network = await provider.getNetwork();
      if (network.chainId !== 80002n) {
        throw new Error(`Wrong network. Expected Polygon Amoy (chainId: 80002), got chainId: ${network.chainId}`);
      }
      providerInitialized = true;
    } catch (error) {
      console.error('Failed to initialize provider:', error);
      throw error;
    }
  }
};

// Cache the contract instance
let contractInstance: VotingContract | null = null;

export async function getContract(): Promise<VotingContract> {
  if (!VOTING_CONTRACT_ADDRESS) {
    throw new Error('Voting contract address not found in environment variables');
  }

  // Return cached instance if available
  if (contractInstance) {
    return contractInstance;
  }

  await initializeProvider();
  contractInstance = new ethers.Contract(VOTING_CONTRACT_ADDRESS, votingAbi.abi, provider);
  return contractInstance;
}
