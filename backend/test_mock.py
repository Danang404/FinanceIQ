from app.orchestrator.graph import run_agent_graph
from app.orchestrator.state import SessionState, DataDasarKeuangan
import json

def run_test():
    print("=== Memulai Tes Multi-Agent FinanceIQ ===\n")
    
    # 1. Inisialisasi State Awal
    # Simulasi user yang sama sekali belum pernah berinvestasi
    initial_state = SessionState(
        data_dasar=DataDasarKeuangan(
            pendapatan_bulanan=5000000,
            estimasi_pengeluaran_bulanan=4000000,
            tabungan_saat_ini=2000000,
            tujuan_investasi="Ingin belajar agar uang tidak habis begitu saja"
        )
    )
    
    user_input = "Jujur, saya belum pernah sama sekali. Ini pertama kalinya saya mau belajar tentang investasi dan pengelolaan uang."
    
    print(f"Input User: {user_input}\n")
    print("Menjalankan Graph...\n")
    
    # 2. Jalankan Graph
    updated_state = run_agent_graph(user_input, initial_state)
    
    # 3. Tampilkan Hasil
    print("--- HASIL DETEKSI LITERASI ---")
    print(f"Level: {updated_state.get('literacy_level')}")
    print(f"Gaya Bahasa: {updated_state.get('communication_style')}\n")
    
    print("--- HASIL WEALTH MANAGER ---")
    wealth = updated_state.get('wealth_status')
    if wealth:
        print(f"Status Dana Darurat: {getattr(wealth, 'status_dana_darurat', '')}")
        print(f"Rekomendasi Tabungan: {getattr(wealth, 'rekomendasi_alokasi_tabungan', '')}\n")
        
    print("--- HASIL RISK PROFILER ---")
    risk = updated_state.get('risk_profile')
    if risk:
        print(f"Kategori: {getattr(risk, 'kategori', '')}")
        print(f"Reasoning: {getattr(risk, 'reasoning', '')}\n")
        
    print("--- HASIL MEDIASI (CROSS-VALIDATION) ---")
    med = updated_state.get('mediation_result')
    if med:
        print(f"Dana Boleh Investasi: Rp {getattr(med, 'investable_amount_final', 0)}")
        print(f"Alasan Mediasi: {getattr(med, 'mediation_reasoning', '')}\n")
        
    print("--- HASIL INVESTMENT STRATEGIST ---")
    alloc = updated_state.get('allocation')
    if alloc:
        print(f"Reasoning: {getattr(alloc, 'reasoning_alokasi', '')}")
        for instrumen in getattr(alloc, 'daftar_instrumen', []):
            print(f"- {instrumen.get('nama_instrumen')} ({instrumen.get('persentase')}%)")
            print(f"  Analogi: {instrumen.get('analogi')}")
            print(f"  Kenapa Cocok: {instrumen.get('kenapa_cocok')}")
        print()
            
    print("--- HASIL COMMUNICATION & EDUCATION (FINAL OUTPUT) ---")
    final_out = updated_state.get('final_output')
    if final_out:
        print(f"Narasi Keputusan:\n{getattr(final_out, 'narasi_keputusan', '')}\n")
        print("Roadmap Belajar:")
        for r in getattr(final_out, 'roadmap_belajar', []):
            print(f"- {r}")
        print()
        print(f"Disclaimer: {getattr(final_out, 'disclaimer', '')}\n")
        
    print("--- GLOSARIUM ---")
    for g in updated_state.get('glosarium', []):
        print(f"{g.get('term')}: {g.get('explanation')}")

if __name__ == "__main__":
    import asyncio
    # Matikan warning langgraph jika ada
    import warnings
    warnings.filterwarnings("ignore")
    
    run_test()
