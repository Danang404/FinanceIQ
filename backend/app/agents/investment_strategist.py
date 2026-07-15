from app.orchestrator.state import SessionState, AllocationResult
from app.core.llm import call_llm
import json

def run_investment_strategist(state: SessionState, user_input: str) -> SessionState:
    """
    Investment Strategist Agent: Menyusun portofolio.
    Menerapkan batasan instrumen berbahaya untuk pemula.
    """
    investable = getattr(state.mediation_result, "investable_amount_final", 0.0)
    kategori_risiko = getattr(state.risk_profile, "kategori", "Konservatif")
    literacy = state.literacy_level
    
    system_prompt = f"""
    Kamu adalah Investment Strategist Agent.
    Tugas: Susun portofolio alokasi dari dana investasi sebesar Rp {investable}.
    Profil Risiko: {kategori_risiko}
    Tingkat Literasi: {literacy}
    Gaya Bahasa: {state.communication_style}
    
    ATURAN KETAT:
    Jika tingkat literasi = 'beginner_first_time', dilarang keras merekomendasikan Saham Individu atau Reksadana Saham meskipun profil risikonya 'Agresif'. Fokuskan ke Reksadana Pasar Uang (RDPU) atau Pendapatan Tetap (RDPT).
    Setiap instrumen harus memiliki 'analogi' dan 'kenapa_cocok'.
    
    Format HANYA JSON:
    {{
      "daftar_instrumen": [
        {{
          "nama_instrumen": "Reksadana Pasar Uang",
          "persentase": 100,
          "nominal": {investable},
          "analogi": "Seperti menabung di celengan emas yang tidak akan pecah",
          "kenapa_cocok": "Risiko hampir nol, cocok untuk latihan"
        }}
      ],
      "reasoning_alokasi": "Karena Anda pemula..."
    }}
    """
    try:
        response = call_llm([{"role": "system", "content": system_prompt}], model="gemini-1.5-pro")
        if response.startswith("```json"):
            response = response.strip("`").replace("json\n", "")
            
        data = json.loads(response)
        
        # Validasi struktur
        instrumen_list = data.get("daftar_instrumen", [])
        
        state.allocation = AllocationResult(
            daftar_instrumen=instrumen_list,
            reasoning_alokasi=data.get("reasoning_alokasi", "")
        )
        
        if state.istilah_perlu_dijelaskan:
            state.glosarium.append({
                "term": "Reksadana Pasar Uang",
                "explanation": "Wadah di mana uang kita dikumpulkan bersama investor lain, lalu dikelola manajer profesional ke deposito bank atau surat utang jangka pendek yang sangat aman."
            })
            
    except Exception as e:
        print(f"Error investment strategist: {e}")
        state.allocation = AllocationResult(reasoning_alokasi="Gagal menyusun strategi.")
        
    return state
