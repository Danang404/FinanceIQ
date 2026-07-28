import json
from app.orchestrator.state import SessionState, WealthStatusResult
from app.core.llm import call_llm

def run_wealth_manager(state: SessionState, user_input: str) -> SessionState:
    """
    Wealth Management Agent: Mengevaluasi dana darurat dan rasio tabungan.
    Jika status 'beginner', memberikan penjelasan istilah 'dana darurat'.
    """
    pendapatan = state.data_dasar.pendapatan_bulanan or 0
    pengeluaran = state.data_dasar.estimasi_pengeluaran_bulanan or 0
    tabungan = state.data_dasar.tabungan_saat_ini or 0
    
    # Perhitungan Rule-based sederhana
    rasio = 0
    if pengeluaran > 0:
        rasio = tabungan / pengeluaran
        
    status_dana = "Belum ada"
    if rasio >= 6:
        status_dana = "Terpenuhi"
    elif rasio > 0:
        status_dana = "Sebagian"
        
    system_prompt = f"""
    Kamu adalah Wealth Management Agent.
    Tingkat literasi user: {state.literacy_level}
    Style bahasa: {state.communication_style}
    
    Data:
    Pendapatan: {pendapatan}
    Pengeluaran: {pengeluaran}
    Tabungan: {tabungan}
    Status Dana Darurat saat ini: {status_dana} (Berdasarkan {rasio:.1f}x pengeluaran)

    Susun `rekomendasi_alokasi_tabungan` (narasi singkat) untuk mengelola uang mereka bulan ini.
    JIKA tingkat literasi 'beginner_first_time', pastikan kamu menggunakan analogi sederhana untuk menjelaskan mengapa Dana Darurat penting (seperti 'ban serep mobil' atau 'payung sebelum hujan').

    Berikan balasan HANYA dalam format JSON valid:
    {{
      "rekomendasi_alokasi_tabungan": "Penjelasan ..."
    }}
    """
    
    try:
        response = call_llm([{"role": "system", "content": system_prompt}], model="qwen3-max")
        if response.startswith("```json"):
            response = response.strip("`").replace("json\n", "")
            
        data = json.loads(response)
        
        state.wealth_status = WealthStatusResult(
            status_dana_darurat=status_dana,
            rasio_tabungan_pengeluaran=rasio,
            rekomendasi_alokasi_tabungan=data.get("rekomendasi_alokasi_tabungan", "")
        )
        
        # Tambahkan glosarium jika perlu
        if state.istilah_perlu_dijelaskan:
            state.glosarium.append({
                "term": "Dana Darurat",
                "explanation": "Uang simpanan yang khusus digunakan saat terjadi hal tak terduga, seperti sakit atau kehilangan pekerjaan. Idealnya sebesar 6 bulan pengeluaran."
            })
            
    except Exception as e:
        print(f"Error wealth manager: {e}")
        
    return state
