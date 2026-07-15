"use client";

import { motion } from "framer-motion";
import { useFinanceContext } from "../context/FinanceContext";
import { useRouter } from "next/navigation";

export default function RiwayatPage() {
  const { isAnalyzed } = useFinanceContext();
  const router = useRouter();

  if (!isAnalyzed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-surface-dim p-8">
        <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">history</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Belum Ada Riwayat</h2>
        <p className="text-on-surface-variant text-center max-w-md mb-8">
          Anda belum pernah melakukan ekstraksi data hari ini. Silakan jalankan pipeline di Beranda.
        </p>
        <button onClick={() => router.push('/beranda')} className="bg-primary text-[#052e16] px-8 py-3 rounded-xl font-bold hover:bg-primary-fixed transition-colors shadow-lg">
          Ke Halaman Beranda
        </button>
      </div>
    );
  }

  return (
    <section className="flex-1 flex flex-col h-full bg-surface-dim relative overflow-y-auto no-scrollbar px-container-padding py-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-stack-gap-lg pb-20">
        
        <div className="flex flex-col gap-stack-gap-sm mb-6 border-b border-white/5 pb-6">
          <h1 className="font-headline-lg text-[32px] text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant text-[36px]">history</span>
            Riwayat Analisis
          </h1>
          <p className="font-body-md text-on-surface-variant">Log aktivitas simulasi Multi-Agent AI Anda.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          
          <div className="bg-surface-container-low border border-white/5 rounded-3xl p-8 relative overflow-hidden flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0 border border-primary/30">
              <span className="material-symbols-outlined text-3xl">done_all</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-xl mb-1">Sesi Ekstraksi Terselesaikan</h3>
              <p className="text-on-surface-variant text-sm">
                Hari ini, {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div className="mt-4 flex gap-3">
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-md text-xs font-bold">1x Risk Profiling</span>
                <span className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-md text-xs font-bold">1x Wealth Management</span>
              </div>
            </div>
          </div>
          
        </motion.div>
      </div>
    </section>
  );
}
