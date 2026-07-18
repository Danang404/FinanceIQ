/**
 * AgentMemoryStore — Persistent memory using localStorage.
 * Stores analysis history, user preferences, and reasoning traces across sessions.
 */
import { MemoryEntry, ReasoningTrace, RiskProfileResult, WealthAllocationResult, StressTestResult } from './types';

const BASE_MEMORY_KEY = 'financeiq_agent_memory';
const MAX_EPISODIC_ENTRIES = 50;

export interface AgentMemoryState {
  // Short-term: Current session data
  shortTerm: Record<string, any>;
  // Episodic: History of past analyses
  episodic: MemoryEntry[];
  // Reasoning traces from all agents
  reasoningTraces: ReasoningTrace[];
  // Last analysis results (for chatbot context injection)
  lastAnalysis: {
    riskProfile: RiskProfileResult | null;
    wealthAllocation: WealthAllocationResult | null;
    stressTest: StressTestResult | null;
    inputData: Record<string, any>;
    timestamp: string;
  } | null;
  // User profile learned over time
  userProfile: {
    analysisCount: number;
    firstSeenAt: string;
    lastSeenAt: string;
    preferredRisk: string;
    avgIncome: number;
  };
}

function getDefaultMemory(): AgentMemoryState {
  return {
    shortTerm: {},
    episodic: [],
    reasoningTraces: [],
    lastAnalysis: null,
    userProfile: {
      analysisCount: 0,
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      preferredRisk: '',
      avgIncome: 0,
    }
  };
}

export class AgentMemoryStore {
  private state: AgentMemoryState;
  private memoryKey: string;

  constructor(userId: string = 'default') {
    this.memoryKey = `${BASE_MEMORY_KEY}_${userId}`;
    this.state = this.load();
  }

  public clear(): void {
    this.state = getDefaultMemory();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.memoryKey);
    }
  }

  // ---- Persistence ----

  private load(): AgentMemoryState {
    if (typeof window === 'undefined') return getDefaultMemory();
    try {
      const raw = localStorage.getItem(this.memoryKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('[Memory] Failed to load:', e);
    }
    return getDefaultMemory();
  }

  private save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.memoryKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('[Memory] Failed to save:', e);
    }
  }

  // ---- Short-Term Memory ----

  setShortTerm(key: string, value: any): void {
    this.state.shortTerm[key] = value;
    this.save();
  }

  getShortTerm(key: string): any {
    return this.state.shortTerm[key];
  }

  clearShortTerm(): void {
    this.state.shortTerm = {};
    this.save();
  }

  // ---- Episodic Memory ----

  addEpisodicEntry(key: string, value: any, agentName: string): void {
    const entry: MemoryEntry = {
      key,
      value,
      agentName,
      timestamp: new Date().toISOString(),
    };
    this.state.episodic.push(entry);
    // Trim old entries
    if (this.state.episodic.length > MAX_EPISODIC_ENTRIES) {
      this.state.episodic = this.state.episodic.slice(-MAX_EPISODIC_ENTRIES);
    }
    this.save();
  }

  getEpisodicEntries(agentName?: string): MemoryEntry[] {
    if (agentName) {
      return this.state.episodic.filter(e => e.agentName === agentName);
    }
    return this.state.episodic;
  }

  // ---- Reasoning Traces ----

  addReasoningTrace(trace: ReasoningTrace): void {
    this.state.reasoningTraces.push(trace);
    this.save();
  }

  getReasoningTraces(): ReasoningTrace[] {
    return this.state.reasoningTraces;
  }

  clearReasoningTraces(): void {
    this.state.reasoningTraces = [];
    this.save();
  }

  // ---- Last Analysis ----

  saveAnalysis(
    riskProfile: RiskProfileResult | null,
    wealthAllocation: WealthAllocationResult | null,
    stressTest: StressTestResult | null,
    inputData: Record<string, any>
  ): void {
    this.state.lastAnalysis = {
      riskProfile,
      wealthAllocation,
      stressTest,
      inputData,
      timestamp: new Date().toISOString(),
    };

    // Update user profile stats
    this.state.userProfile.analysisCount++;
    this.state.userProfile.lastSeenAt = new Date().toISOString();
    if (inputData.risk) {
      this.state.userProfile.preferredRisk = inputData.risk;
    }
    if (inputData.income) {
      const inc = Number(inputData.income);
      const prev = this.state.userProfile.avgIncome;
      const count = this.state.userProfile.analysisCount;
      this.state.userProfile.avgIncome = prev + (inc - prev) / count;
    }

    this.save();
  }

  getLastAnalysis() {
    return this.state.lastAnalysis;
  }

  // ---- User Profile ----

  getUserProfile() {
    return this.state.userProfile;
  }

  // ---- Context Builder (for chatbot) ----

  buildContextForChatbot(): string {
    const analysis = this.state.lastAnalysis;
    if (!analysis) return "Belum ada data analisis. User belum menjalankan pipeline.";

    const rp = analysis.riskProfile;
    const wa = analysis.wealthAllocation;
    const st = analysis.stressTest;
    const input = analysis.inputData;

    return `
=== KONTEKS PORTOFOLIO USER (dari Memory Store) ===
Pendapatan: Rp ${Number(input.income || 0).toLocaleString('id-ID')}
Pengeluaran: Rp ${Number(input.expense || 0).toLocaleString('id-ID')}
Cicilan: Rp ${Number(input.debt || 0).toLocaleString('id-ID')}
Tabungan: Rp ${Number(input.savings || 0).toLocaleString('id-ID')}
Usia: ${input.age || 'N/A'} tahun
Status Kerja: ${input.employmentStatus || 'N/A'}
Tanggungan: ${input.dependents || 'N/A'} orang
Pengalaman Investasi: ${input.investmentExperience || 'N/A'}
Horison Investasi: ${input.investmentHorizon || 'N/A'}
Tujuan: ${input.goal || 'N/A'}

=== HASIL RISK PROFILER (Agent 1) ===
Surplus Bulanan: Rp ${rp?.surplus?.toLocaleString('id-ID') || '0'}
DTI Ratio: ${rp?.dtiRatio || 0}%
Savings Rate: ${rp?.savingsRate || 0}%
Emergency Fund Progress: ${rp?.emergencyProgress || 0}%
Profil Risiko Terkoreksi: ${rp?.correctedRisk || 'N/A'}
Penjelasan AI: ${rp?.explanation || 'N/A'}

=== HASIL WEALTH MANAGER (Agent 2) ===
Alokasi RDPU: Rp ${wa?.allocations?.rdpu?.toLocaleString('id-ID') || '0'}
Alokasi SBN: Rp ${wa?.allocations?.sbn?.toLocaleString('id-ID') || '0'}
Alokasi Index Fund: Rp ${wa?.allocations?.indexFund?.toLocaleString('id-ID') || '0'}
Alokasi Crypto: Rp ${wa?.allocations?.crypto?.toLocaleString('id-ID') || '0'}
Proyeksi 10 Tahun: Rp ${wa?.projections?.[9]?.toLocaleString('id-ID') || '0'}
Pesan AI: ${wa?.message || 'N/A'}

=== HASIL STRESS TEST (Agent 3) ===
Survival Months: ${st?.survivalMonths || 0} bulan
Market Crash Impact: ${st?.marketCrashImpact || 'N/A'}
Job Loss Impact: ${st?.jobLossImpact || 'N/A'}
Kesimpulan: ${st?.conclusion || 'N/A'}

Jumlah analisis user sebelumnya: ${this.state.userProfile.analysisCount}
    `.trim();
  }

  // ---- Reset ----

  reset(): void {
    this.state = getDefaultMemory();
    this.save();
  }
}

// Singleton instances per user
const memoryInstances: Record<string, AgentMemoryStore> = {};

export function getMemoryStore(userId: string = 'default'): AgentMemoryStore {
  if (!memoryInstances[userId]) {
    memoryInstances[userId] = new AgentMemoryStore(userId);
  }
  return memoryInstances[userId];
}
