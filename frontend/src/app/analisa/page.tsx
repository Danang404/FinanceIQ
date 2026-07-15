"use client";

import { motion } from "framer-motion";
import { useFinanceContext } from "../context/FinanceContext";
import { useRouter } from "next/navigation";

export default function AnalisaPage() {
  const {
    savings, isAnalyzed,
    riskProfileData, stressTestData
  } = useFinanceContext();
  const router = useRouter();

  if (!isAnalyzed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-surface-dim p-8">
        <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">analytics</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Belum Ada Data Tersedia</h2>
        <p className="text-on-surface-variant text-center max-w-md mb-8">
          Silakan lakukan ekstraksi data dan inisiasi pipeline dari menu Beranda terlebih dahulu agar Agen dapat melakukan kalkulasi.
        </p>
        <button onClick={() => router.push('/beranda')} className="bg-primary text-[#052e16] px-8 py-3 rounded-xl font-bold hover:bg-primary-fixed transition-colors shadow-lg">
          Ke Halaman Beranda
        </button>
      </div>
    );
  }

  const surplus = riskProfileData?.surplus || 0;
  const emergencyTarget = riskProfileData?.emergencyTarget || 0;
  const emergencyProgress = riskProfileData?.emergencyProgress || 0;
  const dtiRatio = riskProfileData?.dtiRatio.toFixed(1) || "0.0";
  const savingsRate = riskProfileData?.savingsRate.toFixed(1) || "0.0";
  const isHealthy = riskProfileData?.isHealthy || false;
  const correctedRisk = riskProfileData?.correctedRisk || "KONSERVATIF";

  return (
    <section className="flex-1 flex flex-col h-full bg-surface-dim relative overflow-y-auto no-scrollbar px-container-padding py-8">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-stack-gap-lg pb-20">
        
        <div className="flex flex-col gap-stack-gap-sm mb-6 border-b border-white/5 pb-6">
          <h1 className="font-headline-lg text-[32px] text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-400 text-[36px]">analytics</span>
            Deep Dive: Analisa Risiko & Stress Test
          </h1>
          <p className="font-body-md text-on-surface-variant">Pendalaman (Deep Dive) oleh Risk Profiler Agent mengenai ketahanan finansial Anda dalam berbagai skenario krisis.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Standard Metrics */}
            <div className="bg-surface-container-low border border-white/5 rounded-3xl p-8 shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div>
                <h4 className="font-bold text-white text-xl mb-6 border-b border-white/5 pb-4">Kesehatan Rasio Dasar</h4>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-surface-container/50 p-6 rounded-2xl border border-white/5">
                    <span className="text-sm text-on-surface-variant block mb-2 font-bold uppercase tracking-wider">Rasio Utang (DTI)</span>
                    <span className={`text-4xl font-black ${Number(dtiRatio) > 30 ? 'text-error' : 'text-primary'}`}>{dtiRatio}%</span>
                    <span className="text-xs text-on-surface-variant block mt-3 font-medium bg-surface-dim/50 py-1.5 px-3 rounded-md w-max border border-white/5">Batas Bahaya: {'>'} 30%</span>
                  </div>
                  <div className="bg-surface-container/50 p-6 rounded-2xl border border-white/5">
                    <span className="text-sm text-on-surface-variant block mb-2 font-bold uppercase tracking-wider">Savings Rate</span>
                    <span className={`text-4xl font-black ${Number(savingsRate) < 10 ? 'text-error' : 'text-primary'}`}>{savingsRate}%</span>
                    <span className="text-xs text-on-surface-variant block mt-3 font-medium bg-surface-dim/50 py-1.5 px-3 rounded-md w-max border border-white/5">Batas Aman: {'>'} 10%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 bg-surface-container-highest/50 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="font-bold text-white text-lg flex items-center gap-2 mb-1"><span className="material-symbols-outlined text-secondary">shield</span> Keamanan Likuiditas</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-surface-dim rounded-full overflow-hidden border border-white/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${emergencyProgress}%` }} transition={{ delay: 0.5, duration: 1 }} className={`h-full rounded-full relative ${emergencyProgress >= 100 ? 'bg-primary' : emergencyProgress > 50 ? 'bg-secondary' : 'bg-error'}`}>
                    <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                  </motion.div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="font-body-sm text-on-surface-variant text-sm">
                    Terkumpul <strong className="text-white">Rp {Number(savings).toLocaleString('id-ID')}</strong> dari Rp {emergencyTarget.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {/* Kesimpulan Akhir Card that was at the bottom */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-3xl p-8 flex flex-col gap-4 shadow-xl justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40 mb-2">
                <span className="material-symbols-outlined text-3xl">psychology</span>
              </div>
              <h4 className="font-bold text-blue-100 text-2xl mb-2">Kesimpulan Akhir Risk Profiler</h4>
              <p className="text-base text-blue-200/80 leading-relaxed">
                Kemampuan Anda menahan risiko (Risk Capacity) berbanding lurus dengan berapa lama Anda bisa bertahan di masa krisis (Stress Test). Jika simulasi gagal, sangat tidak disarankan untuk menyentuh Saham atau Kripto. Prioritaskan 100% surplus Anda ke instrumen likuid sampai batas aman tercapai.
              </p>
            </div>
          </div>

          {/* AI STRESS TEST SECTION (New Design) */}
          <div className="bg-surface-container-low border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-2xl mt-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-error/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6 relative z-10">
              <div className="w-16 h-16 rounded-full bg-error/20 text-error flex items-center justify-center border border-error/30 shadow-[0_0_20px_rgba(248,113,113,0.2)]">
                <span className="material-symbols-outlined text-3xl">warning</span>
              </div>
              <div>
                <h2 className="font-bold text-on-surface text-2xl mb-1">AI Market Stress Test (Uji Ketahanan)</h2>
                <p className="text-sm text-on-surface-variant max-w-2xl">Apa itu Stress Test? Ini adalah simulasi ekstrim untuk menguji apakah keuangan Anda akan hancur jika dunia tiba-tiba dilanda krisis ekonomi, pandemi, atau hiperinflasi hari ini.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="bg-surface-container/50 border border-error/20 p-6 rounded-2xl flex flex-col hover:border-error/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-4 border border-error/20">
                  <span className="material-symbols-outlined">trending_down</span>
                </div>
                <h5 className="font-bold text-white text-lg mb-2">Skenario 1: Market Crash (Resesi)</h5>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4 flex-1">
                  Bagaimana jika besok pagi bursa saham global runtuh dan nilai aset saham anjlok -30% seperti saat krisis 2008? 
                </p>
                <div className="bg-error/10 p-4 rounded-xl border border-error/20 mt-auto">
                  <strong className="text-error block mb-1">Dampak ke Anda:</strong>
                  <p className="text-xs text-error/80 leading-relaxed">Berkat profil <strong>{correctedRisk}</strong> Anda yang diatur AI, portofolio Anda diproyeksikan hanya akan turun maksimal <strong>{isHealthy ? '-8%' : '-2%'}</strong> secara total. Uang Anda selamat karena mayoritas dana sudah diparkir di instrumen Obligasi (SBN) yang kebal resesi.</p>
                </div>
              </div>

              <div className="bg-surface-container/50 border border-secondary/20 p-6 rounded-2xl flex flex-col hover:border-secondary/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4 border border-secondary/20">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <h5 className="font-bold text-white text-lg mb-2">Skenario 2: Hiperinflasi (Harga Meroket)</h5>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4 flex-1">
                  Bagaimana jika harga kebutuhan pokok naik gila-gilaan (inflasi 10% per tahun)? Apakah nilai uang Anda akan menyusut tak berharga?
                </p>
                <div className="bg-secondary/10 p-4 rounded-xl border border-secondary/20 mt-auto">
                  <strong className="text-secondary block mb-1">Dampak ke Anda:</strong>
                  <p className="text-xs text-secondary/80 leading-relaxed">
                    {isHealthy ? 
                      "Anda terlindungi! Karena AI memasukkan porsi Saham & Kripto (High-Alpha) di portofolio Anda, imbal hasil dari aset tersebut diproyeksikan cukup tinggi untuk mengalahkan laju inflasi." :
                      "PERINGATAN: Karena Anda berada di profil Konservatif, aset Anda aman dari penurunan harga, NAMUN Anda berisiko tergerus inflasi karena keuntungan (bunga) dari deposito seringkali kalah cepat dengan kenaikan harga barang."}
                  </p>
                </div>
              </div>

              <div className="bg-surface-container/50 border border-blue-500/20 p-6 rounded-2xl flex flex-col hover:border-blue-500/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/20">
                  <span className="material-symbols-outlined">work_history</span>
                </div>
                <h5 className="font-bold text-white text-lg mb-2">Skenario 3: Kehilangan Pekerjaan (PHK)</h5>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4 flex-1">
                  Bagaimana jika besok perusahaan Anda bangkrut dan Anda kehilangan seluruh sumber pendapatan utama Anda secara mendadak?
                </p>
                <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 mt-auto">
                  <strong className="text-blue-400 block mb-1">Dampak ke Anda:</strong>
                  <p className="text-xs text-blue-400/80 leading-relaxed">
                    {emergencyProgress >= 100 ? 
                      "SANGAT AMAN! Anda memiliki bantalan uang tunai darurat yang sudah melampaui target. Anda bisa hidup tenang mencari pekerjaan baru selama berbulan-bulan tanpa harus memecah tabungan investasi Anda." :
                      `BAHAYA! Dana darurat Anda baru terkumpul ${emergencyProgress.toFixed(1)}%. Anda kemungkinan besar akan terpaksa mencairkan investasi Anda secara terburu-buru dengan kerugian (Cut Loss) sekadar untuk makan bulan depan.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
