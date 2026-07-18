import { RawFinancialData, OrchestratorResult, ReasoningTrace, AgentPlan } from './types';
import { RiskProfilerAgent } from './RiskProfilerAgent';
import { WealthManagerAgent } from './WealthManagerAgent';
import { MarketAnalystAgent } from './MarketAnalystAgent';
import { AGENT_GOALS, buildAgentPlan, updatePlanStep, createReasoningTrace } from './AgentCapabilities';
import { getMemoryStore } from './AgentMemoryStore';
import { toolFinancialCalculator, toolRiskScorer, toolEmergencyFundAnalyzer, toolInvestmentAllocator } from './AgentTools';

/**
 * Orchestrator v3.0 — Full Agentic Pipeline
 * 
 * Capabilities:
 * 1. GOAL — Each agent has an explicit goal loaded before execution
 * 2. REASONING — Structured chain-of-thought traces collected from each agent
 * 3. PLANNING — A plan is built before pipeline starts, steps tracked
 * 4. MEMORY — Results saved to persistent memory store after pipeline
 * 5. TOOLS — Deterministic calculation tools invoked before LLM calls
 */
export class Orchestrator {
  private riskProfiler: RiskProfilerAgent;
  private wealthManager: WealthManagerAgent;
  private marketAnalyst: MarketAnalystAgent;
  private reasoningTraces: ReasoningTrace[] = [];
  private plan: AgentPlan | null = null;

  constructor() {
    this.riskProfiler = new RiskProfilerAgent();
    this.wealthManager = new WealthManagerAgent();
    this.marketAnalyst = new MarketAnalystAgent();
  }

  public async runPipeline(data: RawFinancialData, userId: string = 'default'): Promise<OrchestratorResult> {
    console.log(`[ORCHESTRATOR] Memulai pipeline analisis untuk user: ${userId}...`);
    
    // 0. Initialize Memory
    const memory = getMemoryStore(userId);
    memory.clearReasoningTraces();
    this.reasoningTraces = [];
    memory.setShortTerm('raw_input', data);
    
    // 1. Tool Phase: Deterministic calculations
    console.log("[ORCHESTRATOR] Menjalankan kalkulator deterministik...");
    
    // ============================================================
    // PHASE 0: PLANNING — Build execution plan
    // ============================================================
    console.log("[Orchestrator] 📋 Building execution plan...");
    this.plan = buildAgentPlan([
      AGENT_GOALS.riskProfiler,
      AGENT_GOALS.wealthManager,
      AGENT_GOALS.marketAnalyst,
    ]);

    // ============================================================
    // PHASE 1: TOOLS — Run deterministic calculations first
    // ============================================================
    console.log("[Orchestrator] 🔧 Running deterministic tools...");
    this.plan = updatePlanStep(this.plan, 1, 'running');

    const calcResult = toolFinancialCalculator({
      income: Number(data.income) || 0,
      expense: Number(data.expense) || 0,
      debt: Number(data.debt) || 0,
      savings: Number(data.savings) || 0,
      sideIncome: Number(data.sideIncome) || 0,
      existingInvestment: Number(data.existingInvestment) || 0,
    });
    console.log("[Orchestrator] ✅ FinancialCalculator:", calcResult.output);
    this.plan = updatePlanStep(this.plan, 1, 'done');

    this.plan = updatePlanStep(this.plan, 2, 'running');
    const riskScoreResult = toolRiskScorer({
      dtiRatio: calcResult.output.dtiRatio,
      emergencyProgress: calcResult.output.emergencyProgress,
      savingsRate: calcResult.output.savingsRate,
      age: Number(data.age) || 25,
      dependents: Number(data.dependents) || 0,
      investmentExperience: data.investmentExperience || 'belum_pernah',
      drawdownReaction: data.drawdownReaction || 'tahan',
      userSelectedRisk: data.risk || 'moderat',
    });
    console.log("[Orchestrator] ✅ RiskScorer:", riskScoreResult.output);

    const emergencyResult = toolEmergencyFundAnalyzer({
      savings: Number(data.savings) || 0,
      expense: Number(data.expense) || 0,
      debt: Number(data.debt) || 0,
      dependents: Number(data.dependents) || 0,
      employmentStatus: data.employmentStatus || 'karyawan_tetap',
    });
    console.log("[Orchestrator] ✅ EmergencyFundAnalyzer:", emergencyResult.output);
    this.plan = updatePlanStep(this.plan, 2, 'done');

    // Create reasoning trace for tool phase
    const toolTrace = createReasoningTrace(
      "Orchestrator",
      `Data mentah diproses: Income Rp ${Number(data.income).toLocaleString()}, Expense Rp ${Number(data.expense).toLocaleString()}, Debt Rp ${Number(data.debt).toLocaleString()}`,
      `Dengan surplus Rp ${calcResult.output.surplus.toLocaleString()} dan DTI ${calcResult.output.dtiRatio}%, profil risiko perlu dikoreksi ke ${riskScoreResult.output.correctedRisk}`,
      [
        `Tool FinancialCalculator: surplus=${calcResult.output.surplus}, dti=${calcResult.output.dtiRatio}%`,
        `Tool RiskScorer: score=${riskScoreResult.output.riskScore}, corrected=${riskScoreResult.output.correctedRisk}`,
        `Tool EmergencyFundAnalyzer: status=${emergencyResult.output.status}, progress=${emergencyResult.output.progress}%`,
      ],
      `Profil risiko terkoreksi dari "${data.risk}" menjadi "${riskScoreResult.output.correctedRisk}" berdasarkan skor ${riskScoreResult.output.riskScore}/100`,
      riskScoreResult.output.riskScore,
      ["FinancialCalculator", "RiskScorer", "EmergencyFundAnalyzer"]
    );
    this.reasoningTraces.push(toolTrace);
    memory.addReasoningTrace(toolTrace);

    // ============================================================
    // PHASE 2: AGENT 1 — Risk Profiler (LLM)
    // ============================================================
    console.log("[Orchestrator] 🧠 Running Agent 1 (Risk Profiler)...");
    this.plan = updatePlanStep(this.plan, 3, 'running');
    
    const riskProfile = await this.riskProfiler.analyzeRisk(data);
    
    const agent1Trace = createReasoningTrace(
      "Risk Profiler",
      `Menerima data keuangan user: surplus Rp ${riskProfile.surplus.toLocaleString()}, DTI ${riskProfile.dtiRatio}%`,
      `User memilih risiko "${data.risk}" tetapi data menunjukkan profil "${riskProfile.correctedRisk}" lebih sesuai`,
      [
        `Emergency Fund: ${riskProfile.emergencyProgress}% terpenuhi`,
        `Savings Rate: ${riskProfile.savingsRate}%`,
        `isHealthy: ${riskProfile.isHealthy}`,
      ],
      riskProfile.explanation || "Profil risiko terkalkulasi berdasarkan rasio keuangan objektif.",
      riskProfile.isHealthy ? 85 : 60,
      ["LLMService", "FinancialCalculator"]
    );
    this.reasoningTraces.push(agent1Trace);
    memory.addReasoningTrace(agent1Trace);
    this.plan = updatePlanStep(this.plan, 3, 'done');

    // ============================================================
    // PHASE 3: AGENT 2 & 3 — Wealth Manager + Market Analyst (Parallel)
    // ============================================================
    console.log("[Orchestrator] 🧠 Running Agent 2 & 3 in parallel...");
    this.plan = updatePlanStep(this.plan, 4, 'running');
    this.plan = updatePlanStep(this.plan, 5, 'running');

    const [wealthAllocation, stressTest] = await Promise.all([
      this.wealthManager.generatePlan(riskProfile),
      this.marketAnalyst.runStressTest(riskProfile)
    ]);

    // Agent 2 trace
    const agent2Trace = createReasoningTrace(
      "Wealth Manager",
      `Menerima context Agent 1: surplus Rp ${riskProfile.surplus.toLocaleString()}, risiko ${riskProfile.correctedRisk}`,
      `Dengan profil ${riskProfile.correctedRisk}, alokasi dominan harus ke instrumen ${riskProfile.correctedRisk === 'KONSERVATIF' ? 'RDPU/SBN' : riskProfile.correctedRisk === 'MODERAT' ? 'campuran SBN/Index' : 'Index Fund/Crypto'}`,
      [
        `RDPU: Rp ${wealthAllocation.allocations.rdpu.toLocaleString()}`,
        `SBN: Rp ${wealthAllocation.allocations.sbn.toLocaleString()}`,
        `Index: Rp ${wealthAllocation.allocations.indexFund.toLocaleString()}`,
        `Crypto: Rp ${wealthAllocation.allocations.crypto.toLocaleString()}`,
      ],
      wealthAllocation.message || "Alokasi optimal terbangun.",
      82,
      ["LLMService", "InvestmentAllocator"]
    );
    this.reasoningTraces.push(agent2Trace);
    memory.addReasoningTrace(agent2Trace);
    this.plan = updatePlanStep(this.plan, 4, 'done');

    // Agent 3 trace
    const agent3Trace = createReasoningTrace(
      "Market Analyst",
      `Menjalankan stress test pada profil dengan survival ${stressTest.survivalMonths} bulan`,
      `User ${stressTest.isSurvivalDanger ? 'RENTAN' : 'cukup aman'} menghadapi krisis berdasarkan dana darurat`,
      [
        `Survival: ${stressTest.survivalMonths} bulan`,
        `Floating Debt Impact: Rp ${stressTest.floatingDebtImpact.toLocaleString()}`,
      ],
      stressTest.conclusion || "Stress test selesai.",
      75,
      ["LLMService", "RiskScorer"]
    );
    this.reasoningTraces.push(agent3Trace);
    memory.addReasoningTrace(agent3Trace);
    this.plan = updatePlanStep(this.plan, 5, 'done');

    // ============================================================
    // PHASE 4: MEMORY — Save results
    // ============================================================
    console.log("[Orchestrator] 💾 Saving to memory store...");
    this.plan = updatePlanStep(this.plan, 6, 'running');
    
    memory.saveAnalysis(riskProfile, wealthAllocation, stressTest, data as any);
    memory.addEpisodicEntry("pipeline_complete", {
      timestamp: new Date().toISOString(),
      riskCorrected: riskProfile.correctedRisk,
      surplus: riskProfile.surplus,
    }, "Orchestrator");
    
    this.plan = updatePlanStep(this.plan, 6, 'done');
    console.log("[Orchestrator] ✅ Pipeline complete! All agents finished.");

    return {
      isAnalyzed: true,
      riskProfile,
      wealthAllocation,
      stressTest,
      reasoningTraces: this.reasoningTraces,
      agentPlan: this.plan,
    };
  }
}
