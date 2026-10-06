import { ethers } from 'ethers';
import votingAbi from '@/contracts/VotingPlatform.json';

export type VotingContract = ethers.Contract;

// Initialize provider connection
let providerInitialized = false;
let provider: ethers.JsonRpcProvider | null = null;

const initializeProvider = async () => {
  if (!providerInitialized) {
    try {
      const rpcUrl = process.env.NEXT_PRIVATE_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL;
      if (!rpcUrl) {
        throw new Error('RPC URL not found in environment variables');
      }

      provider = new ethers.JsonRpcProvider(rpcUrl);
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
  const votingContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!votingContractAddress) {
    throw new Error('Voting contract address not found in environment variables');
  }

  // Return cached instance if available
  if (contractInstance) {
    return contractInstance;
  }

  await initializeProvider();
  if (!provider) {
    throw new Error('RPC provider failed to initialize');
  }
  contractInstance = new ethers.Contract(votingContractAddress, votingAbi.abi, provider);
  return contractInstance;
}
