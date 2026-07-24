/**
 * ChatService — Chatbot dengan LLM dan konteks portofolio lengkap.
 * BUGFIX: userId sekarang di-inject dari luar agar memory store sinkron dengan Orchestrator.
 * BUGFIX: portfolioSnapshot bisa di-set langsung dari React Context sebagai fallback utama.
 */
import { callAgentLLM } from './LLMService';
import { getMemoryStore } from './AgentMemoryStore';
import { ChatMessage, RiskProfileResult, WealthAllocationResult, StressTestResult } from './types';

const MAX_FREE_MESSAGES = 5;
const CHAT_COUNT_KEY = 'financeiq_chat_count';

// Snapshot data yang di-inject langsung dari pipeline result (primary source)
export interface PortfolioSnapshot {
  // Input data
  income: string;
  expense: string;
  debt: string;
  savings: string;
  sideIncome: string;
  existingInvestment: string;
  age: string;
  employmentStatus: string;
  dependents: string;
  investmentExperience: string;
  investmentHorizon: string;
  goal: string;
  risk: string;
  drawdownReaction: string;
  additionalNotes: string;
  // Agent outputs
  riskProfile: RiskProfileResult | null;
  wealthAllocation: WealthAllocationResult | null;
  stressTest: StressTestResult | null;
}

export class ChatService {
  private conversationHistory: ChatMessage[] = [];
  private userId: string;
  private portfolioSnapshot: PortfolioSnapshot | null = null;

  constructor(userId: string = 'default') {
    this.userId = userId;
  }

  // ──────────────────────────────────────────────
  // Inject snapshot langsung dari pipeline result
  // ──────────────────────────────────────────────
  setPortfolioSnapshot(snapshot: PortfolioSnapshot): void {
    this.portfolioSnapshot = snapshot;
  }

  getMessageCount(): number {
    return this.conversationHistory.filter(m => m.role === 'user').length;
  }

  getRemainingMessages(): number {
    return Math.max(0, MAX_FREE_MESSAGES - this.getMessageCount());
  }

  canSendMessage(): boolean {
    return this.getMessageCount() < MAX_FREE_MESSAGES;
  }

  getMaxMessages(): number {
    return MAX_FREE_MESSAGES;
  }

  private saveCount(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CHAT_COUNT_KEY, String(this.getMessageCount()));
    }
  }

  // ──────────────────────────────────────────────
  // Build system prompt dengan data NYATA user
  // ──────────────────────────────────────────────
  private buildSystemPrompt(): string {
    // PRIORITY 1: Gunakan snapshot yang di-inject langsung dari pipeline
    if (this.portfolioSnapshot) {
      const s = this.portfolioSnapshot;
      const rp = s.riskProfile;
      const wa = s.wealthAllocation;
      const st = s.stressTest;

      const goalMap: Record<string, string> = {
        darurat: 'Mengamankan Dana Darurat',
        rumah: 'Membeli Properti/Kendaraan',
        pensiun: 'Pertumbuhan Aset/Dana Pensiun',
        pendidikan: 'Dana Pendidikan Anak',
        nikah: 'Dana Pernikahan',
        bisnis: 'Modal Usaha/Bisnis',
        passiveIncome: 'Passive Income',
      };
      const employMap: Record<string, string> = {
        karyawan_tetap: 'Karyawan Tetap',
        kontrak: 'Karyawan Kontrak',
        pns: 'PNS/ASN',
        freelancer: 'Freelancer',
        wiraswasta: 'Wiraswasta',
        belum_bekerja: 'Belum Bekerja/Mahasiswa',
      };

      const rdpuPct = rp && wa && rp.surplus > 0 ? Math.round((wa.allocations.rdpu / rp.surplus) * 100) : 0;
      const sbnPct  = rp && wa && rp.surplus > 0 ? Math.round((wa.allocations.sbn  / rp.surplus) * 100) : 0;
      const idxPct  = rp && wa && rp.surplus > 0 ? Math.round((wa.allocations.indexFund / rp.surplus) * 100) : 0;
      const cryPct  = rp && wa && rp.surplus > 0 ? Math.round((wa.allocations.crypto / rp.surplus) * 100) : 0;

      const rdpuNames = wa?.recommendedInstruments?.rdpu?.map(i => i.name).join(', ') || 'N/A';
      const sbnNames  = wa?.recommendedInstruments?.sbn?.map(i => i.name).join(', ') || 'N/A';
      const idxNames  = wa?.recommendedInstruments?.indexFund?.map(i => i.name).join(', ') || 'N/A';
      const cryNames  = wa?.recommendedInstruments?.crypto?.map(i => i.name).join(', ') || 'N/A';

      return `Kamu adalah "Literacy Agent" — AI Financial Advisor dari FinanceIQ.
Kamu SUDAH MEMILIKI data lengkap analisis keuangan user di bawah ini.
JANGAN pernah meminta user untuk mengisi data lagi — semua sudah tersedia.
Jawab selalu berdasarkan data spesifik user, BUKAN jawaban generik.

════════════════════════════════════════════
DATA KEUANGAN USER (INPUT PIPELINE)
════════════════════════════════════════════
• Pendapatan Utama  : Rp ${Number(s.income || 0).toLocaleString('id-ID')}/bulan
• Side Income       : Rp ${Number(s.sideIncome || 0).toLocaleString('id-ID')}/bulan
• Pengeluaran Rutin : Rp ${Number(s.expense || 0).toLocaleString('id-ID')}/bulan
• Cicilan/Utang     : Rp ${Number(s.debt || 0).toLocaleString('id-ID')}/bulan
• Tabungan Saat Ini : Rp ${Number(s.savings || 0).toLocaleString('id-ID')}
• Investasi Dimiliki: Rp ${Number(s.existingInvestment || 0).toLocaleString('id-ID')}
• Usia              : ${s.age || 'N/A'} tahun
• Status Pekerjaan  : ${employMap[s.employmentStatus] || s.employmentStatus || 'N/A'}
• Jumlah Tanggungan : ${s.dependents || '0'} orang
• Pengalaman Investasi: ${s.investmentExperience || 'N/A'}
• Horison Investasi : ${s.investmentHorizon || 'N/A'}
• Tujuan Finansial  : ${goalMap[s.goal] || s.goal || 'N/A'}
• Profil Risiko Awal: ${s.risk || 'N/A'}
• Reaksi Drawdown   : ${s.drawdownReaction || 'N/A'}
${s.additionalNotes ? `• Catatan Tambahan  : ${s.additionalNotes}` : ''}

════════════════════════════════════════════
HASIL AGENT 1 — RISK PROFILER
════════════════════════════════════════════
• Surplus Bulanan       : Rp ${rp?.surplus?.toLocaleString('id-ID') || '0'}
• DTI Ratio             : ${rp?.dtiRatio?.toFixed(1) || '0'}%  (batas aman: maks 30%)
• Savings Rate          : ${rp?.savingsRate?.toFixed(1) || '0'}%  (ideal: min 10-20%)
• Dana Darurat Progress : ${rp?.emergencyProgress?.toFixed(1) || '0'}%
• Target Dana Darurat   : Rp ${rp?.emergencyTarget?.toLocaleString('id-ID') || '0'}
• Kesehatan Finansial   : ${rp?.isHealthy ? '✅ SEHAT' : '⚠️ PERLU PERBAIKAN'}
• Profil Risiko ASLI    : ${s.risk?.toUpperCase() || 'N/A'} (dipilih user)
• Profil Risiko TERKOREKSI AI: ${rp?.correctedRisk || 'N/A'}
• Penjelasan AI         : ${rp?.explanation || 'N/A'}

════════════════════════════════════════════
HASIL AGENT 2 — WEALTH MANAGER (ALOKASI BULANAN)
════════════════════════════════════════════
• Total Diinvestasikan/bulan: Rp ${rp?.surplus?.toLocaleString('id-ID') || '0'}
• RDPU  (${rdpuPct}%): Rp ${wa?.allocations?.rdpu?.toLocaleString('id-ID') || '0'}/bulan
  → Instrumen: ${rdpuNames}
• SBN   (${sbnPct}%): Rp ${wa?.allocations?.sbn?.toLocaleString('id-ID') || '0'}/bulan
  → Instrumen: ${sbnNames}
• Index Fund (${idxPct}%): Rp ${wa?.allocations?.indexFund?.toLocaleString('id-ID') || '0'}/bulan
  → Instrumen: ${idxNames}
• Kripto (${cryPct}%): Rp ${wa?.allocations?.crypto?.toLocaleString('id-ID') || '0'}/bulan
  → Instrumen: ${cryNames}
• Proyeksi 10 Tahun: Rp ${wa?.projections?.[9]?.toLocaleString('id-ID') || '0'}
• Modal 10 Tahun   : Rp ${wa?.totalOriginalCapital?.toLocaleString('id-ID') || '0'}
• Estimasi Bunga   : Rp ${wa?.pureInterest?.toLocaleString('id-ID') || '0'}
• Pesan AI         : ${wa?.message || 'N/A'}

════════════════════════════════════════════
HASIL AGENT 3 — MARKET ANALYST (STRESS TEST)
════════════════════════════════════════════
• Survival Bulan (jika penghasilan 0): ${st?.survivalMonths || '0'} bulan
• Status Survival: ${st?.isSurvivalDanger ? '⚠️ BERBAHAYA (< 3 bulan)' : '✅ AMAN (≥ 3 bulan)'}
• Floating Debt Impact: Rp ${st?.floatingDebtImpact?.toLocaleString('id-ID') || '0'}
• Market Crash Impact: ${st?.marketCrashImpact || 'N/A'}
• Hiperinflasi Impact: ${st?.hyperinflationImpact || 'N/A'}
• PHK Impact: ${st?.jobLossImpact || 'N/A'}
• Kesimpulan Stress Test: ${st?.conclusion || 'N/A'}

════════════════════════════════════════════
ATURAN WAJIB DALAM MENJAWAB:
════════════════════════════════════════════
1. SELALU gunakan angka spesifik dari data di atas, JANGAN generik.
2. JANGAN pernah minta user input data lagi — data sudah lengkap.
3. Jika user tanya "berapa surplus saya?" → jawab "Rp ${rp?.surplus?.toLocaleString('id-ID') || '0'}/bulan".
4. Gunakan bahasa Indonesia yang ramah, edukatif, dan mudah dipahami.
5. Jawab dalam 2-4 paragraf, ringkas namun substansial dengan angka nyata.
6. JANGAN rekomendasikan beli/jual langsung — ini edukasi finansial, bukan advice berlisensi OJK.
7. Akhiri setiap jawaban dengan disclaimer singkat (1 kalimat).`;
    }

    // PRIORITY 2: Fallback ke memoryStore
    const memory = getMemoryStore(this.userId);
    const portfolioContext = memory.buildContextForChatbot();

    return `Kamu adalah "Literacy Agent" — AI Financial Advisor dari FinanceIQ.
Kamu memiliki akses ke data portofolio dan hasil analisis lengkap user di bawah ini.
JANGAN pernah minta user untuk mengisi data lagi.

${portfolioContext}

ATURAN WAJIB:
1. SELALU jawab berdasarkan data spesifik user di atas, JANGAN jawab generik.
2. Gunakan angka spesifik dari data mereka dalam jawaban.
3. Gunakan bahasa Indonesia yang ramah dan edukatif.
4. JANGAN berikan rekomendasi beli/jual langsung — ini edukasi finansial.
5. Jawab dalam 2-4 paragraf, ringkas namun substansial.
6. Akhiri dengan disclaimer singkat bahwa ini bukan nasihat keuangan resmi OJK.`;
  }

  async sendMessage(userMessage: string): Promise<string> {
    if (!this.canSendMessage()) {
      return "⚠️ Limit percakapan gratis Anda telah habis (5/5 pesan). Upgrade ke Pro untuk konsultasi tak terbatas dengan AI Financial Advisor.";
    }

    // Tambah pesan user ke history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    });
    this.saveCount();

    const systemPrompt = this.buildSystemPrompt();

    // Sertakan 3 exchange terakhir sebagai konteks percakapan
    const recentHistory = this.conversationHistory.slice(-6);
    const userPrompt = recentHistory
      .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n\n');

    try {
      const result = await callAgentLLM(systemPrompt, userPrompt, 2, false);

      let aiResponse: string;
      if (result && typeof result === 'object') {
        aiResponse = result.response || result.answer || result.content || JSON.stringify(result);
      } else if (result && typeof result === 'string') {
        aiResponse = result;
      } else {
        // LLM tidak merespons — gunakan fallback berbasis data
        aiResponse = this.buildFallbackResponse(userMessage);
      }

      this.conversationHistory.push({
        role: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      });

      return aiResponse;
    } catch (error) {
      console.error('[ChatService] Error:', error);
      const fallback = this.buildFallbackResponse(userMessage);
      this.conversationHistory.push({
        role: 'ai',
        content: fallback,
        timestamp: new Date().toISOString(),
      });
      return fallback;
    }
  }

  // Fallback berbasis data — tidak generik, tetap pakai data user
  private buildFallbackResponse(userMessage: string): string {
    const s = this.portfolioSnapshot;
    if (!s || !s.riskProfile) {
      return "Maaf, terjadi kendala teknis. Silakan coba lagi.";
    }
    const rp = s.riskProfile;
    const wa = s.wealthAllocation;

    return `Berdasarkan analisis portofolio Anda:\n\n` +
      `• Surplus bulanan Anda: **Rp ${rp.surplus.toLocaleString('id-ID')}**\n` +
      `• Profil risiko terkoreksi: **${rp.correctedRisk}**\n` +
      `• DTI Ratio: **${rp.dtiRatio.toFixed(1)}%** (${rp.dtiRatio > 30 ? 'perlu dikurangi' : 'aman'})\n` +
      `• Alokasi utama: RDPU Rp ${wa?.allocations?.rdpu?.toLocaleString('id-ID') || '0'}, SBN Rp ${wa?.allocations?.sbn?.toLocaleString('id-ID') || '0'}\n\n` +
      `_*Ini adalah informasi edukatif, bukan saran investasi resmi.*_`;
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  reset(): void {
    this.conversationHistory = [];
    this.portfolioSnapshot = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CHAT_COUNT_KEY);
    }
  }
}

// Singleton per userId
const chatInstances: Record<string, ChatService> = {};

export function getChatService(userId: string = 'default'): ChatService {
  if (!chatInstances[userId]) {
    chatInstances[userId] = new ChatService(userId);
  }
  return chatInstances[userId];
}
