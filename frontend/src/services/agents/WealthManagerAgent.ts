import { RiskProfileResult, WealthAllocationResult, RecommendedInstrumentDetail } from './types';
import { callAgentLLM } from './LLMService';
import { getInstruments, getFallbackInstruments } from './MarketDataService';

// ─────────────────────────────────────────────────────────────
// Helper: Pilih instrumen terbaik berdasarkan kategori & profil
// ─────────────────────────────────────────────────────────────

function pickTopRdpu(
  instruments: ReturnType<typeof getFallbackInstruments>,
  risk: string
): RecommendedInstrumentDetail[] {
  const rdpuList = instruments.rdpu || [];
  // Urutkan berdasarkan return 1 tahun tertinggi
  const sorted = [...rdpuList].sort((a, b) => (b.return_1y || 0) - (a.return_1y || 0));
  const top2 = sorted.slice(0, 2);

  return top2.map((inst) => ({
    name: inst.name,
    id: inst.id,
    manajer: inst.manajer,
    return_1y: inst.return_1y,
    nav_per_unit: inst.nav_per_unit,
    risk: inst.risk,
    whyRecommended: `Return 1 tahun terakhir ${inst.return_1y}% p.a. — lebih tinggi dari rata-rata deposito bank (≈3-3.5%). Dikelola oleh ${inst.manajer}, likuiditas harian (T+1). Cocok sebagai "parkir dana" sambil menunggu peluang investasi lain.`,
  }));
}

function pickTopSbn(
  instruments: ReturnType<typeof getFallbackInstruments>,
  risk: string
): RecommendedInstrumentDetail[] {
  const sbnList = instruments.sbn || [];
  // Pilih berdasarkan kupon tertinggi
  const sorted = [...sbnList].sort((a, b) => (b.kupon || 0) - (a.kupon || 0));
  const picks = risk === 'KONSERVATIF' ? sorted.slice(0, 2) : sorted.slice(0, 2);

  return picks.map((inst) => ({
    name: inst.name,
    id: inst.id,
    kupon: inst.kupon,
    tenor: inst.tenor,
    min_investasi: inst.min_investasi,
    risk: inst.risk,
    whyRecommended: `Kupon ${inst.kupon}% p.a. (dijamin penuh oleh negara). Tenor ${inst.tenor} — cocok untuk tujuan jangka ${Number(inst.tenor?.split(' ')[0]) <= 2 ? 'pendek-menengah' : 'menengah'}. Modal minimum Rp ${(inst.min_investasi || 0).toLocaleString('id-ID')} sangat terjangkau. Return di atas BI Rate (${inst.kupon}% vs ~6% BI Rate) = bebas risiko kredit.`,
  }));
}

function pickTopIndexFund(
  instruments: ReturnType<typeof getFallbackInstruments>,
  risk: string
): RecommendedInstrumentDetail[] {
  // Dari saham, ambil blue chip LQ45 sebagai proxy Index Fund / ETF
  const sahamList = instruments.saham || [];
  const blueChips = sahamList.filter(s =>
    ['BBCA.JK', 'BBRI.JK', 'BMRI.JK', 'TLKM.JK', 'ASII.JK'].includes(s.ticker || '')
  );

  // Tambah referensi ETF IDX30/LQ45 (static karena data ETF IDX belum ada di endpoint)
  const etfRefs: RecommendedInstrumentDetail[] = [
    {
      name: 'Reksa Dana Indeks IDX30 (Mirae/BNI AM)',
      whyRecommended: 'Melacak 30 saham paling likuid di BEI. Return 10 tahun historis IHSG ≈7-10% p.a. Biaya kelola rendah (0.5-0.8%) vs reksa dana aktif. Cocok untuk investor yang ingin eksposur pasar saham tanpa harus memilih saham individual.',
      risk: 'Menengah-Tinggi',
    },
    {
      name: 'ETF XISXSMID (iShares MSCI Indonesia)',
      ticker: 'XIIT',
      whyRecommended: 'Diversifikasi sektor otomatis ke seluruh pasar saham Indonesia. Dapat diperdagangkan intraday seperti saham biasa. Transparan: bobotnya mengikuti indeks, bukan keputusan manajer.',
      risk: 'Menengah-Tinggi',
    },
  ];

  if (risk === 'AGRESIF') {
    // Tambah saham individual blue chip
    const sahamPicks = blueChips.slice(0, 2).map(s => ({
      name: s.name,
      ticker: s.ticker,
      price: s.price,
      change_pct: s.change_pct,
      whyRecommended: `Saham blue chip sektor ${s.sector}. Pergerakan hari ini: ${(s.change_pct || 0) >= 0 ? '+' : ''}${(s.change_pct || 0).toFixed(2)}%. Rekomendasi untuk investor agresif yang ingin return di atas reksa dana indeks.`,
      risk: 'Tinggi',
    }));
    return [...etfRefs.slice(0, 1), ...sahamPicks.slice(0, 1)];
  }

  return etfRefs.slice(0, 2);
}

function pickTopCrypto(
  instruments: ReturnType<typeof getFallbackInstruments>,
  risk: string
): RecommendedInstrumentDetail[] {
  const cryptoList = instruments.crypto || [];
  if (risk !== 'AGRESIF') {
    // Untuk profil non-agresif, hanya rekomendasikan BTC sebagai "digital gold"
    const btc = cryptoList.find(c => c.ticker === 'BTC-USD');
    if (btc) {
      return [{
        name: btc.name,
        ticker: btc.ticker,
        price: btc.price,
        change_pct: btc.change_pct,
        risk: 'Sangat Tinggi',
        whyRecommended: `Bitcoin adalah aset kripto dengan kapitalisasi terbesar dan dominasi pasar >50%. Harga saat ini $${(btc.price || 0).toLocaleString('en-US')}. Porsi kecil (maks 5-10%) dapat meningkatkan return portofolio secara signifikan, namun volatilitas sangat tinggi — HANYA untuk uang yang sanggup Anda hilangkan.`,
      }];
    }
  }
  // Agresif: BTC + ETH
  return cryptoList.slice(0, 2).map(c => ({
    name: c.name,
    ticker: c.ticker,
    price: c.price,
    change_pct: c.change_pct,
    risk: 'Sangat Tinggi',
    whyRecommended: c.ticker === 'BTC-USD'
      ? `Bitcoin — "Digital Gold". Harga saat ini $${(c.price || 0).toLocaleString('en-US')} (${(c.change_pct || 0) >= 0 ? '+' : ''}${(c.change_pct || 0).toFixed(2)}% hari ini). Market cap terbesar, adopsi institusional meningkat (ETF BTC disetujui SEC 2024).`
      : `Ethereum — platform smart contract terbesar. Harga $${(c.price || 0).toLocaleString('en-US')} (${(c.change_pct || 0) >= 0 ? '+' : ''}${(c.change_pct || 0).toFixed(2)}% hari ini). Fundamental kuat: staking yield ~3-5%, ekosistem DeFi terbesar.`,
  }));
}

// ─────────────────────────────────────────────────────────────
// WealthManagerAgent
// ─────────────────────────────────────────────────────────────

export class WealthManagerAgent {
  public async generatePlan(riskProfile: RiskProfileResult): Promise<WealthAllocationResult> {
    const surplus = riskProfile.surplus;

    // Ambil data instrumen dari market service (pakai fallback jika offline)
    let instruments = getFallbackInstruments();
    try {
      const liveInstruments = await getInstruments();
      if (liveInstruments && Object.keys(liveInstruments).length > 0) {
        instruments = liveInstruments;
      }
    } catch {
      // Gunakan fallback jika gagal
    }

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

    let baseResult: Omit<WealthAllocationResult, 'recommendedInstruments'> | null = null;

    try {
      const result = await callAgentLLM(a2SystemPrompt, a2UserPrompt, 1);
      if (result) baseResult = result;
    } catch (err) {
      console.error("Agent 2 LLM failed, falling back to mock:", err);
    }

    // --- FALLBACK MOCK LOGIC ---
    if (!baseResult) {
      const calculateProjection = () => {
        let currentTotal = 0;
        const yearlyInvestment = surplus * 12;
        const rate = 1.07;
        const projection = [];
        for (let i = 1; i <= 10; i++) {
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
          allocations = { rdpu: surplus * 0.25, sbn: surplus * 0.35, indexFund: surplus * 0.30, crypto: surplus * 0.10 };
        } else {
          allocations = { rdpu: surplus * 0.10, sbn: surplus * 0.15, indexFund: surplus * 0.50, crypto: surplus * 0.25 };
        }
      }

      const biRate = 6.0; // BI Rate referensi
      const message = surplus > 0
        ? `Profil Anda (${riskProfile.correctedRisk}) menunjukkan kapasitas investasi Rp ${surplus.toLocaleString('id-ID')}/bulan. Alokasi dirancang dengan mempertimbangkan BI Rate saat ini ${biRate}% — RDPU & SBN menjadi basis stabil, sedangkan Index Fund menangkap pertumbuhan jangka panjang pasar. Proyeksi selama 10 tahun mengasumsikan rata-rata return 7% p.a. (konservatif). Lakukan rebalancing setiap 12 bulan.`
        : `Saat ini Anda tidak memiliki surplus untuk diinvestasikan. Prioritaskan efisiensi pengeluaran terlebih dahulu.`;

      baseResult = { yearlyInvestment, allocations, projections, maxProjection, totalOriginalCapital, pureInterest, message };
    }

    // ─────────────────────────────────────────────────────────
    // Buat rekomendasi instrumen spesifik berdasarkan profil
    // ─────────────────────────────────────────────────────────
    const risk = riskProfile.correctedRisk;
    const allocs = baseResult.allocations;

    const recommendedInstruments = {
      rdpu: allocs.rdpu > 0 ? pickTopRdpu(instruments, risk) : [],
      sbn: allocs.sbn > 0 ? pickTopSbn(instruments, risk) : [],
      indexFund: allocs.indexFund > 0 ? pickTopIndexFund(instruments, risk) : [],
      crypto: allocs.crypto > 0 ? pickTopCrypto(instruments, risk) : [],
    };

    return {
      ...baseResult,
      recommendedInstruments,
    };
  }
}
