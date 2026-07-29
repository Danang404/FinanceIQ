import json
from app.orchestrator.state import SessionState
from app.core.llm import call_llm

def run_financial_literacy(state: SessionState, user_input: str) -> SessionState:
    """
    Financial Literacy Agent: Mendeteksi tingkat literasi pengguna dan menentukan gaya bahasa.
    """
    system_prompt = """
    Kamu adalah agen Financial Literacy. Tugasmu mengevaluasi tingkat pemahaman investasi pengguna dari input mereka.
    Klasifikasikan ke dalam salah satu `literacy_level`:
    - 'beginner_first_time': sama sekali belum pernah berinvestasi, awam, tidak tahu istilah.
    - 'intermediate': sudah pernah investasi ringan, paham sedikit konsep dasar.
    - 'experienced': paham investasi, terbiasa dengan risiko, target, dan instrumen.
    
    Tentukan `communication_style`:
    - 'analogi_sederhana' jika beginner_first_time
    - 'edukatif_menengah' jika intermediate
    - 'lugas_profesional' jika experienced

    Tentukan `istilah_perlu_dijelaskan`: true jika beginner/intermediate, false jika experienced.

    Berikan balasan HANYA dalam format JSON valid tanpa markdown wrapper:
    {
      "literacy_level": "beginner_first_time",
      "communication_style": "analogi_sederhana",
      "istilah_perlu_dijelaskan": true
    }
    """
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Input User: {user_input}"}
    ]
    
    try:
        response = call_llm(messages, model="qwen3.5-flash")
        # Membersihkan markdown JSON
        if response.startswith("```json"):
            response = response.strip("`").replace("json\n", "")
            
        data = json.loads(response)
        state.literacy_level = data.get("literacy_level", "beginner_first_time")
        state.communication_style = data.get("communication_style", "analogi_sederhana")
        state.istilah_perlu_dijelaskan = data.get("istilah_perlu_dijelaskan", True)
        
    except Exception as e:
        # Fallback default ke beginner jika parsing gagal
        print(f"Error parsing literacy: {e}")
        state.literacy_level = "beginner_first_time"
        state.communication_style = "analogi_sederhana"
        state.istilah_perlu_dijelaskan = True
        
    return state
