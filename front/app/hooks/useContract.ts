import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ABI } from '../constants/contractABI';

export interface VotingData {
  id: number;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  options: string[];
  isPublic: boolean;
  isActive: boolean;
  allowedVoters: string[];
  totalVotes: number;
}

export function useContract() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [votings, setVotings] = useState<VotingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(0);

  useEffect(() => {
    const initContract = async () => {
      try {
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        if (!rpcUrl || !contractAddress) {
          throw new Error('Blockchain configuration is missing');
        }

        console.log('Connecting to configured RPC endpoint');
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        console.log('Provider initialized');

        // Проверяем подключение
        try {
          const blockNumber = await provider.getBlockNumber();
          console.log('Current block number:', blockNumber);
          const network = await provider.getNetwork();
          console.log('Network details:', {
            chainId: network.chainId,
            name: network.name
          });
        } catch (err) {
          console.error('Network connection error:', err);
          setError('Failed to connect to network');
          setLoading(false);
          return;
        }

        const contractInstance = new ethers.Contract(
          contractAddress,
          CONTRACT_ABI,
          provider
        );

        // Проверяем контракт
        try {
          const code = await provider.getCode(contractInstance.target);
          if (code === '0x') {
            throw new Error('Contract not found at address');
          }
          console.log('Contract verified at address:', contractInstance.target);
        } catch (err) {
          console.error('Contract verification error:', err);
          setError('Failed to verify contract');
          setLoading(false);
          return;
        }

        setContract(contractInstance);
      } catch (err) {
        console.error('Failed to initialize contract:', err);
        setError('Failed to connect to blockchain');
        setLoading(false);
      }
    };

    initContract();
  }, []);

  const fetchVotings = async () => {
    if (!contract) return;

    // Проверяем, прошло ли достаточно времени с последнего обновления
    const now = Date.now();
    if (now - lastUpdate < 30000) { // 30 секунд между обновлениями
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const votingCount = await contract.votingCount();
      console.log('Total votings:', Number(votingCount));

      const votingsData = await Promise.all(
        Array.from({ length: Number(votingCount) }, async (_, i) => {
          try {
            const details = await contract.getVotingDetails(i);
            // Fetch votes for each option
            const optionVotes = await Promise.all(
              details.options.map((_: any, optionIndex: number) => contract.getVotes(i, optionIndex))
            );
            const totalVotes = optionVotes.reduce((sum, v) => sum + Number(v), 0);
            return {
              id: i,
              name: details.name,
              description: details.description,
              startTime: Number(details.startTime),
              endTime: Number(details.endTime),
              options: details.options,
              isPublic: details.isPublic,
              isActive: details.isActive,
              allowedVoters: details.allowedVoters,
              totalVotes
            };
          } catch (err) {
            console.error(`Failed to fetch voting ${i}:`, err);
            return null;
          }
        })
      );

      const validVotings = votingsData.filter((voting): voting is VotingData => voting !== null);

      setVotings(validVotings);
      setLastUpdate(now);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch votings:', err);
      setError('Failed to load voting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchVotings();

      // Обновляем данные каждые 30 секунд
      const interval = setInterval(fetchVotings, 30000);
      return () => clearInterval(interval);
    }
  }, [contract]);

  return {
    votings,
    loading,
    error,
    refreshVotings: () => {
      const now = Date.now();
      if (now - lastUpdate >= 30000) {
        fetchVotings();
      }
    }
  };
}
