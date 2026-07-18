import { RawFinancialData, RiskProfileResult } from './types';
import { callAgentLLM } from './LLMService';

/**
 * AGENT 1: Risk Profiler — Enhanced with demographic & behavioral analysis
 */
export class RiskProfilerAgent {
  public async analyzeRisk(data: RawFinancialData): Promise<RiskProfileResult> {
    const a1SystemPrompt = `Kamu adalah pakar aktuaria dan financial risk profiler PROFESIONAL. 
Tugasmu menganalisis profil risiko user secara KOMPREHENSIF berdasarkan data keuangan DAN profil demografis mereka.

GOAL: Tentukan profil risiko yang PALING AMAN dan REALISTIS untuk user ini.

CONSTRAINTS:
- JANGAN rekomendasikan Agresif jika DTI > 30% atau Emergency Fund < 100%
- JANGAN rekomendasikan Agresif untuk user yang belum pernah investasi dan usia > 50
- Pertimbangkan jumlah tanggungan sebagai faktor pengali kebutuhan dana darurat
- Reaksi drawdown user (behavioral risk) adalah indikator kunci yang harus dipertimbangkan

Kembalikan respon HANYA dalam format JSON valid dengan skema berikut:
{
  "surplus": number,
  "dtiRatio": number,
  "savingsRate": number,
  "emergencyTarget": number,
  "emergencyProgress": number,
  "isHealthy": boolean,
  "originalRisk": string,
  "correctedRisk": string,
  "explanation": string
}

PENTING untuk explanation: Tulis 2-3 paragraf MENDALAM yang menyebutkan data spesifik user (usia, tanggungan, pengalaman, behavioral risk) dan mengapa kamu mengoreksi/mempertahankan profil risikonya.`;

    const userDataSummary = {
      // Financial
      income: data.income,
      expense: data.expense,
      debt: data.debt,
      savings: data.savings,
      existingInvestment: data.existingInvestment || "0",
      sideIncome: data.sideIncome || "0",
      // Demographic
      age: data.age || "tidak diketahui",
      employmentStatus: data.employmentStatus || "tidak diketahui",
      dependents: data.dependents || "0",
      investmentExperience: data.investmentExperience || "belum_pernah",
      knownInstruments: data.knownInstruments || [],
      investmentHorizon: data.investmentHorizon || "tidak diketahui",
      // Risk
      risk: data.risk,
      goal: data.goal || "tidak diketahui",
      drawdownReaction: data.drawdownReaction || "tahan",
      additionalNotes: data.additionalNotes || "",
    };

    const a1UserPrompt = JSON.stringify(userDataSummary);

    try {
      const result = await callAgentLLM(a1SystemPrompt, a1UserPrompt, 1);
      if (result) return result;
    } catch (err) {
      console.error("Agent 1 LLM failed, falling back to mock:", err);
    }

    // --- FALLBACK MOCK LOGIC (Jika API Mati) ---
    const income = Number(data.income) + Number(data.sideIncome || 0);
    const expense = Number(data.expense);
    const debt = Number(data.debt);
    const savings = Number(data.savings);
    const age = Number(data.age) || 25;
    const dependents = Number(data.dependents) || 0;

    const surplus = income - expense - debt;
    const dtiRatio = income > 0 ? (debt / income) * 100 : 0;
    const savingsRate = income > 0 ? (surplus / income) * 100 : 0;

    // Emergency target adjusted by dependents and employment
    let emergencyMonths = 6;
    if (data.employmentStatus === 'freelancer' || data.employmentStatus === 'wiraswasta') emergencyMonths = 9;
    if (data.employmentStatus === 'kontrak') emergencyMonths = 9;
    emergencyMonths += Math.min(dependents, 3);

    const emergencyTarget = expense * emergencyMonths;
    const emergencyProgress = emergencyTarget > 0 ? Math.min((savings / emergencyTarget) * 100, 100) : 0;

    const isHealthy = dtiRatio < 30 && emergencyProgress >= 100;

    // Corrected risk with behavioral and demographic factors
    let correctedRisk = data.risk.toUpperCase();
    if (!isHealthy && correctedRisk === "AGRESIF") correctedRisk = "KONSERVATIF";
    if (!isHealthy && correctedRisk === "MODERAT") correctedRisk = "KONSERVATIF";
    if (isHealthy && age < 35 && data.drawdownReaction === 'beli_lebih') correctedRisk = "AGRESIF";
    if (age > 55 && correctedRisk === "AGRESIF") correctedRisk = "MODERAT";
    if (data.investmentExperience === 'belum_pernah' && correctedRisk === "AGRESIF") correctedRisk = "MODERAT";

    // Build explanation
    const expLabel = data.investmentExperience === 'belum_pernah' ? 'belum memiliki pengalaman investasi'
      : data.investmentExperience === 'kurang_1_tahun' ? 'baru mulai berinvestasi (<1 tahun)'
        : `memiliki pengalaman investasi ${data.investmentExperience?.replace(/_/g, ' ')}`;

    const explanation = `Berdasarkan analisis komprehensif, Anda ${expLabel} dengan usia ${age} tahun dan ${dependents} tanggungan. DTI Ratio Anda berada di ${dtiRatio.toFixed(1)}% ${dtiRatio > 30 ? '(BAHAYA - melebihi batas aman 30%)' : '(dalam batas aman)'}. Dana darurat Anda baru terpenuhi ${emergencyProgress.toFixed(1)}% dari target ${emergencyMonths} bulan pengeluaran.

Status pekerjaan "${data.employmentStatus || 'tidak diketahui'}" memengaruhi kebutuhan dana darurat Anda — kami memperkirakan Anda membutuhkan ${emergencyMonths} bulan pengeluaran sebagai bantalan. Reaksi Anda terhadap penurunan portofolio 20% ("${data.drawdownReaction || 'tahan'}") menunjukkan profil behavioral risk yang ${data.drawdownReaction === 'jual_semua' ? 'cenderung panik' : data.drawdownReaction === 'beli_lebih' ? 'agresif dan percaya diri' : 'cukup stabil'}.

Oleh karena itu, profil risiko Anda ${correctedRisk === data.risk.toUpperCase() ? 'dipertahankan' : `dikoreksi dari "${data.risk}" menjadi "${correctedRisk}"`} demi keamanan finansial jangka panjang Anda.`;

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
