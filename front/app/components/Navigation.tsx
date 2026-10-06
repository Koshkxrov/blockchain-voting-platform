'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useSubscription } from '../contexts/SubscriptionContext';

export default function Navigation() {
  const { data: session } = useSession();
  const { hasSubscription } = useSubscription();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Voting Platform
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/votings"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Votings
              </Link>
              {session?.user && hasSubscription && (
                <Link
                  href="/create"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Create Voting
                </Link>
              )}
              {session?.user && (
                <Link
                  href="/subscription"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Subscription
                </Link>
              )}
              {session?.user?.role === 'admin' && (
                <>
                  <Link
                    href="/admin/users"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/tokens"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Tokens
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {session?.user ? (
              <>
                <span className="text-gray-600 text-sm">
                  {session.user.email}
                </span>
                {hasSubscription ? (
                  <span className="text-green-600 text-sm">
                    Active Subscription
                  </span>
                ) : (
                  <span className="text-red-600 text-sm">
                    No Subscription
                  </span>
                )}
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
