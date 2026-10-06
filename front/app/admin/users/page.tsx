'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  role: string;
  walletAddress: string;
  subscription: {
    isActive: boolean;
    expiresAt: string | null;
  };
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/list');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wallet Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.walletAddress}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.subscription.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.subscription.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/admin/set-staff', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              userId: user.id,
                              role: user.role === 'staff' ? 'user' : 'staff',
                            }),
                          });
                          if (!response.ok) throw new Error('Failed to update role');
                          const updatedUser = await response.json();
                          setUsers(
                            users.map((u) =>
                              u.id === updatedUser.id ? updatedUser : u
                            )
                          );
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed to update role');
                        }
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {user.role === 'staff' ? 'Remove Staff' : 'Make Staff'}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/subscription/buy', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              userId: user.id,
                              plan: 'monthly',
                            }),
                          });
                          if (!response.ok) throw new Error('Failed to activate subscription');
                          const updatedUser = await response.json();
                          setUsers(
                            users.map((u) =>
                              u.id === updatedUser.id ? updatedUser : u
                            )
                          );
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed to activate subscription');
                        }
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      Activate Subscription
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No users found.
        </div>
      )}
    </div>
  );
}
