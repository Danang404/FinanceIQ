"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFinanceContext } from "../context/FinanceContext";
import { useRouter } from "next/navigation";
import { getChatService } from "../../services/agents/ChatService";
import { getInstruments, getMarketSummary } from "../../services/agents/MarketDataService";
import { MarketInstrument } from "../../services/agents/types";

// ============================================================
// INSTRUMENT CHIP COMPONENT
// ============================================================
function InstrumentChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border ${
        selected
          ? "bg-primary/20 text-primary border-primary/40 shadow-[0_0_10px_rgba(96,236,168,0.15)]"
          : "bg-surface-container border-white/10 text-on-surface-variant hover:border-white/20 hover:bg-surface-container-high"
      }`}
    >
      {label}
    </button>
  );
}

// ============================================================
// SECTION HEADER COMPONENT
// ============================================================
function SectionHeader({ step, title, subtitle, icon, isOpen, onClick }: {
  step: number; title: string; subtitle: string; icon: string; isOpen: boolean; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="w-full flex items-center gap-4 py-3 group">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${
        isOpen ? "bg-primary text-[#052e16]" : "bg-surface-container-high text-on-surface-variant group-hover:bg-primary/20 group-hover:text-primary"
      }`}>
        {step}
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
          {title}
        </h3>
        <p className="text-xs text-on-surface-variant">{subtitle}</p>
      </div>
      <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${isOpen ? "rotate-180" : ""}`}>expand_more</span>
    </button>
  );
}

// ============================================================
// MARKET TICKER BAR
// ============================================================
function MarketTickerBar({ instruments }: { instruments: Record<string, MarketInstrument[]> }) {
  const tickers = [
    ...(instruments.saham || []).slice(0, 5),
    ...(instruments.crypto || []),
  ];
  if (tickers.length === 0) return null;

  return (
    <div className="bg-surface-container/50 border border-white/5 rounded-xl px-4 py-2.5 overflow-hidden mb-6">
      <div className="flex gap-6 animate-marquee whitespace-nowrap">
        {[...tickers, ...tickers].map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-xs font-mono">
            <span className="text-on-surface font-bold">{t.ticker || t.name}</span>
            <span className="text-on-surface-variant">Rp {(t.price || t.nav_per_unit || 0).toLocaleString('id-ID')}</span>
            <span className={`font-bold ${(t.change_pct || 0) >= 0 ? "text-primary" : "text-error"}`}>
              {(t.change_pct || 0) >= 0 ? "▲" : "▼"} {Math.abs(t.change_pct || 0).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Beranda() {
  const ctx = useFinanceContext();
  const router = useRouter();

  // Form section toggles
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 1: true, 2: false, 3: false });
  const toggleSection = (n: number) => setOpenSections(p => ({ ...p, [n]: !p[n] }));

  // Loading
  const [isAnalyzingLocal, setIsAnalyzingLocal] = useState(false);

  // Chat
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatServiceRef = useRef(getChatService());

  // Market data
  const [instruments, setInstruments] = useState<Record<string, MarketInstrument[]>>({});
  const [activeInstrumentTab, setActiveInstrumentTab] = useState("saham");

  // Load market data on mount
  useEffect(() => {
    async function loadMarket() {
      const [inst, summary] = await Promise.all([getInstruments(), getMarketSummary()]);
      setInstruments(inst);
      ctx.setMarketInstruments(inst);
      ctx.setMarketSummary(summary);
    }
    loadMarket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chat scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatTyping]);

  // Init chat on analysis complete
  useEffect(() => {
    if (ctx.isAnalyzed && chatMessages.length === 0) {
      const svc = chatServiceRef.current;
      svc.reset();
      setChatMessages([{
        role: "ai",
        content: `Halo! Saya Literacy Agent 🎓 — AI Financial Advisor Anda.\n\nSaya telah membaca seluruh memori konteks portofolio Anda dari 3 agent sebelumnya. Profil risiko Anda telah dikoreksi menjadi **${ctx.riskProfileData?.correctedRisk || 'N/A'}** dengan surplus bulanan **Rp ${(ctx.riskProfileData?.surplus || 0).toLocaleString('id-ID')}**.\n\nAda yang ingin Anda tanyakan tentang strategi ini? *(${svc.getRemainingMessages()}/${svc.getMaxMessages()} pesan tersisa)*`
      }]);
    }
  }, [ctx.isAnalyzed, chatMessages.length, ctx.riskProfileData]);

  const handleAnalyze = async () => {
    if (!ctx.income || !ctx.expense) {
      alert("Mohon lengkapi minimal data Pendapatan dan Pengeluaran.");
      return;
    }
    setIsAnalyzingLocal(true);
    await ctx.runAgentPipeline();
    setIsAnalyzingLocal(false);
    chatServiceRef.current.reset();
    setChatMessages([]);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const svc = chatServiceRef.current;
    
    if (!svc.canSendMessage()) {
      setChatMessages(prev => [...prev, 
        { role: "user", content: chatInput },
        { role: "ai", content: "⚠️ **Limit percakapan gratis Anda telah habis** (5/5 pesan).\n\nSilakan **Upgrade ke Pro** untuk konsultasi tak terbatas dengan AI Financial Advisor mengenai detail portofolio dan pasar finansial Anda." }
      ]);
      setChatInput("");
      return;
    }

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setIsChatTyping(true);

    try {
      const response = await svc.sendMessage(userMsg);
      setChatMessages(prev => [...prev, { 
        role: "ai", 
        content: response + `\n\n_*(${svc.getRemainingMessages()}/${svc.getMaxMessages()} pesan tersisa)*_`
      }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "ai", content: "Maaf, terjadi kendala teknis. Silakan coba lagi." }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  // Derived data
  const surplus = ctx.riskProfileData?.surplus || 0;
  const emergencyTarget = ctx.riskProfileData?.emergencyTarget || 0;
  const emergencyProgress = ctx.riskProfileData?.emergencyProgress || 0;
  const dtiRatio = ctx.riskProfileData?.dtiRatio?.toFixed(1) || "0.0";
  const savingsRate = ctx.riskProfileData?.savingsRate?.toFixed(1) || "0.0";
  const isHealthy = ctx.riskProfileData?.isHealthy || false;
  const correctedRisk = ctx.riskProfileData?.correctedRisk || "KONSERVATIF";

  const INSTRUMENT_OPTIONS = ["Deposito", "Emas", "Reksa Dana", "Saham", "Obligasi", "Kripto", "Properti", "ETF"];

  return (
    <section className="flex-1 flex flex-col h-full bg-surface-dim relative overflow-y-auto no-scrollbar px-container-padding py-8">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-stack-gap-lg pb-20">
        
        <div className="flex flex-col gap-stack-gap-sm mb-2">
          <h1 className="font-headline-lg text-[32px] text-on-surface">Command Center AI</h1>
          <p className="font-body-md text-on-surface-variant">Pusat orkestrasi Multi-Agent AI untuk simulasi portofolio Anda.</p>
        </div>

        {/* LIVE MARKET TICKER */}
        <MarketTickerBar instruments={instruments} />

        <AnimatePresence mode="wait">
          
          {/* ============================================================ */}
          {/* STEP 1: PROFESSIONAL FORM (3 SECTIONS) */}
          {/* ============================================================ */}
          {!ctx.isAnalyzed && !isAnalyzingLocal && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-low/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-2 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">assignment</span>
                </div>
                <div>
                  <h2 className="font-bold text-on-surface text-[20px]">Formulir Profiling Profesional</h2>
                  <p className="text-sm text-on-surface-variant">Data lengkap untuk analisis multi-agent yang lebih akurat.</p>
                </div>
              </div>

              {/* ---- SECTION 1: DATA KEUANGAN ---- */}
              <SectionHeader step={1} title="Data Keuangan Dasar" subtitle="Pendapatan, pengeluaran, utang, dan tabungan" icon="account_balance_wallet" isOpen={openSections[1]} onClick={() => toggleSection(1)} />
              <AnimatePresence>
                {openSections[1] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-4 pt-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Pendapatan Bulanan (Rp) <span className="text-error">*</span></label>
                        <input type="number" value={ctx.income} onChange={e => ctx.setIncome(e.target.value)} placeholder="Contoh: 8000000" className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface font-semibold focus:border-primary/50 outline-none transition-colors placeholder:text-on-surface-variant/30" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Pengeluaran Rutin (Rp) <span className="text-error">*</span></label>
                        <input type="number" value={ctx.expense} onChange={e => ctx.setExpense(e.target.value)} placeholder="Contoh: 5000000" className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface font-semibold focus:border-primary/50 outline-none transition-colors placeholder:text-on-surface-variant/30" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Cicilan / Utang Bulanan (Rp)</label>
                        <input type="number" value={ctx.debt} onChange={e => ctx.setDebt(e.target.value)} placeholder="0 jika tidak ada" className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface font-semibold focus:border-primary/50 outline-none transition-colors placeholder:text-on-surface-variant/30" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Total Tabungan Saat Ini (Rp)</label>
                        <input type="number" value={ctx.savings} onChange={e => ctx.setSavings(e.target.value)} placeholder="Contoh: 15000000" className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface font-semibold focus:border-primary/50 outline-none transition-colors placeholder:text-on-surface-variant/30" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Investasi yang Sudah Dimiliki (Rp)</label>
                        <input type="number" value={ctx.existingInvestment} onChange={e => ctx.setExistingInvestment(e.target.value)} placeholder="Total aset investasi saat ini" className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface font-semibold focus:border-primary/50 outline-none transition-colors placeholder:text-on-surface-variant/30" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Pendapatan Tambahan / Side Income (Rp)</label>
                        <input type="number" value={ctx.sideIncome} onChange={e => ctx.setSideIncome(e.target.value)} placeholder="Freelance, usaha sampingan, dll" className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface font-semibold focus:border-primary/50 outline-none transition-colors placeholder:text-on-surface-variant/30" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ---- SECTION 2: PROFIL DEMOGRAFIS ---- */}
              <SectionHeader step={2} title="Profil Demografis & Pengalaman" subtitle="Usia, pekerjaan, tanggungan, dan pengalaman investasi" icon="person" isOpen={openSections[2]} onClick={() => toggleSection(2)} />
              <AnimatePresence>
                {openSections[2] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-4 pt-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Usia</label>
                        <input type="number" value={ctx.age} onChange={e => ctx.setAge(e.target.value)} placeholder="Contoh: 28" min="17" max="100" className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface font-semibold focus:border-primary/50 outline-none transition-colors placeholder:text-on-surface-variant/30" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Status Pekerjaan</label>
                        <select value={ctx.employmentStatus} onChange={e => ctx.setEmploymentStatus(e.target.value)} className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface focus:border-primary/50 outline-none appearance-none font-semibold transition-colors cursor-pointer">
                          <option value="karyawan_tetap">Karyawan Tetap</option>
                          <option value="kontrak">Karyawan Kontrak</option>
                          <option value="pns">PNS / ASN</option>
                          <option value="freelancer">Freelancer</option>
                          <option value="wiraswasta">Wiraswasta</option>
                          <option value="belum_bekerja">Belum Bekerja / Mahasiswa</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Jumlah Tanggungan</label>
                        <input type="number" value={ctx.dependents} onChange={e => ctx.setDependents(e.target.value)} min="0" max="15" placeholder="0" className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface font-semibold focus:border-primary/50 outline-none transition-colors placeholder:text-on-surface-variant/30" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Pengalaman Investasi</label>
                        <select value={ctx.investmentExperience} onChange={e => ctx.setInvestmentExperience(e.target.value)} className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface focus:border-primary/50 outline-none appearance-none font-semibold transition-colors cursor-pointer">
                          <option value="belum_pernah">Belum Pernah Investasi</option>
                          <option value="kurang_1_tahun">Kurang dari 1 Tahun</option>
                          <option value="1_3_tahun">1 - 3 Tahun</option>
                          <option value="3_5_tahun">3 - 5 Tahun</option>
                          <option value="lebih_5_tahun">Lebih dari 5 Tahun</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Horison Investasi</label>
                        <select value={ctx.investmentHorizon} onChange={e => ctx.setInvestmentHorizon(e.target.value)} className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface focus:border-primary/50 outline-none appearance-none font-semibold transition-colors cursor-pointer">
                          <option value="kurang_1_tahun">Kurang dari 1 Tahun</option>
                          <option value="1_3_tahun">1 - 3 Tahun</option>
                          <option value="3_5_tahun">3 - 5 Tahun</option>
                          <option value="5_10_tahun">5 - 10 Tahun</option>
                          <option value="lebih_10_tahun">Lebih dari 10 Tahun</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="font-label-md text-on-surface-variant text-sm">Instrumen yang Pernah Digunakan</label>
                        <div className="flex flex-wrap gap-2">
                          {INSTRUMENT_OPTIONS.map(inst => (
                            <InstrumentChip
                              key={inst}
                              label={inst}
                              selected={ctx.knownInstruments.includes(inst)}
                              onClick={() => {
                                if (ctx.knownInstruments.includes(inst)) {
                                  ctx.setKnownInstruments(ctx.knownInstruments.filter(i => i !== inst));
                                } else {
                                  ctx.setKnownInstruments([...ctx.knownInstruments, inst]);
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ---- SECTION 3: TUJUAN & TOLERANSI RISIKO ---- */}
              <SectionHeader step={3} title="Tujuan & Toleransi Risiko" subtitle="Tujuan finansial, profil risiko, dan reaksi behavioral" icon="flag" isOpen={openSections[3]} onClick={() => toggleSection(3)} />
              <AnimatePresence>
                {openSections[3] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-4 pt-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Tujuan Finansial Utama</label>
                        <select value={ctx.goal} onChange={e => ctx.setGoal(e.target.value)} className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface focus:border-primary/50 outline-none appearance-none font-semibold transition-colors cursor-pointer">
                          <option value="darurat">Mengamankan Dana Darurat</option>
                          <option value="rumah">Membeli Properti / Kendaraan</option>
                          <option value="pensiun">Pertumbuhan Aset / Dana Pensiun</option>
                          <option value="pendidikan">Dana Pendidikan Anak</option>
                          <option value="nikah">Dana Pernikahan</option>
                          <option value="bisnis">Modal Usaha / Bisnis</option>
                          <option value="passiveIncome">Passive Income</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Profil Risiko (Persepsi Pribadi)</label>
                        <select value={ctx.risk} onChange={e => ctx.setRisk(e.target.value)} className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface focus:border-primary/50 outline-none appearance-none font-semibold transition-colors cursor-pointer">
                          <option value="konservatif">Konservatif (Aman, Imbal Hasil Rendah)</option>
                          <option value="moderat">Moderat (Seimbang)</option>
                          <option value="agresif">Agresif (Risiko Tinggi, Imbal Hasil Tinggi)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Jika Portofolio Turun 20%, Anda Akan?</label>
                        <select value={ctx.drawdownReaction} onChange={e => ctx.setDrawdownReaction(e.target.value)} className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface focus:border-primary/50 outline-none appearance-none font-semibold transition-colors cursor-pointer">
                          <option value="jual_semua">😰 Jual Semua (Panic Sell)</option>
                          <option value="jual_sebagian">😟 Jual Sebagian</option>
                          <option value="tahan">😐 Tahan dan Tunggu Pulih</option>
                          <option value="beli_lebih">😎 Beli Lebih Banyak (Buy the Dip)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-on-surface-variant text-sm">Catatan Tambahan (Opsional)</label>
                        <textarea value={ctx.additionalNotes} onChange={e => ctx.setAdditionalNotes(e.target.value)} placeholder="Contoh: Saya berencana nikah 2 tahun lagi, butuh dana DP rumah..." rows={3} className="w-full bg-surface-container border border-white/10 rounded-xl p-3.5 text-on-surface focus:border-primary/50 outline-none transition-colors placeholder:text-on-surface-variant/30 resize-none" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ---- SUBMIT ---- */}
              <div className="pt-4 border-t border-white/5 mt-2">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
                  <p className="text-sm text-primary font-medium flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    Pipeline akan menjalankan 5 tahap: Tool Calculation → Risk Profiler (LLM) → Wealth Manager (LLM) → Market Analyst (LLM) → Memory Save. Konteks dipassing berurutan.
                  </p>
                </div>
                <button onClick={handleAnalyze} className="w-full bg-primary text-[#052e16] py-4 rounded-xl font-bold text-[16px] hover:bg-primary-fixed transition-colors flex justify-center items-center gap-3 shadow-[0_4px_30px_rgba(96,236,168,0.3)] hover:shadow-[0_4px_40px_rgba(96,236,168,0.4)]">
                  <span className="material-symbols-outlined">account_tree</span>
                  Inisiasi Pipeline Multi-Agent
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: LOADING WITH PLAN STEPS */}
          {/* ============================================================ */}
          {isAnalyzingLocal && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-10"
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
                  {[
                    { delay: 0.3, color: "text-yellow-400", text: "> [Phase 0] Planning: Membangun execution plan..." },
                    { delay: 0.8, color: "text-orange-400", text: "> [Phase 1] Tools: FinancialCalculator, RiskScorer, EmergencyFundAnalyzer..." },
                    { delay: 1.5, color: "text-blue-400", text: "> [Agent 1] Risk Profiler: Menganalisis DTI, Savings Rate, Behavioral Risk..." },
                    { delay: 2.5, color: "text-primary", text: "> [Agent 2] Wealth Manager: Membangun matriks alokasi investasi..." },
                    { delay: 3.0, color: "text-purple-400", text: "> [Agent 3] Market Analyst: Menjalankan stress test multi-skenario..." },
                    { delay: 3.5, color: "text-cyan-400", text: "> [Phase 4] Memory: Menyimpan hasil ke AgentMemoryStore..." },
                  ].map((item, i) => (
                    <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: item.delay }} className={`font-mono text-sm ${item.color}`}>
                      {item.text}
                    </motion.p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: RESULTS */}
          {/* ============================================================ */}
          {ctx.isAnalyzed && !isAnalyzingLocal && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col gap-10"
            >
              {/* Pipeline Complete Header */}
              <div className="flex justify-between items-center bg-surface-container-low border border-primary/20 px-6 py-5 rounded-2xl shadow-[0_0_30px_rgba(96,236,168,0.05)]">
                <div>
                  <h2 className="font-headline-lg-mobile text-[22px] text-primary flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined">account_tree</span> Pipeline Execution Complete
                  </h2>
                  <p className="text-sm text-on-surface-variant">
                    {ctx.agentPlan?.steps.filter(s => s.status === 'done').length || 6} langkah selesai • {ctx.reasoningTraces.length} reasoning traces • Memori tersimpan
                  </p>
                </div>
                <button onClick={() => { ctx.resetData(); setChatMessages([]); chatServiceRef.current.reset(); }} className="bg-surface-container text-white px-5 py-2.5 rounded-xl font-bold hover:bg-surface-bright transition-colors border border-white/10 flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span> Reset
                </button>
              </div>

              {/* AGENT 1: Risk Profiler */}
              <div className="flex flex-col gap-5 relative">
                <div className="absolute left-[27px] top-[40px] bottom-[-40px] w-0.5 bg-gradient-to-b from-blue-500/50 to-primary/50 z-0 hidden md:block"></div>
                <h3 className="text-xl font-bold font-display text-on-surface flex items-center gap-3 mb-2 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40 shadow-lg shadow-blue-500/10">
                    <span className="material-symbols-outlined">health_and_safety</span>
                  </div>
                  <div>
                    <span className="text-sm text-blue-400 font-bold tracking-widest block uppercase mb-1">Agent 1 — Goal: Analisis Risiko</span>
                    Risk Profiler (Audit Rasio + Behavioral)
                  </div>
                </h3>

                <div className="flex flex-col gap-6 pl-0 md:pl-20">
                  {/* Reasoning Trace */}
                  <div className="bg-blue-950/30 border border-blue-500/20 rounded-2xl p-5 font-mono text-sm text-blue-200 w-full shadow-lg">
                    <div className="flex items-center gap-2 text-blue-400 mb-3 font-bold border-b border-blue-500/20 pb-2">
                      <span className="material-symbols-outlined text-[18px]">terminal</span>
                      Agent 1: Reasoning Trace (Goal → Observation → Conclusion)
                    </div>
                    <div className="space-y-1">
                      <p className="text-blue-500/80 italic">{`> GOAL: "Tentukan profil risiko PALING AMAN dan REALISTIS untuk user ini."`}</p>
                      <p className="text-yellow-400/80 mt-2">{`> TOOLS USED: [FinancialCalculator, RiskScorer, EmergencyFundAnalyzer]`}</p>
                      <p className="mt-2">{`> [Observation] DTI=${dtiRatio}%, Savings Rate=${savingsRate}%, Emergency Fund=${emergencyProgress.toFixed(1)}%`}</p>
                      <p>{`> [Observation] Usia=${ctx.age || 'N/A'}, Tanggungan=${ctx.dependents || '0'}, Pengalaman=${ctx.investmentExperience}, Drawdown Reaction=${ctx.drawdownReaction}`}</p>
                      <p className={Number(dtiRatio) > 30 ? "text-error" : "text-primary"}>{`> [Conclusion] Profil dikoreksi: "${ctx.risk}" → "${correctedRisk}" (Confidence: ${isHealthy ? '85' : '60'}%)`}</p>
                      <p className="text-blue-400 font-bold mt-2 pt-2 border-t border-blue-500/20">
                        {`> OUTPUT → Agent 2 & 3: { surplus: ${surplus}, corrected_risk: "${correctedRisk}", isHealthy: ${isHealthy} }`}
                      </p>
                    </div>
                  </div>

                  {/* Surplus Card */}
                  <div className="bg-surface-container-low border border-white/5 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                      <div className="flex-1">
                        <h4 className="font-bold text-on-surface text-xl flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                          Kapasitas Investasi (Surplus)
                        </h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                          Sisa uang tunai setelah semua kewajiban hidup terbayar. Termasuk side income Rp {Number(ctx.sideIncome || 0).toLocaleString('id-ID')}.
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
                          <div className="flex justify-between items-center"><span className="text-white">Pendapatan Utama</span> <span className="text-primary">+ Rp {Number(ctx.income).toLocaleString('id-ID')}</span></div>
                          {Number(ctx.sideIncome) > 0 && <div className="flex justify-between items-center"><span className="text-white">Side Income</span> <span className="text-primary">+ Rp {Number(ctx.sideIncome).toLocaleString('id-ID')}</span></div>}
                          <div className="flex justify-between items-center"><span className="text-white">Pengeluaran Rutin</span> <span className="text-error">- Rp {Number(ctx.expense).toLocaleString('id-ID')}</span></div>
                          <div className="flex justify-between items-center border-b border-white/10 pb-2"><span className="text-white">Cicilan / Utang</span> <span className="text-error">- Rp {Number(ctx.debt || 0).toLocaleString('id-ID')}</span></div>
                          <div className="flex justify-between items-center pt-1 font-bold text-white"><span>Total Surplus</span> <span>Rp {surplus.toLocaleString('id-ID')}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DTI & Savings Rate */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface-container-low border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col">
                      <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                        <div><h4 className="font-bold text-on-surface text-lg mb-1">Rasio Utang</h4><p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Debt-to-Income (DTI)</p></div>
                        <span className={`text-3xl font-black ${Number(dtiRatio) > 30 ? 'text-error' : 'text-primary'}`}>{dtiRatio}%</span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-1">Berapa persen gaji Anda yang habis untuk cicilan. Batas aman: <strong>maks 30%</strong>.</p>
                      <div className="w-full bg-surface-container-highest rounded-full h-3 mb-2 overflow-hidden relative">
                        <div style={{ width: `${Math.min(Number(dtiRatio), 100)}%` }} className={`h-full ${Number(dtiRatio) > 30 ? 'bg-error' : 'bg-primary'} absolute left-0`}></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-on-surface-variant"><span>0% (Aman)</span><span className="text-error">Batas (30%)</span></div>
                    </div>
                    <div className="bg-surface-container-low border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col">
                      <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                        <div><h4 className="font-bold text-on-surface text-lg mb-1">Tingkat Tabungan</h4><p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Savings Rate</p></div>
                        <span className={`text-3xl font-black ${Number(savingsRate) < 10 ? 'text-error' : 'text-primary'}`}>{savingsRate}%</span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-1">Berapa persen gaji yang berhasil Anda selamatkan. Ideal: <strong>min 10-20%</strong>.</p>
                      <div className="w-full bg-surface-container-highest rounded-full h-3 mb-2 overflow-hidden relative">
                        <div style={{ width: `${Math.min(Number(savingsRate), 100)}%` }} className={`h-full ${Number(savingsRate) < 10 ? 'bg-error' : 'bg-primary'} absolute left-0`}></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-on-surface-variant"><span className="text-error">Min (10%)</span><span>100%</span></div>
                    </div>
                  </div>

                  {/* Emergency Fund */}
                  <div className="bg-surface-container-low border border-white/5 rounded-2xl p-6 shadow-lg">
                    <h4 className="font-bold text-on-surface text-xl flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-secondary">security</span> Dana Darurat
                    </h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                      Target disesuaikan dengan status pekerjaan (<strong>{ctx.employmentStatus}</strong>) dan <strong>{ctx.dependents}</strong> tanggungan.
                    </p>
                    <div className="bg-surface-container/50 border border-white/5 p-5 rounded-xl">
                      <div className="flex justify-between items-end mb-3">
                        <div><span className="block text-sm text-on-surface-variant mb-1">Target:</span><span className="font-bold text-white text-xl">Rp {emergencyTarget.toLocaleString('id-ID')}</span></div>
                        <div className="text-right"><span className="block text-sm text-on-surface-variant mb-1">Terkumpul:</span><span className="font-bold text-secondary text-xl">Rp {Number(ctx.savings).toLocaleString('id-ID')}</span></div>
                      </div>
                      <div className="w-full bg-surface-container-highest rounded-full h-4 mb-2 overflow-hidden border border-white/10 relative">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${emergencyProgress}%` }} transition={{ delay: 0.5, duration: 1 }} className={`h-full absolute left-0 top-0 ${emergencyProgress >= 100 ? 'bg-primary' : emergencyProgress > 50 ? 'bg-secondary' : 'bg-error'}`}></motion.div>
                      </div>
                      <div className="text-right text-sm font-bold text-white">{emergencyProgress.toFixed(1)}% Terpenuhi</div>
                    </div>
                  </div>

                  {/* Risk Conclusion */}
                  <div className="bg-blue-950/20 border-2 border-blue-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(59,130,246,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
                      <div className="flex flex-col items-center justify-center shrink-0 min-w-[150px]">
                        <div className="w-20 h-20 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 border border-blue-500/40">
                          <span className="material-symbols-outlined text-4xl">psychology</span>
                        </div>
                        <span className="text-[11px] text-blue-400 font-bold uppercase tracking-widest text-center">Profil Risiko<br/>Terkoreksi</span>
                      </div>
                      <div className="flex-1 w-full bg-surface-container/50 border border-white/5 rounded-xl p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 border-b border-white/10 pb-5">
                          <div>
                            <h4 className="font-bold text-white text-xl mb-1">Profil Toleransi Risiko</h4>
                            <p className="text-sm text-on-surface-variant">Analisa DTI, Savings Rate, Dana Darurat, Usia, Tanggungan & Behavioral Risk.</p>
                          </div>
                          <div className="px-6 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-black text-2xl shrink-0 uppercase">{correctedRisk}</div>
                        </div>
                        {ctx.riskProfileData?.explanation && (
                          <p className="text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">{ctx.riskProfileData.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AGENT 2: Wealth Manager */}
              <div className="flex flex-col gap-5 mt-4 relative">
                <div className="absolute left-[27px] top-[40px] bottom-[-40px] w-0.5 bg-gradient-to-b from-primary/50 to-purple-500/50 z-0 hidden md:block"></div>
                <h3 className="text-xl font-bold font-display text-on-surface flex items-center gap-3 mb-2 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/40 shadow-lg shadow-primary/10">
                    <span className="material-symbols-outlined">account_balance</span>
                  </div>
                  <div>
                    <span className="text-sm text-primary font-bold tracking-widest block uppercase mb-1">Agent 2 — Goal: Alokasi Optimal</span>
                    Wealth Manager (Portfolio Builder)
                  </div>
                </h3>

                <div className="flex flex-col gap-6 pl-0 md:pl-20">
                  {/* Reasoning */}
                  <div className="bg-green-950/30 border border-primary/20 rounded-2xl p-5 font-mono text-sm text-green-200">
                    <div className="flex items-center gap-2 text-primary mb-3 font-bold border-b border-primary/20 pb-2">
                      <span className="material-symbols-outlined text-[18px]">lan</span> Agent 2: Reasoning Trace
                    </div>
                    <div className="space-y-1">
                      <p className="text-primary/60 italic">{`> GOAL: "Bangun matriks alokasi investasi optimal berdasarkan surplus dan risiko terkoreksi."`}</p>
                      <p className="text-yellow-400/80">{`> TOOLS USED: [InvestmentAllocator, LLMService]`}</p>
                      <p className="mt-2">{`> [Input] Surplus: Rp ${surplus.toLocaleString('id-ID')}, Risk: ${correctedRisk}, Horizon: ${ctx.investmentHorizon}`}</p>
                      <p>{`> [Reasoning] Dengan profil ${correctedRisk} dan horison ${ctx.investmentHorizon}, alokasi dioptimasi untuk ${correctedRisk === 'KONSERVATIF' ? 'pelestarian modal' : correctedRisk === 'MODERAT' ? 'pertumbuhan stabil' : 'pertumbuhan agresif'}.`}</p>
                      <p className="text-primary font-bold mt-2 pt-2 border-t border-primary/20">
                        {`> OUTPUT: Alokasi [RDPU: Rp ${(ctx.wealthAllocationData?.allocations?.rdpu || 0).toLocaleString('id-ID')}, SBN: Rp ${(ctx.wealthAllocationData?.allocations?.sbn || 0).toLocaleString('id-ID')}, Index: Rp ${(ctx.wealthAllocationData?.allocations?.indexFund || 0).toLocaleString('id-ID')}, Crypto: Rp ${(ctx.wealthAllocationData?.allocations?.crypto || 0).toLocaleString('id-ID')}]`}
                      </p>
                    </div>
                  </div>

                  {/* Allocation Cards */}
                  <div className="bg-surface-container/30 border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-4">
                      <div>
                        <h4 className="font-bold text-white text-lg">Matriks Alokasi Investasi</h4>
                        <p className="text-sm text-on-surface-variant mt-1">Total: <strong className="text-primary">Rp {surplus > 0 ? surplus.toLocaleString('id-ID') : '0'}</strong>/bulan</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      {[
                        { label: "RDPU", icon: "shield", color: "secondary", val: ctx.wealthAllocationData?.allocations?.rdpu || 0 },
                        { label: "Obligasi Negara", icon: "receipt_long", color: "blue-400", val: ctx.wealthAllocationData?.allocations?.sbn || 0 },
                        { label: "Index Fund / ETF", icon: "trending_up", color: "primary", val: ctx.wealthAllocationData?.allocations?.indexFund || 0 },
                        { label: "Saham / Kripto", icon: "rocket_launch", color: "purple-400", val: ctx.wealthAllocationData?.allocations?.crypto || 0 },
                      ].map((item) => (
                        <div key={item.label} className="bg-surface-container-high border border-white/5 rounded-xl p-5 hover:border-primary/30 transition-colors">
                          <div className="flex justify-between items-center mb-3">
                            <div className={`w-8 h-8 rounded-full bg-${item.color}/10 flex items-center justify-center text-${item.color}`}><span className="material-symbols-outlined text-sm">{item.icon}</span></div>
                            <span className={`text-${item.color} font-black text-lg`}>{surplus > 0 ? Math.round((item.val / surplus) * 100) : 0}%</span>
                          </div>
                          <h5 className="font-bold text-white text-sm mb-1">{item.label}</h5>
                          <p className="text-lg font-mono text-white">Rp {item.val.toLocaleString('id-ID')}</p>
                        </div>
                      ))}
                    </div>

                    {/* AI Message */}
                    <div className="bg-surface-container border-l-4 border-l-blue-400 p-5 rounded-r-xl rounded-l-sm mb-4">
                      <h5 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">public</span> Pesan AI (Wealth Manager)
                      </h5>
                      <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                        {ctx.wealthAllocationData?.message || "Data alokasi tidak tersedia."}
                      </p>
                    </div>

                    {/* Dynamic Instrument List */}
                    <div className="mt-6 bg-surface-container/50 border border-white/5 rounded-xl p-5">
                      <h5 className="font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">list</span> Instrumen Investasi Tersedia (Live Data)
                      </h5>
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {["saham", "rdpu", "sbn", "crypto", "emas"].map(tab => (
                          <button key={tab} onClick={() => setActiveInstrumentTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${activeInstrumentTab === tab ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-surface-container-high text-on-surface-variant border border-white/5 hover:border-white/20'}`}>
                            {tab === 'rdpu' ? 'Reksa Dana' : tab === 'sbn' ? 'Obligasi' : tab}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                        {(instruments[activeInstrumentTab] || []).map((inst, i) => (
                          <div key={i} className="flex items-center justify-between bg-surface-container-high/50 rounded-lg px-4 py-3 border border-white/5 hover:border-primary/20 transition-colors">
                            <div className="flex-1">
                              <span className="font-bold text-white text-sm">{inst.ticker || inst.id}</span>
                              <span className="text-on-surface-variant text-xs ml-2">{inst.name}</span>
                              {inst.sector && <span className="text-on-surface-variant/50 text-xs ml-2">• {inst.sector}</span>}
                              {inst.manajer && <span className="text-on-surface-variant/50 text-xs ml-2">• {inst.manajer}</span>}
                            </div>
                            <div className="text-right">
                              {inst.price != null && (
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-white text-sm">{inst.currency === 'USD' ? '$' : 'Rp '}{inst.price.toLocaleString('id-ID')}</span>
                                  {inst.change_pct != null && <span className={`text-xs font-bold ${inst.change_pct >= 0 ? 'text-primary' : 'text-error'}`}>{inst.change_pct >= 0 ? '+' : ''}{inst.change_pct.toFixed(2)}%</span>}
                                </div>
                              )}
                              {inst.nav_per_unit != null && (
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-white text-sm">NAV: {inst.nav_per_unit.toLocaleString('id-ID')}</span>
                                  {inst.return_1y != null && <span className="text-primary text-xs font-bold">+{inst.return_1y}%/yr</span>}
                                </div>
                              )}
                              {inst.kupon != null && (
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-white text-sm">Kupon: {inst.kupon}%</span>
                                  {inst.tenor && <span className="text-on-surface-variant text-xs">{inst.tenor}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Disclaimer & Rencana link */}
                    <div className="mt-6 bg-surface-dim p-4 rounded-xl border border-white/5 text-xs text-on-surface-variant/80 italic flex gap-3">
                      <span className="material-symbols-outlined text-[20px] text-on-surface-variant/50">gavel</span>
                      <p><strong>Disclaimer:</strong> Output AI ini berdasarkan probabilitas matematis dan data historis, BUKAN paksaan pembelanjaan aset. Berinvestasilah dengan uang dingin.</p>
                    </div>

                    <div className="mt-6 flex justify-between items-center bg-primary/10 p-4 rounded-xl border border-primary/20">
                      <p className="text-sm text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">magic_button</span>
                        Simulasi Compounding Interest dikirim ke tab <strong>Rencana</strong>.
                      </p>
                      <button onClick={() => router.push('/rencana')} className="bg-primary text-[#052e16] px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-fixed transition-colors">Buka Rencana</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* AGENT 3: Literacy Agent (CHATBOT) */}
              <div className="flex flex-col gap-5 mt-6 relative">
                <h3 className="text-xl font-bold font-display text-on-surface flex items-center gap-3 mb-2 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40 shadow-lg shadow-purple-500/10">
                    <span className="material-symbols-outlined">school</span>
                  </div>
                  <div>
                    <span className="text-sm text-purple-400 font-bold tracking-widest block uppercase mb-1">Agent 4 — Goal: Edukasi Kontekstual</span>
                    Literacy Agent (Context-Aware AI Tutor)
                  </div>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pl-0 md:pl-20">
                  {/* Memory Access Log */}
                  <div className="md:col-span-12 bg-purple-950/30 border border-purple-500/20 rounded-2xl p-5 font-mono text-sm text-purple-200">
                    <div className="flex items-center gap-2 text-purple-400 mb-3 font-bold border-b border-purple-500/20 pb-2">
                      <span className="material-symbols-outlined text-[18px]">memory</span> Agent 4: Shared Memory Access
                    </div>
                    <div className="space-y-1">
                      <p>{`> GOAL: "Jawab pertanyaan user tentang portofolio dengan konteks spesifik dari 3 agent sebelumnya."`}</p>
                      <p>{`> MEMORY LOADED: Agent 1 [DTI: ${dtiRatio}%, Risk: ${correctedRisk}], Agent 2 [RDPU: ${surplus > 0 ? Math.round(((ctx.wealthAllocationData?.allocations?.rdpu || 0) / surplus) * 100) : 0}%, SBN: ${surplus > 0 ? Math.round(((ctx.wealthAllocationData?.allocations?.sbn || 0) / surplus) * 100) : 0}%]`}</p>
                      <p>{`> TOOLS: [ChatService, AgentMemoryStore, LLMService]`}</p>
                      <p className="text-purple-400 font-bold mt-2 pt-2 border-t border-purple-500/20">
                        {`> CONSTRAINT: Rate Limit = ${chatServiceRef.current.getMaxMessages()} pesan gratis/sesi. Sisa: ${chatServiceRef.current.getRemainingMessages()}`}
                      </p>
                    </div>
                  </div>

                  {/* Chat Window */}
                  <div className="md:col-span-12 bg-surface-container-low border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                    <div className="bg-surface-bright/50 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-purple-400">forum</span>
                        <div>
                          <h4 className="font-bold text-on-surface text-base">Konsultasi Live dengan AI</h4>
                          <p className="text-xs text-on-surface-variant">Tanya apa pun terkait hasil analisis di atas.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20 text-xs font-bold">
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                        {chatServiceRef.current.getRemainingMessages()}/{chatServiceRef.current.getMaxMessages()} Pesan
                      </div>
                    </div>

                    {/* Chat History */}
                    <div className="p-6 h-[400px] overflow-y-auto no-scrollbar space-y-6 bg-surface-dim/30">
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
                              : "bg-surface-container-high text-on-surface rounded-2xl rounded-tl-sm border border-white/5"
                          }`}>
                            {msg.content.split('\n').map((line, i) => (
                              <span key={i}>
                                {line.startsWith('**') && line.endsWith('**') ? <strong>{line.replace(/\*\*/g, '')}</strong> : line}
                                {i < msg.content.split('\n').length - 1 && <br />}
                              </span>
                            ))}
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
                      {chatServiceRef.current.canSendMessage() ? (
                        <div className="relative flex items-center bg-surface-container-highest border border-white/10 rounded-xl overflow-hidden focus-within:border-purple-500/50 transition-colors">
                          <input
                            type="text"
                            placeholder="Ketik pertanyaan Anda tentang strategi portofolio ini..."
                            className="w-full bg-transparent py-4 pl-5 pr-14 text-[15px] text-on-surface focus:outline-none"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                          />
                          <button onClick={handleSendChat} className="absolute right-2 w-10 h-10 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                          </button>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-purple-500/10 to-primary/10 border border-purple-500/30 rounded-xl p-5 text-center">
                          <p className="text-purple-400 font-bold mb-2 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">lock</span> Limit Tercapai (5/5 Pesan)
                          </p>
                          <p className="text-sm text-on-surface-variant mb-3">Upgrade ke Pro untuk konsultasi tak terbatas.</p>
                          <button className="bg-gradient-to-r from-purple-500 to-primary text-[#052e16] font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all">
                            <span className="material-symbols-outlined text-[18px] mr-2 align-middle">diamond</span> Upgrade ke Pro
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
