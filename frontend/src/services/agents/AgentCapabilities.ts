/**
 * AgentCapabilities — Defines Goal, Reasoning, Planning structures for each agent.
 * Each agent declares its goal before execution, builds a plan, and produces reasoning traces.
 */
import { AgentGoal, ReasoningTrace, AgentPlan, PlanStep } from './types';

// ============================================================
// PREDEFINED GOALS FOR EACH AGENT
// ============================================================

export const AGENT_GOALS: Record<string, AgentGoal> = {
  riskProfiler: {
    agentName: "Risk Profiler",
    objective: "Menganalisis profil risiko user secara objektif berdasarkan data keuangan mentah, dan mengoreksi bias persepsi risiko jika data menunjukkan ketidakcocokan.",
    successCriteria: [
      "DTI Ratio dihitung dengan akurat",
      "Savings Rate terkalkulasi",
      "Emergency Fund Progress teridentifikasi",
      "Risiko terkoreksi jika isHealthy=false tapi user pilih Agresif",
      "Penjelasan reasoning disertakan"
    ],
    constraints: [
      "Tidak boleh merekomendasikan Agresif jika DTI > 30%",
      "Tidak boleh merekomendasikan Agresif jika Emergency Fund < 100%",
      "Harus memperhitungkan usia dan tanggungan dalam kalkulasi"
    ]
  },
  wealthManager: {
    agentName: "Wealth Manager",
    objective: "Membangun matriks alokasi investasi optimal berdasarkan surplus, risiko terkoreksi, dan horison investasi user.",
    successCriteria: [
      "Alokasi RDPU + SBN + Index + Crypto = 100% dari surplus",
      "Proyeksi 10 tahun dihitung dengan compound interest",
      "Alokasi sesuai dengan risiko terkoreksi (bukan persepsi user)",
      "Pesan personal dari AI disertakan"
    ],
    constraints: [
      "Jika risiko KONSERVATIF, crypto harus 0%",
      "Jika surplus <= 0, semua alokasi = 0",
      "Minimal 20% di instrumen likuid (RDPU) untuk semua profil"
    ]
  },
  marketAnalyst: {
    agentName: "Market Analyst",
    objective: "Menjalankan stress test terhadap profil keuangan user untuk mengidentifikasi kerentanan di berbagai skenario krisis.",
    successCriteria: [
      "Survival months dihitung berdasarkan dana darurat",
      "Dampak market crash -50% teridentifikasi",
      "Dampak hiperinflasi 15% teranalisis",
      "Dampak kehilangan pekerjaan tersimulasi",
      "Kesimpulan akhir diberikan"
    ],
    constraints: [
      "Harus jujur dan blak-blakan (tidak sugarcoating)",
      "Harus berdasarkan data, bukan opini",
      "Skenario harus realistis berdasarkan histori pasar Indonesia"
    ]
  },
  literacyAgent: {
    agentName: "Literacy Agent",
    objective: "Menjawab pertanyaan user tentang portofolio dan keuangan dengan konteks spesifik dari hasil analisis 3 agent sebelumnya.",
    successCriteria: [
      "Jawaban relevan dengan konteks portofolio user",
      "Bahasa disesuaikan dengan tingkat literasi user",
      "Tidak memberikan financial advice berlisensi",
      "Menyertakan disclaimer"
    ],
    constraints: [
      "Maksimal 5 pesan gratis per sesi",
      "Harus merujuk data spesifik user (bukan generik)",
      "Tidak boleh merekomendasikan saham individual spesifik"
    ]
  }
};

// ============================================================
// REASONING TRACE BUILDER
// ============================================================

export function createReasoningTrace(
  agentName: string,
  observation: string,
  hypothesis: string,
  evidence: string[],
  conclusion: string,
  confidence: number,
  toolsUsed: string[] = []
): ReasoningTrace {
  return {
    agentName,
    observation,
    hypothesis,
    evidence,
    conclusion,
    confidence: Math.min(100, Math.max(0, confidence)),
    timestamp: new Date().toISOString(),
    toolsUsed,
  };
}

// ============================================================
// PLAN BUILDER
// ============================================================

export function buildAgentPlan(agentGoals: AgentGoal[]): AgentPlan {
  const steps: PlanStep[] = [
    {
      id: 1,
      action: "Validasi data input keuangan mentah",
      tool: "FinancialCalculator",
      expectedOutput: "Data tervalidasi dan ternormalisasi",
      status: 'pending'
    },
    {
      id: 2,
      action: "Hitung rasio keuangan dasar (DTI, Savings Rate, Emergency Fund)",
      tool: "FinancialCalculator",
      expectedOutput: "Rasio keuangan terkalkulasi",
      status: 'pending'
    },
    {
      id: 3,
      action: "Analisis profil risiko dengan LLM (Risk Profiler Agent)",
      tool: "LLMService",
      expectedOutput: "RiskProfileResult JSON",
      status: 'pending'
    },
    {
      id: 4,
      action: "Bangun matriks alokasi investasi (Wealth Manager Agent)",
      tool: "LLMService + InvestmentAllocator",
      expectedOutput: "WealthAllocationResult JSON",
      status: 'pending'
    },
    {
      id: 5,
      action: "Jalankan stress test multi-skenario (Market Analyst Agent)",
      tool: "LLMService + RiskScorer",
      expectedOutput: "StressTestResult JSON",
      status: 'pending'
    },
    {
      id: 6,
      action: "Simpan hasil ke Memory Store untuk konteks chatbot",
      tool: "AgentMemoryStore",
      expectedOutput: "Memori tersimpan, chatbot siap",
      status: 'pending'
    },
  ];

  return {
    steps,
    estimatedDuration: "8-15 detik",
    fallbackStrategy: "Jika LLM gagal, gunakan rule-based calculation sebagai fallback deterministik."
  };
}

export function updatePlanStep(plan: AgentPlan, stepId: number, status: PlanStep['status']): AgentPlan {
  return {
    ...plan,
    steps: plan.steps.map(s => s.id === stepId ? { ...s, status } : s)
  };
}
