"use client";
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { FinanceProvider } from '../context/FinanceContext';
import { AuthProvider, useAuthContext } from '../context/AuthContext';

function ProtectedDashboard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <FinanceProvider>
      <Header />
      <div className="w-full relative z-10 flex h-screen pt-16 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex w-full relative h-full lg:ml-72">
          {children}
        </div>
      </div>
    </FinanceProvider>
  );
}

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname === '/login';

  return (
    <AuthProvider>
      {isPublicPage ? (
        <>{children}</>
      ) : (
        <ProtectedDashboard>{children}</ProtectedDashboard>
      )}
    </AuthProvider>
  );
}
