import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  "function getVotingCount() view returns (uint256)",
  "function getVotingInfo(uint256) view returns (string,bool,bool,bool,uint256,bool)"
];

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS!, CONTRACT_ABI, provider);

    const count = await contract.getVotingCount();
    const votingPromises = [];

    for (let i = 1; i <= count; i++) {
      votingPromises.push(contract.getVotingInfo(i));
    }

    const votingInfos = await Promise.all(votingPromises);
    const votings = votingInfos.map((info, index) => ({
      id: index + 1,
      name: info[0],
      isPublic: info[1],
      isEducational: info[2],
      hasNFT: info[3],
      endTime: Number(info[4]),
      isEnded: info[5]
    }));

    return NextResponse.json({ votings });
  } catch (error) {
    console.error('Error fetching votings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votings' },
      { status: 500 }
    );
  }
}
