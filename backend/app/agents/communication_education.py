from app.orchestrator.state import SessionState, FinalOutputResult
from app.core.llm import call_llm
import json

def run_communication_education(state: SessionState, user_input: str) -> SessionState:
    """
    Communication & Education Agent: Merangkum seluruh rekomendasi menjadi
    narasi akhir, roadmap belajar, dan glosarium.
    """
    system_prompt = f"""
    Kamu adalah Communication & Education Agent.
    Tugasmu adalah membuat rangkuman akhir yang sangat rapi dan personal.
    Gaya bahasa: {state.communication_style}
    
    Bahan Rangkuman:
    - Status Dana Darurat: {getattr(state.wealth_status, "status_dana_darurat", "")}
    - Rekomendasi Tabungan: {getattr(state.wealth_status, "rekomendasi_alokasi_tabungan", "")}
    - Profil Risiko: {getattr(state.risk_profile, "kategori", "")}
    - Mediasi: {getattr(state.mediation_result, "mediation_reasoning", "")}
    - Kondisi Pasar: {getattr(state.market_context, "ringkasan_pasar", "")}
    - Alokasi: {getattr(state.allocation, "reasoning_alokasi", "")}
    
    Buat `narasi_keputusan` yang menggabungkan itu semua.
    Buat `roadmap_belajar` yang berisi 3 tahap (Pendek, Menengah, Panjang) berbentuk list of strings.
    Tambahkan `disclaimer` standar (Bahwa ini bukan nasihat keuangan berlisensi).
    
    Format HANYA JSON:
    {{
      "narasi_keputusan": "...",
      "roadmap_belajar": [
        "Fase 1: Mulai disiplin menabung...",
        "Fase 2: ...",
        "Fase 3: ..."
      ],
      "disclaimer": "..."
    }}
    """
    try:
        response = call_llm([{"role": "system", "content": system_prompt}], model="Qwen3.6-Plus")
        if response.startswith("```json"):
            response = response.strip("`").replace("json\n", "")
            
        data = json.loads(response)
        
        state.final_output = FinalOutputResult(
            narasi_keputusan=data.get("narasi_keputusan", ""),
            roadmap_belajar=data.get("roadmap_belajar", []),
            disclaimer=data.get("disclaimer", "Sistem ini bersifat edukasi dan bukan platform transaksi.")
        )
        
    except Exception as e:
        print(f"Error communication ed: {e}")
        
    return state
