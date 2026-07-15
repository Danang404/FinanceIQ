from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class GlossaryTerm(BaseModel):
    term: str
    explanation: str

class DataDasarKeuangan(BaseModel):
    pendapatan_bulanan: Optional[float] = None
    estimasi_pengeluaran_bulanan: Optional[float] = None
    tabungan_saat_ini: Optional[float] = None
    tujuan_investasi: Optional[str] = None

class RiskProfileResult(BaseModel):
    kategori: str = ""
    skor: int = 0
    reasoning: str = ""
    catatan_untuk_agent_lain: str = ""

class WealthStatusResult(BaseModel):
    status_dana_darurat: str = ""
    rasio_tabungan_pengeluaran: float = 0.0
    rekomendasi_alokasi_tabungan: str = ""

class MediationResult(BaseModel):
    investable_amount_final: float = 0.0
    mediation_reasoning: str = ""

class MarketContextResult(BaseModel):
    ringkasan_pasar: str = ""
    konteks_tambahan: Dict[str, Any] = Field(default_factory=dict)

class InstrumenAlokasi(BaseModel):
    nama_instrumen: str
    persentase: float
    nominal: float
    analogi: Optional[str] = None
    kenapa_cocok: Optional[str] = None

class AllocationResult(BaseModel):
    daftar_instrumen: List[InstrumenAlokasi] = Field(default_factory=list)
    reasoning_alokasi: str = ""

class FinalOutputResult(BaseModel):
    narasi_keputusan: str = ""
    roadmap_belajar: List[str] = Field(default_factory=list)
    disclaimer: str = ""

class SessionState(BaseModel):
    # Menggunakan dict untuk mempermudah operabilitas LangGraph
    # Jika menggunakan TypedDict, bisa lebih native dengan LangGraph, tapi kita ikuti blueprint (Pydantic).
    literacy_level: str = "unknown"
    communication_style: str = "formal"
    data_dasar: DataDasarKeuangan = Field(default_factory=DataDasarKeuangan)
    risk_profile: Optional[RiskProfileResult] = None
    wealth_status: Optional[WealthStatusResult] = None
    mediation_result: Optional[MediationResult] = None
    market_context: Optional[MarketContextResult] = None
    allocation: Optional[AllocationResult] = None
    final_output: Optional[FinalOutputResult] = None
    glosarium: List[GlossaryTerm] = Field(default_factory=list)
    istilah_perlu_dijelaskan: bool = False
