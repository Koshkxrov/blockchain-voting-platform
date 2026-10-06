"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useContract } from '../hooks/useContract';

interface User {
  email: string;
  walletAddress: string;
  role: string;
  subscription: {
    active: boolean;
    expiresAt: string;
    type: string;
  } | null;
}

interface Voting {
  id: number;
  name: string;
  isPublic: boolean;
  isEducational: boolean;
  hasNFT: boolean;
  endTime: number;
  isEnded: boolean;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { votings, loading, error } = useContract();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session && session.user.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  const handleStatus = async (id: string, status: string) => {
    setActionLoading(id + status);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/votings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }
      setRefreshFlag(f => f + 1);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Optionally, re-fetch votings after an action
  useEffect(() => {
    // Could trigger a refresh in useContract if needed
  }, [refreshFlag]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!session || session.user.role !== 'admin') return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Voting Control Panel</h1>
      {actionError && <div className="mb-4 text-red-500">{actionError}</div>}
      <div className="grid gap-6">
        {votings.map((voting) => (
          <div key={voting.id} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-xl font-semibold">{voting.name}</h2>
                <p className="text-gray-600 dark:text-gray-300">{voting.description}</p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Start: {new Date(voting.startTime * 1000).toLocaleString()}<br />
                  End: {new Date(voting.endTime * 1000).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700">
                  Status: {(voting as any).status || 'active'}
                </span>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                onClick={() => handleStatus(String(voting.id), 'ended')}
                disabled={actionLoading === String(voting.id) + 'ended'}
              >
                End Voting
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                onClick={() => handleStatus(String(voting.id), 'deleted')}
                disabled={actionLoading === String(voting.id) + 'deleted'}
              >
                Delete Voting
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                onClick={() => handleStatus(String(voting.id), 'blocked')}
                disabled={actionLoading === String(voting.id) + 'blocked'}
              >
                Block Voting
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
