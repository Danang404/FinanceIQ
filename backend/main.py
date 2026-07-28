from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from app.orchestrator.graph import run_agent_graph
from app.orchestrator.state import SessionState, DataDasarKeuangan
from app.services.market_data import (
    get_all_instruments,
    get_market_summary,
    get_idx_stock_list_with_prices,
    get_market_indices,
    fetch_stock_price,
    fetch_stock_history,
)

app = FastAPI(
    title="FinanceIQ API",
    description="Backend API untuk sistem Multi-Agent FinanceIQ",
    version="3.0",
)

import os

# Ambil FRONTEND_URL dari env var (misal Vercel), jika tidak ada, default ke localhost atau allow all
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# CORS — Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_input: str
    session_state: SessionState

@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "3.0"}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        updated_state = run_agent_graph(request.user_input, request.session_state)
        return {"state": updated_state}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# MARKET DATA ENDPOINTS
# ============================================================

@app.get("/api/market/instruments")
async def get_instruments():
    """Get complete catalog of all available investment instruments."""
    try:
        return get_all_instruments()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market/summary")
async def market_summary():
    """Get quick market summary (IHSG, BTC, Gold, BI Rate)."""
    try:
        return get_market_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market/stocks")
async def get_stocks():
    """Get IDX stock list with live prices."""
    try:
        return get_idx_stock_list_with_prices()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market/indices")
async def get_indices():
    """Get IHSG and LQ45 current values."""
    try:
        return get_market_indices()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market/stock/{ticker}")
async def get_stock_detail(ticker: str):
    """Get price detail for a specific ticker."""
    try:
        data = fetch_stock_price(ticker)
        if not data:
            raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market/history/{ticker}")
async def get_stock_history(ticker: str, period: str = "6mo"):
    """Get historical price data for charting."""
    try:
        data = fetch_stock_history(ticker, period)
        if not data:
            raise HTTPException(status_code=404, detail=f"No history for {ticker}")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
