'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Button } from './Button';

interface VotingFormProps {
  votingId: string;
  options: string[];
  isPublic: boolean;
  onVoteSubmitted: () => void;
}

export default function VotingForm({
  votingId,
  options,
  isPublic,
  onVoteSubmitted
}: VotingFormProps) {
  const { data: session } = useSession();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/votings/${votingId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optionIndex: selectedOption,
          email: !isPublic ? email : undefined
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit vote');
      }

      toast.success('Vote submitted successfully!');
      onVoteSubmitted();
    } catch (err) {
      console.error('Error submitting vote:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit vote';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        Please sign in to vote
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {options.map((option, index) => (
          <label
            key={index}
            className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedOption === index
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name="option"
                value={index}
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-900 dark:text-gray-100">{option}</span>
            </div>
          </label>
        ))}
      </div>

      {!isPublic && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || selectedOption === null || (!isPublic && !email)}
        className="w-full"
      >
        {loading ? 'Submitting...' : 'Submit Vote'}
      </Button>
    </form>
  );
}
