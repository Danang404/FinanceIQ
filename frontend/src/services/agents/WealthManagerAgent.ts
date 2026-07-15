import { RiskProfileResult, WealthAllocationResult } from './types';

/**
 * AGENT 2: Wealth Manager
 * LLM Integration Plan:
 * 1. Convert `RiskProfileResult` (output from Agent 1) into a prompt string.
 * 2. Send to LLM (e.g. "You are an expert Wealth Manager. Based on this risk profile, allocate their surplus...").
 * 3. Instruct LLM to return JSON matching `WealthAllocationResult`.
 * 4. Parse JSON and return.
 */
export class WealthManagerAgent {
  public async generatePlan(riskProfile: RiskProfileResult): Promise<WealthAllocationResult> {
    const surplus = riskProfile.surplus;

    // --- MOCK LOGIC (To be replaced by LLM) ---
    // Calculate simple 10-year projection (7% compounding)
    const calculateProjection = () => {
      let currentTotal = 0;
      const yearlyInvestment = surplus * 12;
      const rate = 1.07; 
      const projection = [];
      
      for(let i = 1; i <= 10; i++) {
        currentTotal = (currentTotal + yearlyInvestment) * rate;
        projection.push(currentTotal);
      }
      return projection;
    };

    const projections = surplus > 0 ? calculateProjection() : Array(10).fill(0);
    const maxProjection = Math.max(...projections, 1);
    const yearlyInvestment = surplus > 0 ? surplus * 12 : 0;
    const totalOriginalCapital = yearlyInvestment * 10;
    const finalWealth = projections[9] || 0;
    const pureInterest = finalWealth - totalOriginalCapital;

    // Define mock allocations based on corrected risk
    let allocations = { rdpu: 0, sbn: 0, indexFund: 0, crypto: 0 };
    if (surplus > 0) {
      if (riskProfile.correctedRisk === "KONSERVATIF") {
        allocations = { rdpu: surplus * 0.7, sbn: surplus * 0.3, indexFund: 0, crypto: 0 };
      } else if (riskProfile.correctedRisk === "MODERAT") {
        allocations = { rdpu: surplus * 0.3, sbn: surplus * 0.4, indexFund: surplus * 0.3, crypto: 0 };
      } else {
        allocations = { rdpu: surplus * 0.1, sbn: surplus * 0.2, indexFund: surplus * 0.5, crypto: surplus * 0.2 };
      }
    }

    const message = surplus > 0 
      ? `Perhatikan grafik J-Curve di atas. Inilah cara orang kaya melipatgandakan hartanya. Tantangan terbesar Anda adalah konsistensi berinvestasi rutin Rp ${surplus.toLocaleString('id-ID')} tiap bulan selama 120 bulan ke depan tanpa henti.`
      : `Saat ini Anda tidak memiliki sisa gaji (surplus) untuk diinvestasikan. Prioritas utama Anda adalah memangkas pengeluaran atau melunasi hutang konsumtif terlebih dahulu.`;

    return {
      yearlyInvestment,
      allocations,
      projections,
      maxProjection,
      totalOriginalCapital,
      pureInterest,
      message
    };
  }
}
