import { RiskProfileResult, StressTestResult } from './types';

/**
 * AGENT 3: Market Analyst (Stress Tester)
 * LLM Integration Plan:
 * 1. Pass the `RiskProfileResult` to LLM.
 * 2. Instruct LLM to run simulations on severe economic conditions (Crash, Hyperinflation, Job Loss).
 * 3. Return JSON matching `StressTestResult`.
 */
export class MarketAnalystAgent {
  public async runStressTest(riskProfile: RiskProfileResult): Promise<StressTestResult> {
    
    // --- MOCK LOGIC (To be replaced by LLM) ---
    const survivalMonths = riskProfile.emergencyTarget > 0 
      ? (riskProfile.emergencyProgress / 100) * 6 
      : 0; // Since emergencyTarget is expense * 6, progress is % of that 6 months.

    const isSurvivalDanger = survivalMonths < 3;
    
    // Fake floating debt impact (+30% debt installment)
    const floatingDebtImpact = riskProfile.surplus - (riskProfile.surplus * 0.3); // mock calculation

    let marketCrashImpact = "";
    if (riskProfile.isHealthy) {
      marketCrashImpact = `Berkat profil ${riskProfile.correctedRisk} Anda, portofolio Anda diproyeksikan hanya akan turun maksimal -8% secara total. Uang Anda selamat karena mayoritas dana diparkir di instrumen berisiko rendah.`;
    } else {
      marketCrashImpact = `Portofolio Anda bisa anjlok hingga -30% jika Anda memaksakan masuk ke pasar saham. Namun karena sistem menahan Anda di profil KONSERVATIF, penurunan Anda ditahan di level -2%.`;
    }

    let hyperinflationImpact = "";
    if (riskProfile.isHealthy) {
      hyperinflationImpact = "Anda terlindungi! Karena AI memasukkan porsi Saham & Kripto (High-Alpha) di portofolio Anda, imbal hasil aset tersebut diproyeksikan cukup tinggi untuk mengalahkan laju inflasi 10%.";
    } else {
      hyperinflationImpact = "PERINGATAN: Karena Anda berada di profil Konservatif, aset Anda aman dari penurunan harga, NAMUN berisiko tergerus inflasi karena bunga deposito/RDPU kalah cepat dengan kenaikan harga barang.";
    }

    let jobLossImpact = "";
    if (riskProfile.emergencyProgress >= 100) {
      jobLossImpact = "SANGAT AMAN! Anda memiliki bantalan uang tunai darurat yang melampaui target. Anda bisa mencari pekerjaan baru dengan tenang selama berbulan-bulan.";
    } else {
      jobLossImpact = `BAHAYA! Dana darurat Anda baru terkumpul ${riskProfile.emergencyProgress.toFixed(1)}%. Anda kemungkinan besar akan terpaksa mencairkan investasi dengan kerugian (Cut Loss) sekadar untuk makan bulan depan.`;
    }

    const conclusion = isSurvivalDanger 
      ? "Kemampuan Anda menahan risiko berbanding lurus dengan berapa lama Anda bisa bertahan di masa krisis. Jika simulasi gagal (kurang dari 3 bulan), sangat tidak disarankan menyentuh Saham/Kripto. Prioritaskan 100% surplus ke instrumen likuid (Kas/RDPU) sampai batas aman tercapai."
      : "Ketahanan finansial Anda sangat solid di berbagai skenario krisis ekstrim. Anda sangat direkomendasikan untuk berekspansi ke aset berisiko tinggi secara terukur.";

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
