"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFinanceContext } from "../context/FinanceContext";
import { useRouter } from "next/navigation";

export default function Beranda() {
  const {
    income, setIncome,
    expense, setExpense,
    debt, setDebt,
    savings, setSavings,
    goal, setGoal,
    risk, setRisk,
    isAnalyzed, setIsAnalyzed,
    isProcessing, runAgentPipeline,
    riskProfileData, wealthAllocationData
  } = useFinanceContext();

  const [isAnalyzingLocal, setIsAnalyzingLocal] = useState(false);
  const router = useRouter();

  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatTyping, isAnalyzed]);

  useEffect(() => {
    if (isAnalyzed && chatMessages.length === 0) {
      setChatMessages([
        {
          role: "ai",
          content: "Halo! Saya Literacy Agent. Saya telah membaca memori konteks dari Risk Profiler dan Wealth Manager. Anda memiliki rasio DTI yang sehat, sehingga saya siap memandu Anda memahami instrumen Obligasi dan ETF yang direkomendasikan. Ada yang ingin ditanyakan?"
        }
      ]);
    }
  }, [isAnalyzed, chatMessages.length]);

  const handleAnalyze = async () => {
    setIsAnalyzingLocal(true);
    await runAgentPipeline();
    setIsAnalyzingLocal(false);
    setChatMessages([
      {
        role: "ai",
        content: "Halo! Saya Literacy Agent. Saya telah membaca memori konteks dari Risk Profiler dan Wealth Manager. Anda memiliki rasio DTI yang sehat, sehingga saya siap memandu Anda memahami instrumen Obligasi dan ETF yang direkomendasikan. Ada yang ingin ditanyakan?"
      }
    ]);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: "user", content: chatInput }]);
    setChatInput("");
    setIsChatTyping(true);
    
    setTimeout(() => {
      setIsChatTyping(false);
      setChatMessages(prev => [...prev, { 
        role: "ai", 
        content: "Berdasarkan matriks alokasi yang dilempar oleh Wealth Manager Agent, Anda disarankan menaruh 35% di Obligasi karena profil objektif Anda terkoreksi menjadi 'Moderat'. Obligasi akan menjadi jangkar penyeimbang agar portofolio Anda tidak turun drastis saat market crash." 
      }]);
    }, 1500);
  };

  const surplus = riskProfileData?.surplus || 0;
  const emergencyTarget = riskProfileData?.emergencyTarget || 0;
  const emergencyProgress = riskProfileData?.emergencyProgress || 0;
  const dtiRatio = riskProfileData?.dtiRatio.toFixed(1) || "0.0";
  const savingsRate = riskProfileData?.savingsRate.toFixed(1) || "0.0";
  const isHealthy = riskProfileData?.isHealthy || false;
  const correctedRisk = riskProfileData?.correctedRisk || "KONSERVATIF";

  return (
    <>
      <section className="flex-1 flex flex-col h-full bg-surface-dim relative overflow-y-auto no-scrollbar px-container-padding py-8">
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-stack-gap-lg pb-20">
          
          <div className="flex flex-col gap-stack-gap-sm mb-2">
            <h1 className="font-headline-lg text-[32px] text-on-surface">Command Center AI</h1>
            <p className="font-body-md text-on-surface-variant">Pusat orkestrasi Multi-Agent AI untuk simulasi portofolio Anda.</p>
          </div>

          <AnimatePresence mode="wait">
            
            {/* STEP 1: DETAILED PROFILING FORM */}
            {!isAnalyzed && !isAnalyzingLocal && (
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface-container-low/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">assignment</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-on-surface text-[20px]">Formulir Ekstraksi Data (Input Layer)</h2>
                    <p className="text-sm text-on-surface-variant">Data ini akan di-parsing sebagai State awal menuju Multi-Agent Pipeline.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-on-surface-variant">Pendapatan Bulanan (Rp)</label>
                    <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} className="w-full bg-surface-container border border-white/10 rounded-xl p-4 text-on-surface font-semibold focus:border-primary/50 outline-none transition-colors" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-on-surface-variant">Pengeluaran Rutin (Rp)</label>
                    <input type="number" value={expense} onChange={(e) => setExpense(e.target.value)} className="w-full bg-surface-container border border-white/10 rounded-xl p-4 text-on-surface font-semibold focus:border-primary/50 outline-none transition-colors" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-on-surface-variant">Cicilan / Utang Bulanan (Rp)</label>
                    <input type="number" value={debt} onChange={(e) => setDebt(e.target.value)} className="w-full bg-surface-container border border-white/10 rounded-xl p-4 text-on-surface font-semibold focus:border-primary/50 outline-none transition-colors" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-on-surface-variant">Total Tabungan Saat Ini (Rp)</label>
                    <input type="number" value={savings} onChange={(e) => setSavings(e.target.value)} className="w-full bg-surface-container border border-white/10 rounded-xl p-4 text-on-surface font-semibold focus:border-primary/50 outline-none transition-colors" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-on-surface-variant">Tujuan Finansial Utama</label>
                    <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-surface-container border border-white/10 rounded-xl p-4 text-on-surface focus:border-primary/50 outline-none appearance-none font-semibold transition-colors cursor-pointer">
                      <option value="darurat">Mengamankan Dana Darurat</option>
                      <option value="rumah">Membeli Properti / Kendaraan</option>
                      <option value="pensiun">Pertumbuhan Aset / Dana Pensiun</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-on-surface-variant">Profil Risiko (Persepsi Pribadi)</label>
                    <select value={risk} onChange={(e) => setRisk(e.target.value)} className="w-full bg-surface-container border border-white/10 rounded-xl p-4 text-on-surface focus:border-primary/50 outline-none appearance-none font-semibold transition-colors cursor-pointer">
                      <option value="konservatif">Konservatif (Aman, Imbal Hasil Rendah)</option>
                      <option value="moderat">Moderat (Seimbang)</option>
                      <option value="agresif">Agresif (Risiko Tinggi, Imbal Hasil Tinggi)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
                    <p className="text-sm text-primary font-medium flex items-start gap-2">
                      <span className="material-symbols-outlined text-[18px]">info</span>
                      Tombol di bawah ini akan menginisiasi 3 rantai AI Agents: Risk Profiler -&gt; Wealth Manager -&gt; Literacy Agent. Konteks akan dipassing berurutan.
                    </p>
                  </div>
                  <button onClick={handleAnalyze} className="w-full bg-primary text-[#052e16] py-4 rounded-xl font-bold text-[16px] hover:bg-primary-fixed transition-colors flex justify-center items-center gap-3 shadow-[0_4px_30px_rgba(96,236,168,0.3)] hover:shadow-[0_4px_40px_rgba(96,236,168,0.4)]">
                    <span className="material-symbols-outlined">account_tree</span>
                    Inisiasi Pipeline Multi-Agent
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: ANALYZING (LOADING STATE) */}
            {isAnalyzingLocal && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 gap-10"
              >
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 rounded-full border-t-2 border-primary border-r-2 border-r-transparent"></motion.div>
                  <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-4 rounded-full border-b-2 border-secondary border-l-2 border-l-transparent"></motion.div>
                  <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(96,236,168,0.2)]">
                    <span className="material-symbols-outlined text-primary text-4xl animate-pulse">account_tree</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-display text-2xl font-bold text-on-surface mb-3">Orkestrasi Pipeline Berjalan...</h3>
                  <div className="space-y-2 text-left bg-surface-container-low p-6 rounded-xl border border-white/5 inline-block">
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-body-md text-blue-400 font-mono text-sm">
                      &gt; [Agent 1] Risk Profiler: Mengkalkulasi DTI & Savings Rate...
                    </motion.p>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-body-md text-primary font-mono text-sm">
                      &gt; [Agent 2] Wealth Manager: Menerima context Surplus & Risk...
                    </motion.p>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="text-body-md text-purple-400 font-mono text-sm">
                      &gt; [Agent 3] Literacy Agent: Memuat memori rekomendasi...
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: RESULTS (UNIFIED OUTPUT) */}
            {isAnalyzed && !isAnalyzingLocal && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, staggerChildren: 0.2 }}
                className="flex flex-col gap-10"
              >
                
                <div className="flex justify-between items-center bg-surface-container-low border border-primary/20 px-6 py-5 rounded-2xl shadow-[0_0_30px_rgba(96,236,168,0.05)]">
                  <div>
                    <h2 className="font-headline-lg-mobile text-[22px] text-primary flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined">account_tree</span> Pipeline Execution Complete
                    </h2>
                    <p className="text-sm text-on-surface-variant">3 Agen telah selesai memproses data Anda secara berantai.</p>
                  </div>
                  <button onClick={() => setIsAnalyzed(false)} className="bg-surface-container text-white px-5 py-2.5 rounded-xl font-bold hover:bg-surface-bright transition-colors border border-white/10 flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[18px]">restart_alt</span> Reset Context
                  </button>
                </div>

                {/* PHASE 1: ANALISIS KONDISI SAAT INI (RISK PROFILER) */}
                <div className="flex flex-col gap-5 relative">
                  {/* Decorative Connection Line to next Agent */}
                  <div className="absolute left-[27px] top-[40px] bottom-[-40px] w-0.5 bg-gradient-to-b from-blue-500/50 to-primary/50 z-0 hidden md:block"></div>

                  <h3 className="text-xl font-bold font-display text-on-surface flex items-center gap-3 mb-2 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40 shadow-lg shadow-blue-500/10">
                      <span className="material-symbols-outlined">health_and_safety</span>
                    </div>
                    <div>
                      <span className="text-sm text-blue-400 font-bold tracking-widest block uppercase mb-1">Agent 1 Executed</span>
                      Risk Profiler (Audit Rasio)
                    </div>
                  </h3>
                  
                  <div className="flex flex-col gap-6 pl-0 md:pl-20">
                    
                    {/* Agent Reasoning Log (The "Brain") */}
                    <div className="bg-blue-950/30 border border-blue-500/20 rounded-2xl p-5 font-mono text-sm text-blue-200 w-full shadow-lg">
                      <div className="flex items-center gap-2 text-blue-400 mb-3 font-bold border-b border-blue-500/20 pb-2">
                        <span className="material-symbols-outlined text-[18px]">terminal</span>
                        Agent 1: LLM Chain-of-Thought (Reasoning)
                      </div>
                      <div className="space-y-1">
                        <p className="text-blue-500/80 italic">{`> System Prompt: "You are a strict Risk Actuary AI. Analyze the user's raw financial data..."`}</p>
                        <p className="mt-2">{`> [Observation] DTI berada di angka ${dtiRatio}%, sedangkan Emergency Fund baru terpenuhi ${emergencyProgress.toFixed(1)}%.`}</p>
                        <p>{`> [Reasoning] Rasio DTI yang rendah (${dtiRatio}%) biasanya memungkinkan investasi agresif. NAMUN, bantalan darurat yang belum 100% menimbulkan risiko likuiditas fatal jika terjadi krisis ekonomi tiba-tiba.`}</p>
                        <p className={Number(dtiRatio) > 30 ? "text-error" : "text-primary"}>{`> [Decision] Saya harus mengesampingkan profil "${risk}" pilihan pengguna demi keamanannya sendiri.`}</p>
                        <p className="text-blue-400 font-bold mt-2 pt-2 border-t border-blue-500/20">
                          {`> OUTPUT TO AGENT 2: { "surplus": ${surplus}, "corrected_risk": "${correctedRisk}", "logic_flag": "needs_liquidity" }`}
                        </p>
                      </div>
                    </div>

                    {/* 1. SURPLUS CARD */}
                    <div className="bg-surface-container-low border border-white/5 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="flex-1">
                          <h4 className="font-bold text-on-surface text-xl flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                            Kapasitas Investasi (Surplus)
                          </h4>
                          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                            Surplus adalah "peluru" investasi Anda. Ini adalah sisa uang tunai yang benar-benar bisa Anda putar setiap bulannya setelah semua kewajiban hidup (pengeluaran dan utang) dibayar lunas.
                          </p>
                          <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-2xl font-black border ${surplus > 0 ? 'bg-primary/10 text-primary border-primary/30' : 'bg-error/10 text-error border-error/30'}`}>
                            Rp {surplus.toLocaleString('id-ID')}
                          </div>
                        </div>
                        
                        <div className="flex-1 w-full bg-surface-container/50 border border-white/5 rounded-xl p-5">
                          <h5 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">calculate</span> Rumus Transparan:
                          </h5>
                          <div className="flex flex-col gap-2 text-sm font-mono text-on-surface-variant">
                            <div className="flex justify-between items-center"><span className="text-white">Total Pendapatan</span> <span className="text-primary">+ Rp {Number(income).toLocaleString('id-ID')}</span></div>
                            <div className="flex justify-between items-center"><span className="text-white">Pengeluaran Rutin</span> <span className="text-error">- Rp {Number(expense).toLocaleString('id-ID')}</span></div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2"><span className="text-white">Cicilan / Utang</span> <span className="text-error">- Rp {Number(debt).toLocaleString('id-ID')}</span></div>
                            <div className="flex justify-between items-center pt-1 font-bold text-white"><span>Total Sisa Uang</span> <span>Rp {surplus.toLocaleString('id-ID')}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. DTI & SAVINGS RATE GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* DTI */}
                      <div className="bg-surface-container-low border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col">
                        <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                          <div>
                            <h4 className="font-bold text-on-surface text-lg mb-1">Rasio Utang</h4>
                            <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Debt-to-Income (DTI)</p>
                          </div>
                          <span className={`text-3xl font-black ${Number(dtiRatio) > 30 ? 'text-error' : 'text-primary'}`}>{dtiRatio}%</span>
                        </div>
                        
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-1">
                          Rasio ini menunjukkan <strong>berapa persen gaji Anda yang hangus hanya untuk membayar cicilan utang.</strong> Pakar menyarankan batas aman maksimal adalah 30%. Jika lebih dari itu, Anda berada di zona bahaya dan rentan bangkrut.
                        </p>
                        
                        <div className="w-full bg-surface-container-highest rounded-full h-3 mb-2 overflow-hidden flex relative">
                          <div style={{width: `${Math.min(Number(dtiRatio), 100)}%`}} className={`h-full ${Number(dtiRatio) > 30 ? 'bg-error' : 'bg-primary'} absolute left-0`}></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                          <span>0% (Aman)</span>
                          <span className="text-error">Batas Bahaya (30%)</span>
                        </div>
                      </div>

                      {/* Savings Rate */}
                      <div className="bg-surface-container-low border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col">
                        <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                          <div>
                            <h4 className="font-bold text-on-surface text-lg mb-1">Tingkat Tabungan</h4>
                            <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Savings Rate</p>
                          </div>
                          <span className={`text-3xl font-black ${Number(savingsRate) < 10 ? 'text-error' : 'text-primary'}`}>{savingsRate}%</span>
                        </div>
                        
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-1">
                          Rasio ini menunjukkan <strong>berapa persen dari total gaji yang berhasil Anda selamatkan</strong> (ditabung/investasi). Idealnya Anda harus menyisihkan minimal <strong>10% hingga 20%</strong> setiap bulannya agar keuangan Anda bertumbuh.
                        </p>
                        
                        <div className="w-full bg-surface-container-highest rounded-full h-3 mb-2 overflow-hidden flex relative">
                          <div style={{width: `${Math.min(Number(savingsRate), 100)}%`}} className={`h-full ${Number(savingsRate) < 10 ? 'bg-error' : 'bg-primary'} absolute left-0`}></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                          <span className="text-error">Batas Minimum (10%)</span>
                          <span>100% (Maksimal)</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. EMERGENCY FUND */}
                    <div className="bg-surface-container-low border border-white/5 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                        <div className="flex-1 w-full">
                          <h4 className="font-bold text-on-surface text-xl flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-secondary">security</span>
                            Dana Darurat (Emergency Fund)
                          </h4>
                          <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                            Dana darurat adalah asuransi kehidupan Anda. AI menghitung bahwa Anda butuh minimal <strong>6 bulan pengeluaran rutin</strong> (6 x Rp {Number(expense).toLocaleString('id-ID')}) uang tunai cair agar Anda bisa bertahan hidup jika tiba-tiba kena PHK atau krisis ekonomi.
                          </p>
                          
                          <div className="bg-surface-container/50 border border-white/5 p-5 rounded-xl">
                            <div className="flex justify-between items-end mb-3">
                              <div>
                                <span className="block text-sm text-on-surface-variant mb-1">Target Ideal Anda:</span>
                                <span className="font-bold text-white text-xl">Rp {emergencyTarget.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="text-right">
                                <span className="block text-sm text-on-surface-variant mb-1">Terkumpul Saat Ini:</span>
                                <span className="font-bold text-secondary text-xl">Rp {Number(savings).toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                            
                            <div className="w-full bg-surface-container-highest rounded-full h-4 mb-2 overflow-hidden border border-white/10 relative">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${emergencyProgress}%` }} transition={{ delay: 0.5, duration: 1 }} className={`h-full absolute left-0 top-0 ${emergencyProgress >= 100 ? 'bg-primary' : emergencyProgress > 50 ? 'bg-secondary' : 'bg-error'}`}></motion.div>
                            </div>
                            <div className="text-right text-sm font-bold text-white">{emergencyProgress.toFixed(1)}% Terpenuhi</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. FINAL CONCLUSION - RISIKO OBJEKTIF */}
                    <div className="bg-blue-950/20 border-2 border-blue-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(59,130,246,0.1)] relative overflow-hidden mt-2">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                      
                      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
                        <div className="flex flex-col items-center justify-center shrink-0 min-w-[150px]">
                          <div className="w-20 h-20 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 border border-blue-500/40">
                            <span className="material-symbols-outlined text-4xl">psychology</span>
                          </div>
                          <span className="text-[11px] text-blue-400 font-bold uppercase tracking-widest text-center">Kesimpulan AI:<br/>Risiko Objektif</span>
                        </div>
                        
                        <div className="flex-1 w-full bg-surface-container/50 border border-white/5 rounded-xl p-6">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 border-b border-white/10 pb-5">
                            <div>
                              <h4 className="font-bold text-white text-xl mb-1">Profil Toleransi Risiko Anda</h4>
                              <p className="text-sm text-on-surface-variant">Hasil analisa komprehensif dari Kapasitas Surplus, DTI, & Kas Darurat.</p>
                            </div>
                            <div className="px-6 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-black text-2xl shrink-0 uppercase tracking-wide">
                              {correctedRisk}
                            </div>
                          </div>
                          
                          <div className="text-sm leading-relaxed">
                            <strong className="text-blue-400 block mb-3 text-base flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">menu_book</span>
                              Apa arti status ini untuk Anda?
                            </strong>
                            {correctedRisk === "KONSERVATIF" && (
                              <p className="text-on-surface-variant">Berdasarkan data Anda, fondasi keuangan Anda masih sangat rentan (mungkin karena utang terlalu tinggi atau dana darurat kurang). Oleh karena itu, <strong>Anda sama sekali dilarang mengambil risiko kehilangan uang (modal)</strong>. Instrumen investasi Anda harus difokuskan 100% pada aset yang keamanannya dijamin (seperti Deposito atau SBN), meskipun imbal hasilnya kecil. Jangan sentuh kripto atau saham untuk saat ini sampai kas darurat Anda penuh.</p>
                            )}
                            {correctedRisk === "MODERAT" && (
                              <p className="text-on-surface-variant">Keuangan Anda cukup sehat dan seimbang. Anda sudah boleh mengambil sedikit risiko. <strong>Anda mampu mentolerir sedikit penurunan harga portofolio (minus sementara) demi mengejar keuntungan aset yang lebih tinggi.</strong> Namun, agar tetap aman, porsi mayoritas uang Anda tetap harus diamankan di instrumen likuid (pasar uang) dan obligasi negara, sedangkan sebagian kecil boleh digunakan untuk memburu <em>growth</em> di Index Fund saham.</p>
                            )}
                            {correctedRisk === "MODERAT-AGRESIF" && (
                              <p className="text-on-surface-variant">Selamat! Fondasi keuangan Anda (rasio utang dan likuiditas) sangat kokoh! Karena Anda punya bantalan keamanan yang kuat, <strong>AI menilai Anda sangat siap menahan guncangan pasar yang ekstrem (High Risk) untuk memburu cuan maksimal (High Return).</strong> Jika besok pasar saham anjlok -20%, kehidupan Anda tidak akan terganggu karena dana darurat Anda siap. Anda sangat direkomendasikan masuk ke instrumen agresif seperti Kripto atau Saham Bluechip.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* PHASE 2: RENCANA & ALOKASI (WEALTH MANAGER) */}
                <div className="flex flex-col gap-5 mt-4 relative">
                  {/* Decorative Connection Line to next Agent */}
                  <div className="absolute left-[27px] top-[40px] bottom-[-40px] w-0.5 bg-gradient-to-b from-primary/50 to-purple-500/50 z-0 hidden md:block"></div>

                  <h3 className="text-xl font-bold font-display text-on-surface flex items-center gap-3 mb-2 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/40 shadow-lg shadow-primary/10">
                      <span className="material-symbols-outlined">account_balance</span>
                    </div>
                    <div>
                      <span className="text-sm text-primary font-bold tracking-widest block uppercase mb-1">Agent 2 Executed</span>
                      Wealth Manager (Portfolio Builder)
                    </div>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pl-0 md:pl-20">
                    
                    {/* Agent Reasoning Log (The "Brain") */}
                    <div className="md:col-span-12 bg-green-950/30 border border-primary/20 rounded-2xl p-5 font-mono text-sm text-green-200">
                      <div className="flex items-center gap-2 text-primary mb-3 font-bold border-b border-primary/20 pb-2">
                        <span className="material-symbols-outlined text-[18px]">lan</span>
                        Agent 2: LLM Chain-of-Thought (Reasoning)
                      </div>
                      <div className="space-y-1">
                        <p className="text-primary/60 italic">{`> System Prompt: "You are a Quantitative Wealth Manager AI. Build an asset allocation matrix based on the Actuary's context..."`}</p>
                        <p className="mt-2">{`> [Observation] Menerima JSON dari Agent 1: Surplus Rp ${surplus.toLocaleString('id-ID')} dengan risiko terkoreksi [${correctedRisk}]. Flag: needs_liquidity.`}</p>
                        <p>{`> [Reasoning] Karena Agent 1 menyematkan flag 'needs_liquidity', saya tidak boleh mengalokasikan dana mayoritas ke instrumen terkunci (seperti Deposito berjangka panjang). Saya harus memprioritaskan RDPU (T+1 pencairan) sebesar minimal 30%.`}</p>
                        {isHealthy ? (
                          <p>{`> [Decision] Profil cukup sehat untuk menyerap volatilitas. Saya akan membuka keran alokasi 10% untuk aset High-Alpha (Kripto/Saham) guna melawan inflasi.`}</p>
                        ) : (
                          <p>{`> [Decision] Profil berisiko. Saya menutup keran aset High-Alpha menjadi 0% dan memfokuskan 65% ke SBN/RDPU untuk menjaga nilai uang secara absolut.`}</p>
                        )}
                        <p className="text-primary font-bold mt-2 pt-2 border-t border-primary/20">
                          {`> OUTPUT TO AGENT 3: Matriks Alokasi [RDPU: 30%, SBN: 35%, LQ45: 25%, Crypto: 10%] beserta proyeksi logaritmik 10 tahun.`}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-12 bg-surface-container/30 border border-white/5 rounded-2xl p-6">
                      <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-4">
                        <div>
                          <h4 className="font-bold text-white text-lg">Matriks Alokasi Ideal (Generated by AI)</h4>
                          <p className="text-sm text-on-surface-variant mt-1">Total Dana Dieksekusi: <strong className="text-primary">Rp {surplus > 0 ? surplus.toLocaleString('id-ID') : 0}</strong></p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-surface-container-high border border-white/5 rounded-xl p-5 hover:border-secondary/50 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-center mb-3">
                            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary"><span className="material-symbols-outlined text-sm">shield</span></div>
                            <span className="text-secondary font-black text-lg">30%</span>
                          </div>
                          <h5 className="font-bold text-white text-sm mb-1">RDPU (Pasar Uang)</h5>
                          <p className="text-lg font-mono text-white">Rp {(surplus > 0 ? surplus * 0.3 : 0).toLocaleString('id-ID')}</p>
                        </div>
                        
                        <div className="bg-surface-container-high border border-white/5 rounded-xl p-5 hover:border-blue-400/50 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-center mb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><span className="material-symbols-outlined text-sm">receipt_long</span></div>
                            <span className="text-blue-400 font-black text-lg">35%</span>
                          </div>
                          <h5 className="font-bold text-white text-sm mb-1">Obligasi Negara</h5>
                          <p className="text-lg font-mono text-white">Rp {(surplus > 0 ? surplus * 0.35 : 0).toLocaleString('id-ID')}</p>
                        </div>

                        <div className="bg-surface-container-high border border-white/5 rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-center mb-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-sm">trending_up</span></div>
                            <span className="text-primary font-black text-lg">25%</span>
                          </div>
                          <h5 className="font-bold text-white text-sm mb-1">Index Fund / ETF</h5>
                          <p className="text-lg font-mono text-white">Rp {(surplus > 0 ? surplus * 0.25 : 0).toLocaleString('id-ID')}</p>
                        </div>

                        <div className="bg-surface-container-high border border-white/5 rounded-xl p-5 hover:border-purple-400/50 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-center mb-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400"><span className="material-symbols-outlined text-sm">rocket_launch</span></div>
                            <span className="text-purple-400 font-black text-lg">10%</span>
                          </div>
                          <h5 className="font-bold text-white text-sm mb-1">Saham / Kripto</h5>
                          <p className="text-lg font-mono text-white">Rp {(surplus > 0 ? surplus * 0.1 : 0).toLocaleString('id-ID')}</p>
                        </div>
                      </div>

                      {/* AI Market & Instrument Detail Analysis */}
                      <div className="flex flex-col gap-6 mt-4">
                        <div className="bg-surface-container border-l-4 border-l-blue-400 p-5 rounded-r-xl rounded-l-sm">
                          <h5 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">public</span> 
                            Analisis Makroekonomi & Arah Pasar Saat Ini
                          </h5>
                          <p className="text-sm text-on-surface-variant leading-relaxed">
                            <strong>Konteks Pasar:</strong> Saat ini pasar global sedang menghadapi ekspektasi pemotongan suku bunga (Rate Cut) oleh bank sentral. Dalam kondisi ini, instrumen berpendapatan tetap seperti <strong>Obligasi Negara (SBN)</strong> sangat diuntungkan karena harga obligasi akan naik ketika suku bunga turun. Oleh karena itu, AI sangat merekomendasikan porsi besar (35%) di instrumen ini untuk mengunci (lock) kupon tinggi saat ini.
                          </p>
                        </div>

                        <div className="bg-surface-container border-l-4 border-l-error p-5 rounded-r-xl rounded-l-sm">
                          <h5 className="font-bold text-error mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">warning</span> 
                            Risiko Instrumen & Skenario Terburuk (Worst-Case)
                          </h5>
                          <ul className="text-sm text-on-surface-variant leading-relaxed space-y-3 list-disc pl-4">
                            <li>
                              <strong className="text-white">Index Fund (LQ45):</strong> Berisiko turun hingga -20% dalam setahun jika terjadi resesi ekonomi nasional atau <em>market crash</em> global. <strong>Skenario terburuk:</strong> Anda terpaksa mencairkan dana saat pasar sedang hancur (Cut Loss).
                            </li>
                            <li>
                              <strong className="text-white">Kripto (Bitcoin/Ethereum):</strong> Memiliki volatilitas ekstrem. Harga bisa anjlok -50% hingga -70% dalam siklus <em>Bear Market</em>. <strong>Skenario terburuk:</strong> Dana 10% Anda menyusut menjadi hampir tidak bernilai dalam jangka pendek, dan butuh bertahun-tahun untuk pulih.
                            </li>
                            <li>
                              <strong className="text-white">Obligasi & RDPU:</strong> Sangat aman dari fluktuasi harga ekstrem, namun memiliki <em>Inflation Risk</em>. <strong>Skenario terburuk:</strong> Jika hiperinflasi terjadi (harga barang naik tak terkendali), nilai uang Anda di instrumen ini tidak akan cukup untuk mengejar kenaikan harga tersebut.
                            </li>
                          </ul>
                        </div>

                        <div className="bg-surface-dim p-4 rounded-xl border border-white/5 text-xs text-on-surface-variant/80 italic flex gap-3">
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant/50">gavel</span>
                          <p>
                            <strong>Disclaimer:</strong> Keputusan finansial ada di tangan Anda. Output AI ini dibuat murni berdasarkan probabilitas matematis dan data historis pasar, BUKAN merupakan paksaan pembelanjaan aset. Berinvestasilah dengan uang dingin.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex justify-between items-center bg-primary/10 p-4 rounded-xl border border-primary/20">
                        <p className="text-sm text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">magic_button</span>
                          Simulasi Compounding Interest (Bunga Berbunga) 10 tahun dikirim ke tab <strong>Rencana</strong>.
                        </p>
                        <button onClick={() => router.push('/rencana')} className="bg-primary text-[#052e16] px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-fixed transition-colors">Buka Rencana</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PHASE 3: LITERACY AGENT (CHATBOT) */}
                <div className="flex flex-col gap-5 mt-6 relative">
                  
                  <h3 className="text-xl font-bold font-display text-on-surface flex items-center gap-3 mb-2 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40 shadow-lg shadow-purple-500/10">
                      <span className="material-symbols-outlined">school</span>
                    </div>
                    <div>
                      <span className="text-sm text-purple-400 font-bold tracking-widest block uppercase mb-1">Agent 3 Executed</span>
                      Literacy Agent (Context-Aware Tutor)
                    </div>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pl-0 md:pl-20">
                    
                    {/* Agent Reasoning Log (The "Brain") */}
                    <div className="md:col-span-12 bg-purple-950/30 border border-purple-500/20 rounded-2xl p-5 font-mono text-sm text-purple-200">
                      <div className="flex items-center gap-2 text-purple-400 mb-3 font-bold border-b border-purple-500/20 pb-2">
                        <span className="material-symbols-outlined text-[18px]">memory</span>
                        Agent 3 Shared Memory Access
                      </div>
                      <div className="space-y-1">
                        <p>{`> Initializing LLM Sandbox...`}</p>
                        <p>{`> Mengimpor memori dari Agent 1: [DTI: ${dtiRatio}%, Risiko: ${correctedRisk}]`}</p>
                        <p>{`> Mengimpor memori dari Agent 2: [Alokasi Dominan: SBN 35%, RDPU 30%]`}</p>
                        <p className="text-purple-400 font-bold mt-2 pt-2 border-t border-purple-500/20">
                          {`> SYSTEM READY. Agen edukasi sekarang memahami konteks finansial User secara spesifik dan siap menjawab pertanyaan.`}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-12 bg-surface-container-low border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                      <div className="bg-surface-bright/50 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-purple-400">forum</span>
                          <div>
                            <h4 className="font-bold text-on-surface text-base">Konsultasi Live dengan AI</h4>
                            <p className="text-xs text-on-surface-variant">Tanya apa pun terkait hasil kalkulasi di atas.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20 text-xs font-bold">
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div> Context Injected
                        </div>
                      </div>
                      
                      {/* Chat History */}
                      <div className="p-6 h-[350px] overflow-y-auto no-scrollbar space-y-6 bg-surface-dim/30">
                        {chatMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.role === "ai" && (
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 text-purple-400 mr-3 mt-1 flex-shrink-0">
                                <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                              </div>
                            )}
                            <div className={`max-w-[85%] text-[15px] px-5 py-4 leading-relaxed ${
                              msg.role === "user" 
                                ? "bg-primary text-[#052e16] font-medium rounded-2xl rounded-tr-sm shadow-md" 
                                : "bg-surface-container-high text-on-surface rounded-2xl rounded-tl-sm border border-white/5 shadow-sm"
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {isChatTyping && (
                          <div className="flex justify-start">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 text-purple-400 mr-3 mt-1 flex-shrink-0">
                              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                            </div>
                            <div className="bg-surface-container-high px-5 py-4 rounded-2xl rounded-tl-sm border border-white/5 flex gap-2 items-center">
                              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-purple-400 rounded-full" />
                              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-purple-400 rounded-full" />
                              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-purple-400 rounded-full" />
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Chat Input */}
                      <div className="p-4 bg-surface-container border-t border-white/5">
                        <div className="relative flex items-center bg-surface-container-highest border border-white/10 rounded-xl overflow-hidden focus-within:border-purple-500/50 transition-colors">
                          <input 
                            type="text"
                            placeholder="Ketik pertanyaan Anda tentang strategi portofolio ini..."
                            className="w-full bg-transparent py-4 pl-5 pr-14 text-[15px] text-on-surface focus:outline-none"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                          />
                          <button 
                            onClick={handleSendChat}
                            className="absolute right-2 w-10 h-10 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center shadow-lg"
                          >
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
