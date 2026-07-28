from app.orchestrator.state import SessionState, MarketContextResult
from app.core.llm import call_llm
import json

def run_market_intelligence(state: SessionState, user_input: str) -> SessionState:
    """
    Market Intelligence Agent: Mengumpulkan konteks pasar dan menerjemahkannya
    ke bahasa awam jika user adalah pemula.
    """
    system_prompt = f"""
    Kamu adalah Market Intelligence Agent.
    Gaya bahasa yang harus digunakan: {state.communication_style}
    
    Data Kondisi Pasar Saat Ini (Simulasi Diberikan oleh Sistem):
    - Suku Bunga Bank Indonesia (BI Rate): 6.00%
    - IHSG (Indeks Saham): Fluktuatif cenderung turun
    - Reksadana Pasar Uang: Stabil di ~4.5% p.a.
    
    Tugas: Terjemahkan data teknis di atas menjadi `ringkasan_pasar` yang ringkas, menyesuaikan dengan gaya bahasa pengguna. 
    Jika 'beginner_first_time', jelaskan apa artinya "suku bunga" atau "IHSG" pakai perumpamaan sederhana.
    
    Format HANYA JSON:
    {{
      "ringkasan_pasar": "..."
    }}
    """
    try:
        response = call_llm([{"role": "system", "content": system_prompt}], model="qwen-plus")
        if response.startswith("```json"):
            response = response.strip("`").replace("json\n", "")
            
        data = json.loads(response)
        state.market_context = MarketContextResult(
            ringkasan_pasar=data.get("ringkasan_pasar", ""),
            konteks_tambahan={"bi_rate": 6.00}
        )
        
        if state.istilah_perlu_dijelaskan:
            state.glosarium.append({
                "term": "IHSG",
                "explanation": "Indeks Harga Saham Gabungan, ibarat nilai rapor rata-rata dari seluruh saham perusahaan yang ada di bursa efek Indonesia."
            })
            
    except Exception as e:
        print(f"Error market intelligence: {e}")
        state.market_context = MarketContextResult(ringkasan_pasar="Pasar saat ini cukup bervariasi.")
        
    return state
