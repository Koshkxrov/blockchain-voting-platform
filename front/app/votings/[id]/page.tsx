'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { CONTRACT_ABI } from '../../constants/contractABI';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

interface VotingDetails {
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  options: string[];
  isPublic: boolean;
  isActive: boolean;
  allowedVoters: string[];
  totalVotes: number;
  optionVotes: number[];
  userHasVoted?: boolean;
  userVoteOption?: number;
}

export default function VotingDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [voting, setVoting] = useState<VotingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [error, setError] = useState('');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else {
      fetchVoting();
    }
  }, [status, params.id]);

  const fetchVoting = async () => {
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!rpcUrl || !contractAddress) {
        throw new Error('Blockchain configuration is missing');
      }

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      const votingId = parseInt(params.id);
      if (isNaN(votingId)) {
        throw new Error('Invalid voting ID');
      }

      const details = await contract.getVotingDetails(votingId);
      const optionVotes = await Promise.all(
        details.options.map((_: any, index: number) =>
          contract.getVotes(votingId, index)
        )
      );

      let userHasVoted = false;
      let userVoteOption = undefined;
      if (session?.user?.email) {
        try {
          const emailHash = ethers.keccak256(ethers.toUtf8Bytes(session.user.email));
          userHasVoted = await contract.hasVoted(votingId, emailHash);
        } catch (err) {
          console.log('Error checking user vote:', err);
        }
      }

      const votingData: VotingDetails = {
        name: details.name,
        description: details.description,
        startTime: Number(details.startTime),
        endTime: Number(details.endTime),
        options: details.options,
        isPublic: details.isPublic,
        isActive: details.isActive,
        allowedVoters: details.allowedVoters,
        totalVotes: optionVotes.reduce((a: number, b: number) => a + Number(b), 0),
        optionVotes: optionVotes.map(Number),
        userHasVoted,
        userVoteOption
      };

      setVoting(votingData);
      if (userVoteOption !== undefined) {
        setSelectedOption(Number(userVoteOption));
      }
    } catch (err) {
      console.error('Error fetching voting:', err);
      setError('Failed to load voting details');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (selectedOption === null || !session?.user?.email) return;

    setLoading(true);
    setError('');

    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      const ethereum = (window as any).ethereum;
      if (!contractAddress || !ethereum) {
        throw new Error('Connect a wallet before voting');
      }

      const provider = new ethers.BrowserProvider(ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      const votingId = parseInt(params.id);
      const emailHash = ethers.keccak256(ethers.toUtf8Bytes(session.user.email));
      const tx = await contract.vote(votingId, selectedOption, emailHash);
      await tx.wait();

      toast.success('Vote submitted successfully!');
      fetchVoting();
    } catch (err: any) {
      console.error('Error submitting vote:', err);
      setError(err.message || 'Failed to submit vote');
      toast.error(err.message || 'Failed to submit vote');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${isDark ? 'bg-gray-900 text-red-400' : 'bg-gray-50 text-red-500'}`}>
        {error}
      </div>
    );
  }

  if (!voting) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${isDark ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
        Voting not found
      </div>
    );
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const isActive = voting.isActive && currentTime >= voting.startTime && currentTime < voting.endTime;
  const hasVoted = voting.userHasVoted;
  const canVote = isActive && !hasVoted;

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => router.push('/votings')}
          className={`mb-4 px-4 py-2 rounded-lg font-medium shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDark ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
        >
          ← Back
        </button>
        <div className={`rounded-2xl overflow-hidden shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Header Section */}
          <div className={`px-6 py-8 ${isDark ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">{voting.name}</h1>
                <p className="mt-2 text-lg text-blue-100">{voting.description}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isActive
                  ? 'bg-green-500 text-white'
                  : currentTime < voting.startTime
                  ? 'bg-yellow-400 text-yellow-900'
                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'
              }`}>
                {isActive ? 'Active' : currentTime < voting.startTime ? 'Upcoming' : 'Ended'}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Time Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Start Date</p>
                <p className={`mt-1 text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {new Date(voting.startTime * 1000).toLocaleString()}
                </p>
              </div>
              <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
                <p className={`text-sm font-medium ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>End Date</p>
                <p className={`mt-1 text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {new Date(voting.endTime * 1000).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Winner/Draw Result */}
            {!isActive && voting.totalVotes > 0 && (
              <div className={`mb-8 p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
                <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Final Results
                </h2>
                {(() => {
                  const maxVotes = Math.max(...voting.optionVotes);
                  const winners = voting.optionVotes.map((votes, index) => ({
                    option: voting.options[index],
                    votes,
                    isWinner: votes === maxVotes
                  })).filter(opt => opt.isWinner);

                  if (winners.length === 1) {
                    return (
                      <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                          Winner: {winners[0].option}
                        </h3>
                        <p className={`mt-2 ${isDark ? 'text-green-200' : 'text-green-600'}`}>
                          {winners[0].votes} votes ({((winners[0].votes / voting.totalVotes) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                          Draw Between:
                        </h3>
                        <div className="mt-2 space-y-2">
                          {winners.map((winner, index) => (
                            <p key={index} className={`${isDark ? 'text-yellow-200' : 'text-yellow-600'}`}>
                              {winner.option} - {winner.votes} votes ({((winner.votes / voting.totalVotes) * 100).toFixed(1)}%)
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            )}

            {error && (
              <div className={`mb-6 border-l-4 border-red-500 p-4 rounded-r-lg ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Voting Options */}
            <div className="space-y-4">
              {voting.options.map((option, index) => (
                <div
                  key={index}
                  className={`transform transition-all duration-200 hover:scale-[1.01] rounded-xl p-5 shadow-sm ${
                    selectedOption === index
                      ? isDark
                        ? 'bg-blue-900/30 border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                        : 'bg-blue-50 border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                      : isDark
                        ? 'bg-gray-700 border-gray-600 hover:border-blue-500'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                  } border`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {canVote && (
                        <div className="relative">
                          <input
                            type="radio"
                            name="vote"
                            value={index}
                            checked={selectedOption === index}
                            onChange={() => setSelectedOption(index)}
                            className={`h-5 w-5 ${isDark ? 'text-blue-500 focus:ring-blue-400' : 'text-blue-600 focus:ring-blue-500'} cursor-pointer`}
                          />
                        </div>
                      )}
                      <span className={`font-medium text-lg ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{option}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {voting.optionVotes[index]}
                      </span>
                      <span className={`ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>votes</span>
                      {hasVoted && voting.userVoteOption === index && (
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                        }`}>
                          Your vote
                        </span>
                      )}
                    </div>
                  </div>
                  {voting.totalVotes > 0 && (
                    <div className="mt-3">
                      <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        <span>{((voting.optionVotes[index] / voting.totalVotes) * 100).toFixed(1)}%</span>
                      </div>
                      <div className={`overflow-hidden h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDark
                              ? 'bg-gradient-to-r from-blue-500/80 to-purple-500/80'
                              : 'bg-gradient-to-r from-blue-500 to-purple-500'
                          }`}
                          style={{
                            width: `${(voting.optionVotes[index] / voting.totalVotes) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Section */}
            <div className="mt-8">
              {canVote && (
                <button
                  onClick={handleVote}
                  disabled={selectedOption === null || loading}
                  className={`w-full transform transition-all duration-200 hover:scale-[1.02] py-3 px-4 rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white hover:from-blue-500/90 hover:to-purple-500/90'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Vote'
                  )}
                </button>
              )}
              {hasVoted && (
                <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className={`mt-2 text-lg font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    Thank you for voting!
                  </p>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    You have already participated in this voting session.
                  </p>
                </div>
              )}
              {!isActive && !hasVoted && (
                <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <svg className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className={`mt-2 text-lg font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {currentTime < voting.startTime ? 'Voting has not started yet' : 'Voting has ended'}
                  </p>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {currentTime < voting.startTime
                      ? 'Please check back when the voting period begins.'
                      : 'The voting period for this session has concluded.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
