"""
Market Data Service — yfinance wrapper for Indonesian market data.
Fetches real-time prices for IDX stocks, indices, and provides
instrument catalogs for RDPU, SBN, and ETFs.
"""
import yfinance as yf
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json

# ============================================================
# INSTRUMENT CATALOG
# Static metadata + dynamic prices via yfinance
# ============================================================

IDX_STOCKS = [
    {"ticker": "BBCA.JK", "name": "Bank Central Asia", "sector": "Perbankan", "type": "saham"},
    {"ticker": "BBRI.JK", "name": "Bank Rakyat Indonesia", "sector": "Perbankan", "type": "saham"},
    {"ticker": "BMRI.JK", "name": "Bank Mandiri", "sector": "Perbankan", "type": "saham"},
    {"ticker": "TLKM.JK", "name": "Telkom Indonesia", "sector": "Telekomunikasi", "type": "saham"},
    {"ticker": "ASII.JK", "name": "Astra International", "sector": "Otomotif", "type": "saham"},
    {"ticker": "UNVR.JK", "name": "Unilever Indonesia", "sector": "Consumer Goods", "type": "saham"},
    {"ticker": "HMSP.JK", "name": "HM Sampoerna", "sector": "Consumer Goods", "type": "saham"},
    {"ticker": "ICBP.JK", "name": "Indofood CBP", "sector": "Consumer Goods", "type": "saham"},
    {"ticker": "KLBF.JK", "name": "Kalbe Farma", "sector": "Farmasi", "type": "saham"},
    {"ticker": "MDKA.JK", "name": "Merdeka Copper Gold", "sector": "Pertambangan", "type": "saham"},
    {"ticker": "EMTK.JK", "name": "Elang Mahkota Teknologi", "sector": "Teknologi & Media", "type": "saham"},
    {"ticker": "GOTO.JK", "name": "GoTo Gojek Tokopedia", "sector": "Teknologi", "type": "saham"},
    {"ticker": "BRIS.JK", "name": "Bank Syariah Indonesia", "sector": "Perbankan Syariah", "type": "saham"},
    {"ticker": "ACES.JK", "name": "Ace Hardware Indonesia", "sector": "Retail", "type": "saham"},
    {"ticker": "INDF.JK", "name": "Indofood Sukses Makmur", "sector": "Consumer Goods", "type": "saham"},
]

IDX_INDICES = [
    {"ticker": "^JKSE", "name": "IHSG (Indeks Harga Saham Gabungan)", "type": "indeks"},
    {"ticker": "^JKLQ45", "name": "LQ45 (45 Saham Likuid)", "type": "indeks"},
]

# RDPU (Reksa Dana Pasar Uang) — These don't have yfinance tickers,
# so we maintain a curated catalog with typical NAV data
RDPU_FUNDS = [
    {"id": "rdpu-001", "name": "Bahana Liquid Cash", "manajer": "Bahana TCW", "nav_per_unit": 1_432.51, "return_1y": 4.12, "aum_triliun": 8.2, "type": "rdpu", "risk": "Sangat Rendah"},
    {"id": "rdpu-002", "name": "Sucorinvest Money Market Fund", "manajer": "Sucorinvest AM", "nav_per_unit": 1_285.33, "return_1y": 4.35, "aum_triliun": 5.1, "type": "rdpu", "risk": "Sangat Rendah"},
    {"id": "rdpu-003", "name": "Mandiri Investa Pasar Uang", "manajer": "Mandiri Investasi", "nav_per_unit": 1_564.78, "return_1y": 3.98, "aum_triliun": 12.4, "type": "rdpu", "risk": "Sangat Rendah"},
    {"id": "rdpu-004", "name": "Simas Saham Unggulan", "manajer": "Sinarmas AM", "nav_per_unit": 1_198.42, "return_1y": 4.52, "aum_triliun": 3.8, "type": "rdpu", "risk": "Sangat Rendah"},
    {"id": "rdpu-005", "name": "BNP Paribas Rupiah Plus", "manajer": "BNP Paribas AM", "nav_per_unit": 1_675.90, "return_1y": 4.08, "aum_triliun": 6.7, "type": "rdpu", "risk": "Sangat Rendah"},
    {"id": "rdpu-006", "name": "Trimegah Kas 2", "manajer": "Trimegah AM", "nav_per_unit": 1_312.65, "return_1y": 4.22, "aum_triliun": 2.9, "type": "rdpu", "risk": "Sangat Rendah"},
]

# RDPT (Reksa Dana Pendapatan Tetap)
RDPT_FUNDS = [
    {"id": "rdpt-001", "name": "Mandiri Investa Dana Obligasi", "manajer": "Mandiri Investasi", "return_1y": 6.75, "type": "rdpt", "risk": "Rendah-Menengah"},
    {"id": "rdpt-002", "name": "BNP Paribas Prima USD", "manajer": "BNP Paribas AM", "return_1y": 5.89, "type": "rdpt", "risk": "Rendah-Menengah"},
    {"id": "rdpt-003", "name": "Schroder Dana Andalan II", "manajer": "Schroder IM", "return_1y": 7.12, "type": "rdpt", "risk": "Rendah-Menengah"},
]

# SBN (Surat Berharga Negara) — Government Bonds
SBN_INSTRUMENTS = [
    {"id": "sbn-001", "name": "ORI025 (Obligasi Ritel Indonesia)", "kupon": 6.40, "tenor": "3 Tahun", "min_investasi": 1_000_000, "type": "sbn", "risk": "Sangat Rendah"},
    {"id": "sbn-002", "name": "SR020 (Sukuk Ritel)", "kupon": 6.30, "tenor": "3 Tahun", "min_investasi": 1_000_000, "type": "sbn", "risk": "Sangat Rendah"},
    {"id": "sbn-003", "name": "SBR013 (Savings Bond Ritel)", "kupon": 6.15, "tenor": "2 Tahun", "min_investasi": 1_000_000, "type": "sbn", "risk": "Sangat Rendah"},
    {"id": "sbn-004", "name": "ST012 (Sukuk Tabungan)", "kupon": 6.25, "tenor": "2 Tahun", "min_investasi": 1_000_000, "type": "sbn", "risk": "Sangat Rendah"},
]

# ETF Indonesia
ETF_INSTRUMENTS = [
    {"ticker": "XIIT.JK", "name": "Xtrackers MSCI Indonesia Swap", "type": "etf", "risk": "Menengah"},
    {"ticker": "R-LQ45X.JK", "name": "Reksa Dana ETF LQ45", "type": "etf", "risk": "Menengah"},
]

# Crypto top-tier
CRYPTO_INSTRUMENTS = [
    {"ticker": "BTC-USD", "name": "Bitcoin", "type": "crypto", "risk": "Sangat Tinggi"},
    {"ticker": "ETH-USD", "name": "Ethereum", "type": "crypto", "risk": "Sangat Tinggi"},
    {"ticker": "SOL-USD", "name": "Solana", "type": "crypto", "risk": "Sangat Tinggi"},
]

# Gold
GOLD_INSTRUMENTS = [
    {"ticker": "GC=F", "name": "Emas (Gold Futures USD)", "type": "emas", "risk": "Rendah-Menengah"},
]


# ============================================================
# MARKET DATA FETCHER
# ============================================================

def fetch_stock_price(ticker: str) -> Optional[Dict[str, Any]]:
    """Fetch current price and basic info for a single ticker via yfinance."""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        hist = stock.history(period="5d")
        
        if hist.empty:
            return None
        
        current_price = float(hist["Close"].iloc[-1])
        prev_close = float(hist["Close"].iloc[-2]) if len(hist) > 1 else current_price
        change = current_price - prev_close
        change_pct = (change / prev_close) * 100 if prev_close > 0 else 0
        
        return {
            "ticker": ticker,
            "price": round(current_price, 2),
            "prev_close": round(prev_close, 2),
            "change": round(change, 2),
            "change_pct": round(change_pct, 2),
            "currency": info.get("currency", "IDR"),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "dividend_yield": info.get("dividendYield"),
            "fifty_two_week_high": info.get("fiftyTwoWeekHigh"),
            "fifty_two_week_low": info.get("fiftyTwoWeekLow"),
            "volume": int(hist["Volume"].iloc[-1]) if "Volume" in hist.columns else None,
            "last_updated": datetime.now().isoformat(),
        }
    except Exception as e:
        print(f"Error fetching {ticker}: {e}")
        return None


def fetch_stock_history(ticker: str, period: str = "6mo") -> Optional[List[Dict]]:
    """Fetch historical price data for charting."""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        
        if hist.empty:
            return None
        
        return [
            {
                "date": idx.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]) if "Volume" in row else 0,
            }
            for idx, row in hist.iterrows()
        ]
    except Exception as e:
        print(f"Error fetching history for {ticker}: {e}")
        return None


def fetch_multiple_prices(tickers: List[str]) -> Dict[str, Any]:
    """Fetch prices for multiple tickers at once (batch)."""
    results = {}
    for ticker in tickers:
        data = fetch_stock_price(ticker)
        if data:
            results[ticker] = data
    return results


def get_idx_stock_list_with_prices() -> List[Dict[str, Any]]:
    """Get all IDX stocks with live prices."""
    enriched = []
    for stock in IDX_STOCKS:
        price_data = fetch_stock_price(stock["ticker"])
        merged = {**stock}
        if price_data:
            merged.update(price_data)
        enriched.append(merged)
    return enriched


def get_market_indices() -> List[Dict[str, Any]]:
    """Get current values for IHSG and LQ45."""
    enriched = []
    for idx in IDX_INDICES:
        price_data = fetch_stock_price(idx["ticker"])
        merged = {**idx}
        if price_data:
            merged.update(price_data)
        enriched.append(merged)
    return enriched


def get_all_instruments() -> Dict[str, List[Dict]]:
    """Get complete catalog of all instrument types."""
    return {
        "saham": IDX_STOCKS,
        "rdpu": RDPU_FUNDS,
        "rdpt": RDPT_FUNDS,
        "sbn": SBN_INSTRUMENTS,
        "etf": ETF_INSTRUMENTS,
        "crypto": CRYPTO_INSTRUMENTS,
        "emas": GOLD_INSTRUMENTS,
    }


def get_market_summary() -> Dict[str, Any]:
    """Get a quick market summary for agents to consume."""
    ihsg_data = fetch_stock_price("^JKSE")
    btc_data = fetch_stock_price("BTC-USD")
    gold_data = fetch_stock_price("GC=F")
    
    return {
        "ihsg": ihsg_data,
        "bitcoin": btc_data,
        "gold": gold_data,
        "bi_rate": 6.00,  # BI Rate — would need a separate source for live data
        "rdpu_avg_return": 4.21,  # Average RDPU return
        "timestamp": datetime.now().isoformat(),
    }
