"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { FinanceProvider } from '../context/FinanceContext';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return <>{children}</>;
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
