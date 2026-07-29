"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { login, register } = useAuthContext();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isLogin) {
        login(email, password);
      } else {
        if (!name) {
          setErrorMsg("Nama Panggilan harus diisi");
          return;
        }
        register(name, email, password);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan autentikasi.");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative Ambient Background */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-secondary/10 blur-[100px] pointer-events-none z-0"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white font-bold">query_stats</span>
            </div>
            <span className="text-2xl font-bold font-display text-white tracking-tight">FinanceIQ</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-3">
            {isLogin ? 'Selamat Datang Kembali' : 'Mulai Perjalanan Anda'}
          </h1>
          <p className="text-on-surface-variant">
            {isLogin ? 'Masuk untuk melanjutkan analisis multi-agent portofolio Anda.' : 'Buat profil baru untuk mendapatkan rekomendasi finansial.'}
          </p>
        </div>

        <div className="bg-surface-dim border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
          
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">error</span>
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Nama Panggilan</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">person</span>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                    placeholder="Budi Investor"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">mail</span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                  placeholder="budi@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">lock</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 rounded-xl bg-white text-black font-semibold mt-4 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 group shadow-lg"
            >
              {isLogin ? 'Masuk ke Dashboard' : 'Daftar Sekarang'}
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
              <button 
                type="button"
                onClick={toggleMode}
                className="ml-2 text-primary hover:text-white transition-colors font-medium"
              >
                {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
