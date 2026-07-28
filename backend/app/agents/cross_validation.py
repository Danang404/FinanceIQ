from app.orchestrator.state import SessionState, MediationResult
from app.core.llm import call_llm
import json

def run_cross_validation(state: SessionState, user_input: str) -> SessionState:
    """
    Cross Validation Node (Node Mediasi).
    Fungsi Rule-based + lapisan tipis LLM untuk menyusun pesan mediasi
    berdasarkan benturan antara kebutuhan dana darurat dan profil risiko/tujuan investasi.
    """
    tabungan = state.data_dasar.tabungan_saat_ini or 0
    status_dana = getattr(state.wealth_status, "status_dana_darurat", "Belum ada")
    rasio = getattr(state.wealth_status, "rasio_tabungan_pengeluaran", 0.0)
    kategori_risiko = getattr(state.risk_profile, "kategori", "Konservatif")
    
    # Rule-based mediasi
    investable_amount = tabungan
    if status_dana == "Belum ada":
        investable_amount = 0.0
    elif status_dana == "Sebagian":
        # Boleh investasi tipis (misal 10% dari tabungan) agar tetap bisa mulai,
        # tapi sisanya untuk dana darurat
        investable_amount = tabungan * 0.10
        
    system_prompt = f"""
    Kamu adalah Cross Validation Agent.
    Status Dana Darurat: {status_dana} (Rasio: {rasio}x)
    Profil Risiko yang didapat: {kategori_risiko}
    Tabungan Awal: {tabungan}
    Jumlah yang disarankan untuk diinvestasikan (setelah Rule-Based Check): {investable_amount}
    
    Gaya bahasa: {state.communication_style}
    
    Tugas: Susun `mediation_reasoning` yang menjelaskan mengapa mereka hanya boleh berinvestasi sebesar {investable_amount} (jika ditahan karena dana darurat belum cukup). 
    Gunakan bahasa yang empatik.
    
    Berikan balasan HANYA JSON:
    {{
      "mediation_reasoning": "Penjelasan..."
    }}
    """
    try:
        response = call_llm([{"role": "system", "content": system_prompt}], model="qwen-plus")
        if response.startswith("```json"):
            response = response.strip("`").replace("json\n", "")
            
        data = json.loads(response)
        
        state.mediation_result = MediationResult(
            investable_amount_final=investable_amount,
            mediation_reasoning=data.get("mediation_reasoning", "")
        )
    except Exception as e:
        print(f"Error mediasi: {e}")
        state.mediation_result = MediationResult(investable_amount_final=investable_amount, mediation_reasoning="Mediasi dilakukan secara otomatis.")
        
    return state
