export interface RawFinancialData {
  income: string;
  expense: string;
  debt: string;
  savings: string;
  risk: string;
}

export interface RiskProfileResult {
  surplus: number;
  dtiRatio: number;
  savingsRate: number;
  emergencyTarget: number;
  emergencyProgress: number;
  isHealthy: boolean;
  originalRisk: string;
  correctedRisk: string; // Adjusted based on health
  explanation: string; // The LLM reasoning for this correction
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
  message: string; // LLM's personalized message
}

export interface StressTestResult {
  survivalMonths: number;
  isSurvivalDanger: boolean;
  floatingDebtImpact: number;
  marketCrashImpact: string;
  hyperinflationImpact: string;
  jobLossImpact: string;
  conclusion: string; // LLM's final conclusion
}

export interface OrchestratorResult {
  isAnalyzed: boolean;
  riskProfile: RiskProfileResult | null;
  wealthAllocation: WealthAllocationResult | null;
  stressTest: StressTestResult | null;
}
