"use client";

import { motion } from "framer-motion";
import { useFinanceContext } from "../context/FinanceContext";
import { useRouter } from "next/navigation";

export default function RencanaPage() {
  const {
    isAnalyzed, wealthAllocationData, riskProfileData
  } = useFinanceContext();
  const router = useRouter();

  if (!isAnalyzed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-surface-dim p-8">
        <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">pie_chart</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Belum Ada Data Tersedia</h2>
        <p className="text-on-surface-variant text-center max-w-md mb-8">
          Silakan lakukan ekstraksi data dan inisiasi pipeline dari menu Beranda terlebih dahulu agar Agen dapat melakukan kalkulasi alokasi.
        </p>
        <button onClick={() => router.push('/beranda')} className="bg-primary text-[#052e16] px-8 py-3 rounded-xl font-bold hover:bg-primary-fixed transition-colors shadow-lg">
          Ke Halaman Beranda
        </button>
      </div>
    );
  }

  const surplus = riskProfileData?.surplus || 0;
  const projections = wealthAllocationData?.projections || Array(10).fill(0);
  const maxProjection = wealthAllocationData?.maxProjection || 1;

  return (
    <section className="flex-1 flex flex-col h-full bg-surface-dim relative overflow-y-auto no-scrollbar px-container-padding py-8">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-stack-gap-lg pb-20">
        
        <div className="flex flex-col gap-stack-gap-sm mb-6 border-b border-white/5 pb-6">
          <h1 className="font-headline-lg text-[32px] text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[36px]">pie_chart</span>
            Deep Dive: Wealth Manager & Proyeksi
          </h1>
          <p className="font-body-md text-on-surface-variant">Rincian alokasi instrumen dan simulasi pertumbuhan kekayaan (Compounding) di masa depan.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left: Detailed Instrument Breakdown */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              <div className="bg-surface-container-low border border-white/5 rounded-3xl p-8 shadow-lg h-full">
                <h4 className="font-bold text-white text-xl mb-6 border-b border-white/5 pb-4">Tindakan Pembelian Bulanan</h4>
                
                {surplus <= 0 ? (
                  <div className="bg-error/10 border border-error/30 p-6 rounded-2xl">
                    <h5 className="text-error font-bold text-lg mb-2">Surplus Tidak Mencukupi</h5>
                    <p className="text-error/80 text-sm">Anda tidak memiliki dana untuk dieksekusi.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white">RDPU</span>
                        <span className="text-secondary font-bold">Rp {(surplus * 0.3).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-secondary w-[30%]"></div>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-2">Gunakan aplikasi seperti Bareksa/Bibit. Beli produk RDPU Sucorinvest atau Syailendra.</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white">SBN / SBR</span>
                        <span className="text-blue-400 font-bold">Rp {(surplus * 0.35).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 w-[35%]"></div>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-2">Tunggu masa penawaran dari Kemenkeu, beli via Bank atau platform mitra distribusi.</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white">Index Fund (LQ45)</span>
                        <span className="text-primary font-bold">Rp {(surplus * 0.25).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[25%]"></div>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-2">Beli ETF X-LQ45 secara rutin setiap tanggal gajian tanpa melihat harga pasar (DCA).</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white">Kripto / Bluechip</span>
                        <span className="text-purple-400 font-bold">Rp {(surplus * 0.1).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 w-[10%]"></div>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-2">Sisihkan untuk BTC atau saham perbankan kapitalisasi besar saat pasar sedang terkoreksi.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI WEALTH PROJECTION */}
            <div className="xl:col-span-7 bg-surface-container-low border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-2xl h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(96,236,168,0.2)]">
                    <span className="material-symbols-outlined text-3xl">auto_graph</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-on-surface text-xl mb-1">Simulasi Compounding Interest</h2>
                    <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">Keajaiban "bunga berbunga" JIKA Anda rutin menginvestasikan Surplus tiap bulan.</p>
                  </div>
                </div>
                <div className="bg-surface-container border border-white/10 px-4 py-2 rounded-2xl flex flex-col items-end whitespace-nowrap shrink-0">
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Asumsi Imbal Hasil</span>
                  <span className="text-xl font-black text-primary">7.0% <span className="text-xs text-on-surface-variant font-normal">/ thn</span></span>
                </div>
              </div>

              <div className="space-y-8 relative z-10 flex-1 flex flex-col">
                <div className="w-full flex-1 min-h-[250px] flex items-end justify-between gap-2 px-2 border-b border-white/10 pb-2 relative">
                  {/* Y-axis indicator */}
                  <div className="absolute left-0 top-0 text-xs text-on-surface-variant font-mono">Rp {(projections[9] || 0).toLocaleString('id-ID')}</div>
                  
                  {projections.map((val, idx) => {
                    const heightPercent = (val / (projections[9] || 1)) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                        <motion.div 
                          initial={{ height: 0 }} 
                          animate={{ height: `${heightPercent}%` }} 
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className="w-full bg-gradient-to-t from-primary/20 to-primary rounded-t-md hover:to-primary-fixed transition-colors relative"
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest px-3 py-1.5 rounded-lg text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 whitespace-nowrap z-20 shadow-xl">
                            Rp {val.toLocaleString('id-ID')}
                          </div>
                        </motion.div>
                        <span className="text-xs font-mono text-on-surface-variant">Th {idx + 1}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-surface-container/50 border border-white/5 p-5 rounded-2xl flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-3">
                    <span className="text-xs text-on-surface-variant font-bold">Investasi Modal Asli Anda:</span>
                    <span className="text-sm font-mono text-white">Rp {(surplus * 12 * 10).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-3">
                    <span className="text-xs text-on-surface-variant font-bold">Keuntungan Bunga Murni:</span>
                    <span className="text-sm font-mono text-primary">+ Rp {(projections[9] - (surplus * 12 * 10)).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white font-black">Total Kekayaan di Th 10:</span>
                    <span className="text-xl font-black text-primary">Rp {(projections[9] || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 shadow-xl mt-4 relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/40 shrink-0">
                <span className="material-symbols-outlined text-3xl">psychology</span>
              </div>
              <div>
                <h4 className="font-bold text-primary-fixed text-xl mb-3 flex items-center gap-2">
                   Pesan AI Wealth Manager
                </h4>
                <p className="text-sm text-primary-fixed-dim leading-relaxed">
                  Perhatikan grafik di atas yang melengkung ke atas (J-Curve). Inilah cara orang kaya melipatgandakan hartanya tanpa harus bekerja lebih keras. Pada Tahun ke-5 ke atas, keuntungan investasi Anda akan ikut menghasilkan uang lagi secara otomatis. Tantangan terbesar Anda bukanlah memilih saham terbaik, melainkan konsistensi berinvestasi rutin Rp {surplus.toLocaleString('id-ID')} setiap bulan selama 120 bulan ke depan tanpa henti.
                </p>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
