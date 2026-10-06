'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface SubscriptionData {
  isActive: boolean;
  expiresAt: Date;
  isValid: boolean;
  status: string;
  type: string;
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  hasSubscription: boolean;
  loading: boolean;
  error: Error | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription/status');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }
      const data = await response.json();

      // Проверяем, действительно ли данные изменились
      if (JSON.stringify(data) !== JSON.stringify(subscription)) {
        setSubscription(data);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Загружаем данные только при первой инициализации или смене пользователя
    if (session?.user && !isInitialized) {
      fetchSubscription();
      setIsInitialized(true);
    } else if (!session?.user) {
      setSubscription(null);
      setLoading(false);
      setIsInitialized(false);
    }
  }, [session?.user?.email, isInitialized]);

  const refreshSubscription = async () => {
    // Обновляем данные только при явном запросе обновления
    await fetchSubscription();
  };

  // Вычисляем hasSubscription на основе данных подписки
  const hasSubscription = Boolean(subscription?.isActive);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        hasSubscription,
        loading,
        error,
        refreshSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
