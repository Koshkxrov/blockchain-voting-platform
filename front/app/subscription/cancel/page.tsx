'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CancelSubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      if (response.ok) {
        // Dispatch event for subscription change
        const event = new Event('subscription-changed');
        window.dispatchEvent(event);
        router.push('/subscription');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      setError('An error occurred while cancelling the subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cancel Subscription
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Are you sure you want to cancel your subscription? This action cannot be undone.
            </p>

            {error && (
              <div className="mt-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="mt-8 space-x-4">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
              >
                {loading ? 'Cancelling...' : 'Yes, Cancel Subscription'}
              </button>
              <Link
                href="/subscription"
                className="inline-flex justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              >
                No, Keep Subscription
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
