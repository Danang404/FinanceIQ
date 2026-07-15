import json
from app.orchestrator.state import SessionState, RiskProfileResult
from app.core.llm import call_llm

def run_risk_profiler(state: SessionState, user_input: str) -> SessionState:
    """
    Risk Profiling Agent: Menilai profil risiko.
    Menggunakan analogi untuk pemula.
    """
    system_prompt = f"""
    Kamu adalah Risk Profiling Agent.
    Tingkat literasi user: {state.literacy_level}
    Style bahasa: {state.communication_style}
    User Input: {user_input}
    
    Tugas: Analisis input pengguna untuk menentukan profil risiko investasi.
    Kategori yang tersedia: 'Konservatif', 'Moderat', 'Agresif'.
    
    Jika user adalah beginner_first_time, prioritas utamakan 'Konservatif' atau 'Moderat' karena kenyamanan psikologis mereka lebih penting daripada imbal hasil optimal. Jangan paksa 'Agresif' kecuali mereka sangat eksplisit siap rugi besar.
    Sertakan 'reasoning' mengapa kategori ini dipilih.
    Sertakan 'catatan_untuk_agent_lain' sebagai pedoman investasi.

    Berikan balasan HANYA dalam format JSON valid:
    {{
      "kategori": "Konservatif",
      "skor": 30,
      "reasoning": "Alasan analitis...",
      "catatan_untuk_agent_lain": "Fokus pada pelestarian modal..."
    }}
    """
    
    try:
        response = call_llm([{"role": "system", "content": system_prompt}], model="claude-3-haiku")
        if response.startswith("```json"):
            response = response.strip("`").replace("json\n", "")
            
        data = json.loads(response)
        state.risk_profile = RiskProfileResult(
            kategori=data.get("kategori", "Konservatif"),
            skor=data.get("skor", 30),
            reasoning=data.get("reasoning", ""),
            catatan_untuk_agent_lain=data.get("catatan_untuk_agent_lain", "")
        )
        
        if state.istilah_perlu_dijelaskan:
            state.glosarium.append({
                "term": "Profil Risiko",
                "explanation": "Tingkat kenyamanan kamu dalam menerima potensi kerugian investasi demi mendapatkan keuntungan yang lebih besar."
            })
            
    except Exception as e:
        print(f"Error risk profiler: {e}")
        state.risk_profile = RiskProfileResult(kategori="Konservatif", skor=30, reasoning="Default fallback karena sistem sibuk.")
        
    return state
