"use client";
import React from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <header className="bg-surface/60 backdrop-blur-xl border-b border-white/10 shadow-none fixed top-0 w-full z-50 flex justify-between items-center px-container-padding h-16 max-w-full">
      {/* Logo Area */}
      <div className="flex items-center gap-3 lg:ml-72 cursor-pointer group"> 
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[#052e16] text-[18px] font-bold">query_stats</span>
        </div>
        <span className="text-xl font-black text-white tracking-tight font-display">
          Finance<span className="text-primary">IQ</span>
        </span>
      </div>
      {/* Actions Area */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary font-bold text-[12px] tracking-wide shadow-[0_0_15px_rgba(96,236,168,0.1)]">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 animate-pulse"></span>
          MODE PEMULA
        </div>
        <div className="w-px h-6 bg-white/10 mx-1 hidden md:block"></div>
        <button className="text-on-surface-variant hover:text-white hover:bg-white/10 transition-all p-2 rounded-full active:scale-95 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">account_circle</span>
        </button>
        <button className="text-on-surface-variant hover:text-white hover:bg-white/10 transition-all p-2 rounded-full active:scale-95 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </div>
    </header>
  );
}
