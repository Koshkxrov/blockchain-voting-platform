'use client';

import { Inter } from "next/font/google";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { SessionProvider } from 'next-auth/react';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

const inter = Inter({ subsets: ["latin"] });

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SubscriptionProvider>
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <main className="pt-16">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </SubscriptionProvider>
    </SessionProvider>
  );
}
