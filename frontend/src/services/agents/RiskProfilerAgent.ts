import { RawFinancialData, RiskProfileResult } from './types';
import { callAgentLLM } from './LLMService';

/**
 * AGENT 1: Risk Profiler — Enhanced with demographic & behavioral analysis
 */
export class RiskProfilerAgent {
  public async analyzeRisk(data: RawFinancialData): Promise<RiskProfileResult> {
    const a1SystemPrompt = `Kamu adalah perencana keuangan (Financial Advisor) yang SANGAT EMPATIK, RAMAH, dan BERSAHABAT. 
Tugasmu menganalisis profil risiko user secara komprehensif, namun sampaikan hasilnya dengan bahasa manusia sehari-hari yang MUDAH DIPAHAMI oleh orang awam (hindari istilah teknis yang kaku dan robotik).

GOAL: Tentukan profil risiko yang PALING AMAN dan REALISTIS untuk user ini, lalu berikan kesimpulan yang suportif.

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

PENTING untuk explanation: 
Tulis 2-3 paragraf yang HANGAT, SUPORTIF, dan GAMPANG DIMENGERTI (layaknya mengobrol dengan teman). 
Beri apresiasi atas kerja keras mereka mengelola uang. Jangan gunakan jargon seperti "secara aktuaria" atau "aturan restriktif".
Sebutkan poin penting (surplus, dana darurat, DTI) dengan santai. 
Beri semangat dan jelaskan secara sederhana kenapa profil risikonya kamu tetapkan seperti itu (misal: "Karena dana daruratmu belum penuh, kita main aman dulu ya di Konservatif..."). JANGAN MENGHAKIMI atau menakut-nakuti!`;

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

    const explanation = `Halo! Luar biasa sekali Anda sudah mulai merencanakan keuangan di usia ${age} tahun. Dari analisis saya, rasio utang (DTI) Anda ada di angka ${dtiRatio.toFixed(1)}% — ${dtiRatio > 30 ? 'ini agak tinggi ya, yuk pelan-pelan kita turunkan' : 'ini angka yang sangat sehat, pertahankan ya!'}. Untuk dana darurat, saat ini sudah terkumpul ${emergencyProgress.toFixed(1)}% dari target ideal kita yaitu ${emergencyMonths} bulan pengeluaran.

Mengingat status Anda sebagai ${data.employmentStatus || 'karyawan'} dan memiliki ${dependents} tanggungan, fokus utama kita sekarang adalah memastikan "bantalan" keuangan Anda (dana darurat) benar-benar kokoh dulu sebelum melangkah lebih jauh. Apalagi Anda ${expLabel}, jadi kita bertumbuh pelan tapi pasti saja.

Oleh karena itu, profil risiko Anda yang sebelumnya "${data.risk}" ${correctedRisk === data.risk.toUpperCase() ? 'sudah sangat pas dan saya pertahankan' : `saya sarankan kita sesuaikan sedikit menjadi "${correctedRisk}"`} ya. Tujuannya sederhana: supaya pikiran Anda tetap tenang dan uang Anda tetap aman meski pasar sedang naik turun. Tetap semangat, langkah kecil hari ini adalah awal dari kekayaan Anda di masa depan!`;

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
