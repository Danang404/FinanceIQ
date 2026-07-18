/**
 * AgentTools — Deterministic calculation tools that agents can invoke.
 * These provide rule-based foundations before LLM reasoning.
 */

export interface ToolResult {
  toolName: string;
  input: Record<string, any>;
  output: Record<string, any>;
  executionTimeMs: number;
}

// ============================================================
// TOOL 1: Financial Calculator
// ============================================================

export function toolFinancialCalculator(data: {
  income: number;
  expense: number;
  debt: number;
  savings: number;
  sideIncome?: number;
  existingInvestment?: number;
}): ToolResult {
  const start = Date.now();
  
  const totalIncome = data.income + (data.sideIncome || 0);
  const surplus = totalIncome - data.expense - data.debt;
  const dtiRatio = totalIncome > 0 ? (data.debt / totalIncome) * 100 : 0;
  const savingsRate = totalIncome > 0 ? (surplus / totalIncome) * 100 : 0;
  const emergencyTarget = data.expense * 6;
  const emergencyProgress = emergencyTarget > 0 
    ? Math.min((data.savings / emergencyTarget) * 100, 100) 
    : 0;
  const netWorth = data.savings + (data.existingInvestment || 0) - data.debt;
  const monthlyFreedom = data.expense > 0 ? data.savings / data.expense : 0;
  
  return {
    toolName: "FinancialCalculator",
    input: data,
    output: {
      totalIncome,
      surplus,
      dtiRatio: Number(dtiRatio.toFixed(2)),
      savingsRate: Number(savingsRate.toFixed(2)),
      emergencyTarget,
      emergencyProgress: Number(emergencyProgress.toFixed(2)),
      netWorth,
      monthlyFreedom: Number(monthlyFreedom.toFixed(1)),
    },
    executionTimeMs: Date.now() - start,
  };
}

// ============================================================
// TOOL 2: Risk Scorer
// ============================================================

export function toolRiskScorer(data: {
  dtiRatio: number;
  emergencyProgress: number;
  savingsRate: number;
  age: number;
  dependents: number;
  investmentExperience: string;
  drawdownReaction: string;
  userSelectedRisk: string;
}): ToolResult {
  const start = Date.now();
  
  let score = 50; // Baseline
  
  // DTI impact (-20 to +10)
  if (data.dtiRatio > 40) score -= 20;
  else if (data.dtiRatio > 30) score -= 10;
  else if (data.dtiRatio < 15) score += 10;
  
  // Emergency fund impact (-15 to +10)
  if (data.emergencyProgress >= 100) score += 10;
  else if (data.emergencyProgress < 50) score -= 15;
  else if (data.emergencyProgress < 80) score -= 5;
  
  // Savings rate impact (-10 to +10)
  if (data.savingsRate >= 20) score += 10;
  else if (data.savingsRate < 5) score -= 10;
  
  // Age factor
  if (data.age < 25) score += 5;
  else if (data.age > 55) score -= 10;
  else if (data.age > 45) score -= 5;
  
  // Dependents (-5 per dependent, max -15)
  score -= Math.min(data.dependents * 5, 15);
  
  // Experience bonus
  const expMap: Record<string, number> = {
    'belum_pernah': -10,
    'kurang_1_tahun': -5,
    '1_3_tahun': 0,
    '3_5_tahun': 5,
    'lebih_5_tahun': 10,
  };
  score += expMap[data.investmentExperience] || 0;
  
  // Behavioral risk (drawdown reaction)
  const reactionMap: Record<string, number> = {
    'jual_semua': -15,
    'jual_sebagian': -5,
    'tahan': 5,
    'beli_lebih': 10,
  };
  score += reactionMap[data.drawdownReaction] || 0;
  
  // Clamp
  score = Math.max(0, Math.min(100, score));
  
  // Determine corrected risk
  let correctedRisk: string;
  if (score >= 70) correctedRisk = "AGRESIF";
  else if (score >= 40) correctedRisk = "MODERAT";
  else correctedRisk = "KONSERVATIF";
  
  // Check if user's selection is overridden
  const userRiskUpper = data.userSelectedRisk.toUpperCase();
  const isOverridden = userRiskUpper !== correctedRisk;
  
  return {
    toolName: "RiskScorer",
    input: data,
    output: {
      riskScore: score,
      correctedRisk,
      isOverridden,
      originalRisk: data.userSelectedRisk,
      factors: {
        dtiImpact: data.dtiRatio > 30 ? "Negatif" : "Positif",
        emergencyImpact: data.emergencyProgress >= 100 ? "Aman" : "Rentan",
        ageImpact: data.age < 30 ? "Punya Waktu" : data.age > 50 ? "Perlu Konservatif" : "Optimal",
        behavioralImpact: data.drawdownReaction === 'beli_lebih' ? "Agresif Sejati" : data.drawdownReaction === 'jual_semua' ? "Panic Seller" : "Moderate",
      }
    },
    executionTimeMs: Date.now() - start,
  };
}

// ============================================================
// TOOL 3: Emergency Fund Analyzer
// ============================================================

export function toolEmergencyFundAnalyzer(data: {
  savings: number;
  expense: number;
  debt: number;
  dependents: number;
  employmentStatus: string;
}): ToolResult {
  const start = Date.now();
  
  // Multiplier based on employment stability
  let monthsNeeded = 6; // Default
  const stabilityMap: Record<string, number> = {
    'karyawan_tetap': 6,
    'pns': 3,
    'kontrak': 9,
    'freelancer': 12,
    'wiraswasta': 9,
    'belum_bekerja': 12,
  };
  monthsNeeded = stabilityMap[data.employmentStatus] || 6;
  
  // Extra months per dependent
  monthsNeeded += Math.min(data.dependents, 5);
  
  const monthlyNeed = data.expense + data.debt;
  const target = monthlyNeed * monthsNeeded;
  const progress = target > 0 ? Math.min((data.savings / target) * 100, 100) : 0;
  const gap = Math.max(0, target - data.savings);
  const monthsToGoal = data.expense > 0 ? Math.ceil(gap / (data.expense * 0.2)) : 0; // Assuming 20% savings
  
  let status: string;
  if (progress >= 100) status = "Terpenuhi";
  else if (progress >= 50) status = "Sebagian";
  else status = "Kritis";
  
  return {
    toolName: "EmergencyFundAnalyzer",
    input: data,
    output: {
      monthsNeeded,
      target,
      currentSavings: data.savings,
      progress: Number(progress.toFixed(2)),
      gap,
      monthsToGoal,
      status,
    },
    executionTimeMs: Date.now() - start,
  };
}

// ============================================================
// TOOL 4: Investment Allocator
// ============================================================

export function toolInvestmentAllocator(data: {
  surplus: number;
  correctedRisk: string;
  investmentHorizon: string;
  age: number;
}): ToolResult {
  const start = Date.now();
  
  let allocPct = { rdpu: 30, sbn: 35, indexFund: 25, crypto: 10 };
  
  // Base allocation by risk
  if (data.correctedRisk === "KONSERVATIF") {
    allocPct = { rdpu: 50, sbn: 35, indexFund: 15, crypto: 0 };
  } else if (data.correctedRisk === "MODERAT") {
    allocPct = { rdpu: 25, sbn: 35, indexFund: 30, crypto: 10 };
  } else {
    allocPct = { rdpu: 15, sbn: 20, indexFund: 40, crypto: 25 };
  }
  
  // Adjust by horizon
  if (data.investmentHorizon === 'kurang_1_tahun') {
    allocPct.rdpu += 20;
    allocPct.crypto = 0;
    allocPct.indexFund = Math.max(0, allocPct.indexFund - 15);
    allocPct.sbn = Math.max(0, allocPct.sbn - 5);
  } else if (data.investmentHorizon === 'lebih_10_tahun') {
    allocPct.indexFund += 10;
    allocPct.rdpu = Math.max(10, allocPct.rdpu - 10);
  }
  
  // Normalize to 100%
  const total = allocPct.rdpu + allocPct.sbn + allocPct.indexFund + allocPct.crypto;
  allocPct.rdpu = Math.round((allocPct.rdpu / total) * 100);
  allocPct.sbn = Math.round((allocPct.sbn / total) * 100);
  allocPct.indexFund = Math.round((allocPct.indexFund / total) * 100);
  allocPct.crypto = 100 - allocPct.rdpu - allocPct.sbn - allocPct.indexFund;
  
  const allocRp = {
    rdpu: Math.round(data.surplus * allocPct.rdpu / 100),
    sbn: Math.round(data.surplus * allocPct.sbn / 100),
    indexFund: Math.round(data.surplus * allocPct.indexFund / 100),
    crypto: Math.round(data.surplus * allocPct.crypto / 100),
  };
  
  // 10-year compound projection
  const yearlyInvestment = data.surplus * 12;
  const avgReturn = 
    (allocPct.rdpu / 100) * 0.045 + 
    (allocPct.sbn / 100) * 0.065 + 
    (allocPct.indexFund / 100) * 0.10 + 
    (allocPct.crypto / 100) * 0.15;
  
  const projections: number[] = [];
  let accumulated = 0;
  for (let y = 1; y <= 10; y++) {
    accumulated = (accumulated + yearlyInvestment) * (1 + avgReturn);
    projections.push(Math.round(accumulated));
  }
  
  return {
    toolName: "InvestmentAllocator",
    input: data,
    output: {
      percentages: allocPct,
      rupiah: allocRp,
      yearlyInvestment,
      avgReturn: Number((avgReturn * 100).toFixed(2)),
      projections,
      totalCapital10Y: yearlyInvestment * 10,
      projectedWealth10Y: projections[9] || 0,
      pureInterest: (projections[9] || 0) - yearlyInvestment * 10,
    },
    executionTimeMs: Date.now() - start,
  };
}
