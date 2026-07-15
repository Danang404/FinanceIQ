"use client";
import React from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <header className="bg-surface/60 backdrop-blur-xl border-b border-white/10 shadow-none fixed top-0 w-full z-50 flex justify-between items-center px-container-padding h-16 max-w-full">
      {/* Logo Area */}
      <div className="flex items-center gap-4 lg:ml-72"> 
        <span className="font-display text-display text-primary tracking-tight font-headline-lg-mobile text-headline-lg-mobile">FinanceIQ</span>
      </div>
      {/* Actions Area */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center px-3 py-1.5 rounded-full border border-white/10 bg-surface-bright/50 text-on-surface-variant font-label-md text-label-md">
          <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          Mode: Pemula
        </div>
        <button className="text-on-surface-variant hover:bg-white/5 transition-colors p-2 rounded-full active:scale-95 flex items-center justify-center">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
        <button className="text-on-surface-variant hover:bg-white/5 transition-colors p-2 rounded-full active:scale-95 flex items-center justify-center">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
}
