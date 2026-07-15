import { RawFinancialData, OrchestratorResult } from './types';
import { RiskProfilerAgent } from './RiskProfilerAgent';
import { WealthManagerAgent } from './WealthManagerAgent';
import { MarketAnalystAgent } from './MarketAnalystAgent';

/**
 * Orchestrator
 * Manages the Chain-of-Thought pipeline between the three agents.
 */
export class Orchestrator {
  private riskProfiler: RiskProfilerAgent;
  private wealthManager: WealthManagerAgent;
  private marketAnalyst: MarketAnalystAgent;

  constructor() {
    this.riskProfiler = new RiskProfilerAgent();
    this.wealthManager = new WealthManagerAgent();
    this.marketAnalyst = new MarketAnalystAgent();
  }

  /**
   * Runs the full multi-agent pipeline.
   * This is where the output of one agent becomes the context (input) for the next.
   */
  public async runPipeline(data: RawFinancialData): Promise<OrchestratorResult> {
    
    // 1. Agent 1 analyzes raw data
    const riskProfile = await this.riskProfiler.analyzeRisk(data);

    // 2. Agent 2 plans wealth allocation BASED ON Agent 1's output
    const wealthAllocation = await this.wealthManager.generatePlan(riskProfile);

    // 3. Agent 3 runs stress tests BASED ON Agent 1's output
    const stressTest = await this.marketAnalyst.runStressTest(riskProfile);

    // 4. Return combined result to the Frontend Context
    return {
      isAnalyzed: true,
      riskProfile,
      wealthAllocation,
      stressTest
    };
  }
}
