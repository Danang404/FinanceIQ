"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '../context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  
  if (pathname === '/') return null;

  const navItems = [
    { name: 'Beranda', path: '/beranda', icon: 'chat_bubble', filled: true },
    { name: 'Analisa', path: '/analisa', icon: 'insights', filled: false },
    { name: 'Rencana', path: '/rencana', icon: 'map', filled: false },
    { name: 'Riwayat', path: '/riwayat', icon: 'history', filled: false },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <nav className="h-full w-72 hidden lg:flex flex-col border-r border-white/5 bg-surface-container-low/80 backdrop-blur-2xl shadow-none fixed left-0 top-0 bottom-0 z-40 pt-20 pb-6">
        {/* Header User Info */}
        <div className="px-6 mb-8 mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-white/10">
              <img alt="User Profile Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5s2OeK-uizY-AsTB0VrpsCO9O4CISzbE2uIgFlq04seFdFhc_ao-NUU7c9AwVaISyFgK2vtWKMCHgSejKXGP-xfEeJ7k2m7O8REEToarC2D9g7m_FsXCo6xNRP_H9ypmyujKwUQzCplmFmGpGcNj8wSw8N_YkjtJPN1Qta9s5EhuwGtc_uyQ3zWN1_wic6q3UOh8c-WW40gYaEhjkCciKYbAaTOy6rftSyqvpth4euyjzBpU4sX_FTlk_QEqT-i2rUje449Dtuj8"/>
            </div>
            <div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface text-[16px] truncate max-w-[150px]">Halo, {user?.name?.split(' ')[0] || 'Achiever'}</h2>
              <p className="font-body-sm text-body-sm text-primary/80">Status: Aktif Membangun</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/');
            return (
              <Link key={item.name} href={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold duration-200 ease-in-out cursor-pointer ${isActive ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}>
                <span className="material-symbols-outlined" style={isActive || item.filled ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                <span className="font-body-md text-body-md">{item.name}</span>
              </Link>
            );
          })}
        </div>
        
        {/* Footer Upgrade & Actions */}
        <div className="px-4 mt-auto space-y-4">
          <button className="w-full py-3 px-4 rounded-xl bg-surface-bright border border-white/5 text-primary font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            Upgrade ke Pro
          </button>
          <div className="space-y-1">
            <button onClick={() => alert("Pusat Bantuan sedang dalam pengembangan.")} className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-xl duration-200 ease-in-out cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">help</span>
              <span className="font-body-sm text-body-sm">Bantuan</span>
            </button>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-error hover:text-error hover:bg-error/10 rounded-xl duration-200 ease-in-out cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="font-body-sm text-body-sm">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-low/95 backdrop-blur-xl border-t border-white/5 pt-2 pb-5 px-4 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/');
          return (
            <Link 
              key={item.name} 
              href={item.path} 
              className={`flex flex-col items-center gap-1 min-w-[64px] py-1 px-2 rounded-xl duration-200 ease-in-out cursor-pointer ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              <div className={`flex items-center justify-center w-12 h-8 rounded-full ${isActive ? 'bg-primary/20' : 'bg-transparent'}`}>
                <span className="material-symbols-outlined text-[22px]" style={isActive || item.filled ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              </div>
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
