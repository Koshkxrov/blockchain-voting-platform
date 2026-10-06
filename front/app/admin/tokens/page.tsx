'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Token {
  id: string;
  name: string;
  symbol: string;
  totalSupply: number;
  holders: number;
}

export default function TokenManagementPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { data: session } = useSession();

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch('/api/tokens');
        if (!response.ok) {
          throw new Error('Failed to fetch tokens');
        }
        const data = await response.json();
        setTokens(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tokens');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  if (!session?.user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Token Management</h1>
        <button
          onClick={async () => {
            try {
              const response = await fetch('/api/tokens/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: 'Voting Token',
                  symbol: 'VOTE',
                  totalSupply: 1000000,
                }),
              });
              if (!response.ok) throw new Error('Failed to create token');
              const newToken = await response.json();
              setTokens([...tokens, newToken]);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to create token');
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Token
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tokens.map((token) => (
          <div
            key={token.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {token.name} ({token.symbol})
            </h2>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Total Supply: {token.totalSupply.toLocaleString()}</p>
              <p>Holders: {token.holders.toLocaleString()}</p>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/tokens/${token.id}/mint`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        amount: 1000,
                      }),
                    });
                    if (!response.ok) throw new Error('Failed to mint tokens');
                    alert('Tokens minted successfully!');
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to mint tokens');
                  }
                }}
                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors"
              >
                Mint
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/tokens/${token.id}/distribute`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        amount: 100,
                      }),
                    });
                    if (!response.ok) throw new Error('Failed to distribute tokens');
                    alert('Tokens distributed successfully!');
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to distribute tokens');
                  }
                }}
                className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors"
              >
                Distribute
              </button>
            </div>
          </div>
        ))}
      </div>

      {tokens.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No tokens found. Create a new token to get started.
        </div>
      )}
    </div>
  );
}
