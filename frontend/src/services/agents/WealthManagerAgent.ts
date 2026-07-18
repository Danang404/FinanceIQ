import { RiskProfileResult, WealthAllocationResult } from './types';
import { callAgentLLM } from './LLMService';

export class WealthManagerAgent {
  public async generatePlan(riskProfile: RiskProfileResult): Promise<WealthAllocationResult> {
    const surplus = riskProfile.surplus;

    const a2SystemPrompt = `Kamu adalah pakar Wealth Management. Diberikan input profil risiko JSON.
Tugasmu adalah memberikan alokasi investasi bulanan (RDPU, SBN, IndexFund, Crypto) dan proyeksi pertumbuhan uangnya selama 10 tahun (10 elemen array).
Kembalikan HANYA format JSON valid tanpa teks lain:
{
  "yearlyInvestment": number, // surplus bulanan * 12
  "allocations": { "rdpu": number, "sbn": number, "indexFund": number, "crypto": number }, // alokasi dalam rupiah berdasarkan persentase
  "projections": number[], // array 10 angka, proyeksi akumulasi per tahun selama 10 tahun
  "maxProjection": number,
  "totalOriginalCapital": number,
  "pureInterest": number,
  "message": string // Pesan profesional mengenai alokasi tersebut
}`;
    const a2UserPrompt = JSON.stringify(riskProfile);

    try {
        const result = await callAgentLLM(a2SystemPrompt, a2UserPrompt, 1);
        if (result) return result;
    } catch(err) {
        console.error("Agent 2 LLM failed, falling back to mock:", err);
    }

    // --- FALLBACK MOCK LOGIC ---
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
      ? `[FALLBACK] Perhatikan grafik J-Curve di atas. Inilah cara orang kaya melipatgandakan hartanya...`
      : `[FALLBACK] Saat ini Anda tidak memiliki sisa gaji (surplus) untuk diinvestasikan...`;

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
