import { RiskProfileResult, StressTestResult } from './types';
import { callAgentLLM } from './LLMService';

export class MarketAnalystAgent {
  public async runStressTest(riskProfile: RiskProfileResult): Promise<StressTestResult> {
    const a3SystemPrompt = `Kamu adalah Analis Pasar dan Manajer Risiko (Risk Manager) yang SANGAT EMPATIK, RAMAH, dan MENDIDIK. Diberikan input JSON profil keuangan user.
Lakukan stress test terhadap keuangannya (Market Crash, Hiperinflasi, PHK). Sampaikan dampaknya dengan realistis namun tetap HANGAT, SUPORTIF, dan TIDAK MENAKUT-NAKUTI.

Kembalikan HANYA format JSON valid tanpa teks lain:
{
  "survivalMonths": number, // (Dana Darurat saat ini / (Target Dana Darurat / 6))
  "isSurvivalDanger": boolean, // true jika survivalMonths < 3
  "floatingDebtImpact": number, // Jika bunga utang naik, berapa sisa surplus mereka
  "marketCrashImpact": string, // Penjelasan 1 paragraf: Apa dampaknya jika pasar saham anjlok. Gunakan gaya bahasa teman yang memberi nasehat santai.
  "hyperinflationImpact": string, // Penjelasan 1 paragraf: Dampak hiperinflasi.
  "jobLossImpact": string, // Penjelasan 1 paragraf: Dampak jika kena PHK. Beri semangat!
  "conclusion": string // Kesimpulan akhir dan 2-3 langkah praktis (Plan Aksi) agar pertahanan finansial mereka lebih tangguh. Gunakan bullet point/emoji.
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
      marketCrashImpact = `Portofolio Anda sudah dirancang dengan aman! Jadi kalaupun pasar saham anjlok, dampaknya sangat minim buat Anda (estimasi turun maksimal -8%). Tetap tenang dan jangan panic selling ya.`;
    } else {
      marketCrashImpact = `Karena saat ini kita memprioritaskan aset yang stabil, kalau bursa saham anjlok Anda tidak perlu khawatir berlebihan. Uang Anda mayoritas aman dari badai pasar saham.`;
    }

    let hyperinflationImpact = "";
    if (riskProfile.isHealthy) {
      hyperinflationImpact = "Anda sudah selangkah lebih maju! Sebagian aset Anda ada di instrumen pertumbuhan tinggi yang bisa mengalahkan inflasi. Jadi daya beli Anda tetap aman ke depannya.";
    } else {
      hyperinflationImpact = "Saat ini uang Anda mayoritas ada di tabungan biasa atau instrumen berisiko sangat rendah. Ke depannya, kita perlu pelan-pelan bergeser ke instrumen pertumbuhan agar uang Anda tidak tergerus inflasi ya!";
    }

    let jobLossImpact = "";
    if (riskProfile.emergencyProgress >= 100) {
      jobLossImpact = "SUPER AMAN! Anda punya bantalan dana darurat yang luar biasa kokoh. Anda bisa fokus mencari peluang baru dengan tenang tanpa memikirkan tagihan bulan depan. Great job!";
    } else {
      jobLossImpact = `Saat ini dana darurat Anda baru di angka ${riskProfile.emergencyProgress.toFixed(1)}%. Kalau skenario terburuk ini terjadi, Anda mungkin harus sedikit berhemat. Yuk kita semangat kumpulkan sampai 100%!`;
    }

    const conclusion = isSurvivalDanger 
      ? "Halo! Ketahanan finansial itu ibarat pondasi rumah. Saat ini pondasi Anda masih butuh penguatan. \n\n🎯 **Plan Aksi Ketahanan:**\n1. 🛡️ Prioritas 100% surplus Anda bulan ini ke Reksa Dana Pasar Uang sampai Dana Darurat penuh.\n2. 💸 Hindari cicilan baru (terutama paylater) bulan ini.\n3. Jangan khawatir, langkah kecil Anda menyisihkan uang hari ini akan menyelamatkan Anda dari krisis esok hari!"
      : "Wah, pertahanan finansial Anda sudah sekuat benteng! \n\n🚀 **Plan Aksi Lanjutan:**\n1. Anda sudah aman dari risiko PHK atau krisis mendadak, pertahankan Dana Darurat Anda!\n2. Anda bisa mulai fokus menyetir surplus Anda ke aset pertumbuhan (Reksa Dana Indeks/Saham) untuk melawan hiperinflasi.\n3. Lanjutkan kebiasaan baik ini!";

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
