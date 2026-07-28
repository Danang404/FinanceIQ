/**
 * MarketDataService — Fetches real market data from backend API.
 * Provides instrument catalogs, live prices, and market summaries.
 */
import { MarketInstrument, MarketSummary } from './types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '/api/backend';

async function fetchAPI<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn(`[MarketData] Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

// ============================================================
// FALLBACK STATIC DATA (when backend is offline)
// ============================================================

const FALLBACK_INSTRUMENTS: Record<string, MarketInstrument[]> = {
  saham: [
    { ticker: "BBCA.JK", name: "Bank Central Asia", type: "saham", sector: "Perbankan", price: 9875, change_pct: 0.51 },
    { ticker: "BBRI.JK", name: "Bank Rakyat Indonesia", type: "saham", sector: "Perbankan", price: 4650, change_pct: -0.32 },
    { ticker: "BMRI.JK", name: "Bank Mandiri", type: "saham", sector: "Perbankan", price: 6225, change_pct: 0.73 },
    { ticker: "TLKM.JK", name: "Telkom Indonesia", type: "saham", sector: "Telekomunikasi", price: 3450, change_pct: -0.14 },
    { ticker: "ASII.JK", name: "Astra International", type: "saham", sector: "Otomotif", price: 5125, change_pct: 1.02 },
    { ticker: "UNVR.JK", name: "Unilever Indonesia", type: "saham", sector: "Consumer Goods", price: 2850, change_pct: -0.88 },
    { ticker: "ICBP.JK", name: "Indofood CBP", type: "saham", sector: "Consumer Goods", price: 11250, change_pct: 0.22 },
    { ticker: "KLBF.JK", name: "Kalbe Farma", type: "saham", sector: "Farmasi", price: 1530, change_pct: 0.65 },
    { ticker: "GOTO.JK", name: "GoTo Gojek Tokopedia", type: "saham", sector: "Teknologi", price: 72, change_pct: -1.37 },
    { ticker: "BRIS.JK", name: "Bank Syariah Indonesia", type: "saham", sector: "Perbankan Syariah", price: 2740, change_pct: 0.37 },
    { ticker: "MDKA.JK", name: "Merdeka Copper Gold", type: "saham", sector: "Pertambangan", price: 2310, change_pct: 1.75 },
    { ticker: "EMTK.JK", name: "Elang Mahkota Teknologi", type: "saham", sector: "Teknologi & Media", price: 440, change_pct: -0.45 },
    { ticker: "INDF.JK", name: "Indofood Sukses Makmur", type: "saham", sector: "Consumer Goods", price: 6775, change_pct: 0.15 },
    { ticker: "ACES.JK", name: "Ace Hardware Indonesia", type: "saham", sector: "Retail", price: 730, change_pct: 0.83 },
    { ticker: "HMSP.JK", name: "HM Sampoerna", type: "saham", sector: "Consumer Goods", price: 780, change_pct: -0.26 },
  ],
  rdpu: [
    { id: "rdpu-001", name: "Bahana Liquid Cash", type: "rdpu", manajer: "Bahana TCW", nav_per_unit: 1432.51, return_1y: 4.12, risk: "Sangat Rendah" },
    { id: "rdpu-002", name: "Sucorinvest Money Market Fund", type: "rdpu", manajer: "Sucorinvest AM", nav_per_unit: 1285.33, return_1y: 4.35, risk: "Sangat Rendah" },
    { id: "rdpu-003", name: "Mandiri Investa Pasar Uang", type: "rdpu", manajer: "Mandiri Investasi", nav_per_unit: 1564.78, return_1y: 3.98, risk: "Sangat Rendah" },
    { id: "rdpu-004", name: "Simas Saham Unggulan", type: "rdpu", manajer: "Sinarmas AM", nav_per_unit: 1198.42, return_1y: 4.52, risk: "Sangat Rendah" },
    { id: "rdpu-005", name: "BNP Paribas Rupiah Plus", type: "rdpu", manajer: "BNP Paribas AM", nav_per_unit: 1675.90, return_1y: 4.08, risk: "Sangat Rendah" },
    { id: "rdpu-006", name: "Trimegah Kas 2", type: "rdpu", manajer: "Trimegah AM", nav_per_unit: 1312.65, return_1y: 4.22, risk: "Sangat Rendah" },
  ],
  rdpt: [
    { id: "rdpt-001", name: "Mandiri Investa Dana Obligasi", type: "rdpt", manajer: "Mandiri Investasi", return_1y: 6.75, risk: "Rendah-Menengah" },
    { id: "rdpt-002", name: "BNP Paribas Prima USD", type: "rdpt", manajer: "BNP Paribas AM", return_1y: 5.89, risk: "Rendah-Menengah" },
    { id: "rdpt-003", name: "Schroder Dana Andalan II", type: "rdpt", manajer: "Schroder IM", return_1y: 7.12, risk: "Rendah-Menengah" },
  ],
  sbn: [
    { id: "sbn-001", name: "ORI025 (Obligasi Ritel Indonesia)", type: "sbn", kupon: 6.40, tenor: "3 Tahun", min_investasi: 1000000, risk: "Sangat Rendah" },
    { id: "sbn-002", name: "SR020 (Sukuk Ritel)", type: "sbn", kupon: 6.30, tenor: "3 Tahun", min_investasi: 1000000, risk: "Sangat Rendah" },
    { id: "sbn-003", name: "SBR013 (Savings Bond Ritel)", type: "sbn", kupon: 6.15, tenor: "2 Tahun", min_investasi: 1000000, risk: "Sangat Rendah" },
    { id: "sbn-004", name: "ST012 (Sukuk Tabungan)", type: "sbn", kupon: 6.25, tenor: "2 Tahun", min_investasi: 1000000, risk: "Sangat Rendah" },
  ],
  crypto: [
    { ticker: "BTC-USD", name: "Bitcoin", type: "crypto", price: 67250, change_pct: 2.14, risk: "Sangat Tinggi" },
    { ticker: "ETH-USD", name: "Ethereum", type: "crypto", price: 3520, change_pct: 1.87, risk: "Sangat Tinggi" },
    { ticker: "SOL-USD", name: "Solana", type: "crypto", price: 172, change_pct: 3.42, risk: "Sangat Tinggi" },
  ],
  emas: [
    { ticker: "GC=F", name: "Emas (Gold Futures)", type: "emas", price: 2345, change_pct: 0.28, risk: "Rendah-Menengah", currency: "USD" },
  ],
};

const FALLBACK_SUMMARY: MarketSummary = {
  ihsg: { name: "IHSG", type: "indeks", ticker: "^JKSE", price: 7245, change_pct: 0.34 },
  bitcoin: { name: "Bitcoin", type: "crypto", ticker: "BTC-USD", price: 67250, change_pct: 2.14 },
  gold: { name: "Emas", type: "emas", ticker: "GC=F", price: 2345, change_pct: 0.28, currency: "USD" },
  bi_rate: 6.00,
  rdpu_avg_return: 4.21,
  timestamp: new Date().toISOString(),
};

// ============================================================
// PUBLIC API
// ============================================================

export async function getInstruments(): Promise<Record<string, MarketInstrument[]>> {
  const data = await fetchAPI<Record<string, MarketInstrument[]>>('/api/market/instruments');
  return data || FALLBACK_INSTRUMENTS;
}

export async function getMarketSummary(): Promise<MarketSummary> {
  const data = await fetchAPI<MarketSummary>('/api/market/summary');
  return data || FALLBACK_SUMMARY;
}

export async function getStocksWithPrices(): Promise<MarketInstrument[]> {
  const data = await fetchAPI<MarketInstrument[]>('/api/market/stocks');
  return data || FALLBACK_INSTRUMENTS.saham;
}

export async function getStockDetail(ticker: string): Promise<MarketInstrument | null> {
  return fetchAPI<MarketInstrument>(`/api/market/stock/${ticker}`);
}

export async function getStockHistory(ticker: string, period: string = '6mo'): Promise<any[] | null> {
  return fetchAPI<any[]>(`/api/market/history/${ticker}?period=${period}`);
}

export function getFallbackInstruments(): Record<string, MarketInstrument[]> {
  return FALLBACK_INSTRUMENTS;
}

export function getFallbackSummary(): MarketSummary {
  return FALLBACK_SUMMARY;
}
