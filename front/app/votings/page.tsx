'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useContract, VotingData } from '../hooks/useContract';

type VotingStatus = 'active' | 'upcoming' | 'ended' | 'blocked' | 'deleted';

export default function VotingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { votings, loading, error } = useContract();
  const [activeTab, setActiveTab] = useState<VotingStatus>('active');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const currentTime = Math.floor(Date.now() / 1000);

  const getVotingStatus = (voting: VotingData): VotingStatus => {
    if (!voting.isActive) return 'ended';
    if (voting.startTime > currentTime) return 'upcoming';
    if (voting.endTime > currentTime) return 'active';
    return 'ended';
  };

  const filteredVotings = useMemo(() => {
    return votings.filter(voting => {
      const statusField = (voting as any).status;
      // Hide deleted votings for non-admins
      if (statusField === 'deleted' && (!session || session.user.role !== 'admin')) return false;
      // Filter by tab as before
      return getVotingStatus(voting) === activeTab;
    });
  }, [votings, activeTab, currentTime, session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Voting Sessions
        </h1>
        <Link
          href="/votings/create"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Create New Voting
        </Link>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {(['active', 'upcoming', 'ended'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {filteredVotings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No {activeTab} voting sessions found.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredVotings.map((voting) => (
              <Link key={voting.id} href={`/votings/${voting.id}`}>
                <div className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {voting.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {voting.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          (voting as any).status === 'blocked'
                            ? 'bg-gray-400 text-white dark:bg-gray-700 dark:text-gray-200'
                          : (voting as any).status === 'ended'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          : getVotingStatus(voting) === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : getVotingStatus(voting) === 'upcoming'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          { (voting as any).status === 'blocked'
                              ? 'Blocked'
                            : (voting as any).status === 'ended'
                              ? 'Ended'
                            : getVotingStatus(voting).charAt(0).toUpperCase() + getVotingStatus(voting).slice(1)
                          }
                        </span>
                        {!voting.isPublic && (
                          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                            Private
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <div>Start: {new Date(voting.startTime * 1000).toLocaleString()}</div>
                      <div>End: {new Date(voting.endTime * 1000).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
