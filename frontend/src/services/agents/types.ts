// ============================================================
// TYPES — Extended for professional profiling & agentic system
// ============================================================

export interface RawFinancialData {
  // Section A: Data Keuangan Dasar
  income: string;
  expense: string;
  debt: string;
  savings: string;
  existingInvestment: string;    // Investasi yang sudah dimiliki
  sideIncome: string;            // Sumber pendapatan lain
  
  // Section B: Profil Demografis
  age: string;
  employmentStatus: string;      // Karyawan Tetap, Kontrak, Freelancer, Wiraswasta, PNS, Belum Bekerja
  dependents: string;            // Jumlah tanggungan
  investmentExperience: string;  // Belum Pernah, < 1 Tahun, 1-3 Tahun, 3-5 Tahun, > 5 Tahun
  knownInstruments: string[];    // Instrumen yang pernah digunakan
  investmentHorizon: string;     // < 1 Tahun, 1-3 Tahun, 3-5 Tahun, 5-10 Tahun, > 10 Tahun
  
  // Section C: Tujuan & Toleransi Risiko
  risk: string;
  goal: string;
  drawdownReaction: string;      // Reaksi jika portofolio turun 20%
  additionalNotes: string;       // Catatan tambahan
}

export interface RiskProfileResult {
  surplus: number;
  dtiRatio: number;
  savingsRate: number;
  emergencyTarget: number;
  emergencyProgress: number;
  isHealthy: boolean;
  originalRisk: string;
  correctedRisk: string;
  explanation: string;
}

export interface WealthAllocationResult {
  yearlyInvestment: number;
  allocations: {
    rdpu: number;
    sbn: number;
    indexFund: number;
    crypto: number;
  };
  projections: number[];
  maxProjection: number;
  totalOriginalCapital: number;
  pureInterest: number;
  message: string;
}

export interface StressTestResult {
  survivalMonths: number;
  isSurvivalDanger: boolean;
  floatingDebtImpact: number;
  marketCrashImpact: string;
  hyperinflationImpact: string;
  jobLossImpact: string;
  conclusion: string;
}

export interface OrchestratorResult {
  isAnalyzed: boolean;
  riskProfile: RiskProfileResult | null;
  wealthAllocation: WealthAllocationResult | null;
  stressTest: StressTestResult | null;
  reasoningTraces: ReasoningTrace[];
  agentPlan: AgentPlan | null;
}

// ============================================================
// AGENTIC TYPES
// ============================================================

export interface AgentGoal {
  agentName: string;
  objective: string;
  successCriteria: string[];
  constraints: string[];
}

export interface ReasoningTrace {
  agentName: string;
  observation: string;
  hypothesis: string;
  evidence: string[];
  conclusion: string;
  confidence: number;
  timestamp: string;
  toolsUsed: string[];
}

export interface PlanStep {
  id: number;
  action: string;
  tool?: string;
  expectedOutput: string;
  status: 'pending' | 'running' | 'done' | 'failed';
}

export interface AgentPlan {
  steps: PlanStep[];
  estimatedDuration: string;
  fallbackStrategy: string;
}

export interface MemoryEntry {
  key: string;
  value: any;
  agentName: string;
  timestamp: string;
}

// ============================================================
// MARKET DATA TYPES
// ============================================================

export interface MarketInstrument {
  ticker?: string;
  id?: string;
  name: string;
  type: string;
  sector?: string;
  risk?: string;
  price?: number;
  change?: number;
  change_pct?: number;
  nav_per_unit?: number;
  return_1y?: number;
  kupon?: number;
  tenor?: string;
  min_investasi?: number;
  manajer?: string;
  aum_triliun?: number;
  currency?: string;
  volume?: number;
  last_updated?: string;
}

export interface MarketSummary {
  ihsg: MarketInstrument | null;
  bitcoin: MarketInstrument | null;
  gold: MarketInstrument | null;
  bi_rate: number;
  rdpu_avg_return: number;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
}
