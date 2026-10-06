"use client";

import { SessionProvider } from 'next-auth/react';
import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { ThemeProvider } from './context/ThemeContext';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (params?: any) => void) => void;
      removeListener: (event: string, callback: (params?: any) => void) => void;
    };
  }
}

interface BlockchainContextProps {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connectWallet: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
}

const BlockchainContext = createContext<BlockchainContextProps>({
  provider: null,
  signer: null,
  connectWallet: async () => {},
  isConnecting: false,
  error: null
});

export function useBlockchain() {
  return useContext(BlockchainContext);
}

function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ethereum = typeof window !== 'undefined' ? window.ethereum : undefined;
    if (ethereum) {
      try {
        const provider = new ethers.BrowserProvider(ethereum);
        setProvider(provider);

        // Listen for account changes
        const handleAccountsChanged = (accounts: string[]) => {
          if (accounts.length === 0) {
            setSigner(null);
          }
        };

        ethereum.on('accountsChanged', handleAccountsChanged);

        return () => {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize provider');
      }
    }
  }, []);

  async function connectWallet() {
    if (!provider || !window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const s = await provider.getSigner();
      setSigner(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <BlockchainContext.Provider value={{ provider, signer, connectWallet, isConnecting, error }}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <BlockchainProvider>
          {children}
        </BlockchainProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
