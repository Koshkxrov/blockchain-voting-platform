"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserSubscription {
  plan: string;
  expiresAt: string | null;
  isActive: boolean;
  status: string;
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionCode, setSubscriptionCode] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchSubscription();
    }
  }, [status]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: subscriptionCode }),
      });

      if (response.ok) {
        await fetchSubscription();
        // Dispatch event for subscription change
        const event = new Event('subscription-changed');
        window.dispatchEvent(event);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to activate subscription');
      }
    } catch (error) {
      setError('An error occurred while activating the subscription');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        {subscription && subscription.isActive ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Active Subscription
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Your subscription is active until{' '}
                {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : 'N/A'}
              </p>
              <div className="mt-6">
                <Link
                  href="/subscription/cancel"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                >
                  Cancel Subscription
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
              Activate Subscription
            </h2>
            <form onSubmit={handleActivate} className="space-y-6">
              <div>
                <label
                  htmlFor="subscriptionCode"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Subscription Code
                </label>
                <input
                  type="text"
                  id="subscriptionCode"
                  value={subscriptionCode}
                  onChange={(e) => setSubscriptionCode(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Enter your subscription code"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
              >
                {loading ? 'Activating...' : 'Activate Subscription'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
