import { RiskProfileResult, StressTestResult } from './types';
import { callAgentLLM } from './LLMService';

export class MarketAnalystAgent {
  public async runStressTest(riskProfile: RiskProfileResult): Promise<StressTestResult> {
    const a3SystemPrompt = `Kamu adalah Analis Pasar dan Manajer Risiko. Diberikan input JSON profil keuangan user.
Lakukan stress test terhadap keuangannya (sangat blak-blakan, realistis dan kejam jika mereka buruk).
Kembalikan HANYA format JSON valid tanpa teks lain:
{
  "survivalMonths": number, // (Dana Darurat saat ini / (Target Dana Darurat / 6))
  "isSurvivalDanger": boolean, // true jika survivalMonths < 3
  "floatingDebtImpact": number, // Jika bunga utang naik, berapa sisa surplus mereka (bebas hitung rasional)
  "marketCrashImpact": string, // Apa yang terjadi jika saham/kripto anjlok 50%. (1 paragraf)
  "hyperinflationImpact": string, // Apa yang terjadi jika inflasi 15% pada profil ini. (1 paragraf)
  "jobLossImpact": string, // Apa yang terjadi jika besok mereka dipecat dengan kondisi uang darurat ini. (1 paragraf)
  "conclusion": string // Kesimpulan tegas dan rekomendasi.
}`;
    const a3UserPrompt = JSON.stringify(riskProfile);

    try {
        const result = await callAgentLLM(a3SystemPrompt, a3UserPrompt, 2); // Coba 2 model untuk robustness
        if (result) return result;
    } catch(err) {
        console.error("Agent 3 LLM failed, falling back to mock:", err);
    }

    // --- FALLBACK MOCK LOGIC ---
    const survivalMonths = riskProfile.emergencyTarget > 0 
      ? (riskProfile.emergencyProgress / 100) * 6 
      : 0;

    const isSurvivalDanger = survivalMonths < 3;
    
    const floatingDebtImpact = riskProfile.surplus - (riskProfile.surplus * 0.3);

    let marketCrashImpact = "";
    if (riskProfile.isHealthy) {
      marketCrashImpact = `[FALLBACK] Berkat profil ${riskProfile.correctedRisk} Anda, portofolio Anda diproyeksikan hanya akan turun maksimal -8% secara total...`;
    } else {
      marketCrashImpact = `[FALLBACK] Portofolio Anda bisa anjlok hingga -30% jika Anda memaksakan masuk ke pasar saham...`;
    }

    let hyperinflationImpact = "";
    if (riskProfile.isHealthy) {
      hyperinflationImpact = "[FALLBACK] Anda terlindungi! Karena AI memasukkan porsi Saham & Kripto...";
    } else {
      hyperinflationImpact = "[FALLBACK] PERINGATAN: Karena Anda berada di profil Konservatif, aset Anda berisiko tergerus inflasi...";
    }

    let jobLossImpact = "";
    if (riskProfile.emergencyProgress >= 100) {
      jobLossImpact = "[FALLBACK] SANGAT AMAN! Anda memiliki bantalan uang tunai darurat yang melampaui target...";
    } else {
      jobLossImpact = `[FALLBACK] BAHAYA! Dana darurat Anda baru terkumpul ${riskProfile.emergencyProgress.toFixed(1)}%...`;
    }

    const conclusion = isSurvivalDanger 
      ? "[FALLBACK] Kemampuan Anda menahan risiko berbanding lurus dengan berapa lama Anda bisa bertahan di masa krisis..."
      : "[FALLBACK] Ketahanan finansial Anda sangat solid di berbagai skenario krisis ekstrim...";

    return {
      survivalMonths: Number(survivalMonths.toFixed(1)),
      isSurvivalDanger,
      floatingDebtImpact,
      marketCrashImpact,
      hyperinflationImpact,
      jobLossImpact,
      conclusion
    };
  }
}
