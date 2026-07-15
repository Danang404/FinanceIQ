import { RawFinancialData, RiskProfileResult } from './types';

/**
 * AGENT 1: Risk Profiler
 * LLM Integration Plan:
 * 1. Convert `RawFinancialData` to a prompt string.
 * 2. Send to LLM (e.g. "You are an expert financial risk profiler...").
 * 3. Instruct LLM to return JSON matching `RiskProfileResult`.
 * 4. Parse JSON and return.
 */
export class RiskProfilerAgent {
  public async analyzeRisk(data: RawFinancialData): Promise<RiskProfileResult> {
    const income = Number(data.income);
    const expense = Number(data.expense);
    const debt = Number(data.debt);
    const savings = Number(data.savings);

    // --- MOCK LOGIC (To be replaced by LLM) ---
    const surplus = income - expense - debt;
    const dtiRatio = (debt / income) * 100;
    const savingsRate = (surplus / income) * 100;
    
    const emergencyTarget = expense * 6;
    const emergencyProgress = Math.min((savings / emergencyTarget) * 100, 100);

    const isHealthy = dtiRatio < 30 && emergencyProgress >= 100;
    
    let correctedRisk = data.risk;
    let explanation = "";

    if (!isHealthy && data.risk !== "KONSERVATIF") {
      correctedRisk = "KONSERVATIF";
      explanation = `[OVERRIDE AI] Profil awal Anda adalah ${data.risk}, namun saya mengubahnya secara paksa menjadi KONSERVATIF. Alasannya: Rasio kesehatan finansial Anda saat ini (DTI/Dana Darurat) masuk zona merah. Anda dilarang mengambil risiko pasar tinggi (Saham/Kripto) sampai pondasi keamanan Anda diperkuat.`;
    } else if (isHealthy && data.risk === "KONSERVATIF") {
      correctedRisk = "MODERAT-AGRESIF";
      explanation = `[UPGRADE AI] Profil awal Anda adalah ${data.risk}, namun AI menyarankan Anda bisa lebih agresif. Pondasi finansial Anda sangat kokoh (Utang rendah, Dana darurat penuh). Anda sangat direkomendasikan untuk mengambil sedikit guncangan pasar demi return maksimal.`;
    } else {
      explanation = `Pilihan profil ${data.risk} Anda sudah sangat selaras dengan kondisi kesehatan rasio finansial Anda saat ini. Pertahankan!`;
    }

    return {
      surplus,
      dtiRatio: Number(dtiRatio.toFixed(1)),
      savingsRate: Number(savingsRate.toFixed(1)),
      emergencyTarget,
      emergencyProgress: Number(emergencyProgress.toFixed(1)),
      isHealthy,
      originalRisk: data.risk,
      correctedRisk,
      explanation
    };
  }
}
