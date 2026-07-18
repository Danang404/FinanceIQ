# 📋 Analisis Lengkap Proyek FinanceIQ

> **FinanceIQ** — Aplikasi penasihat keuangan personal berbasis Multi-Agent AI.
> Dibangun sebagai purwarupa (prototype) akademis, bukan produk komersial.

---

## Daftar Isi

1. [Gambaran Umum](#tahap-1-gambaran-umum)
2. [Struktur Folder](#tahap-2-struktur-folder)
3. [Arsitektur & Cara Kerja](#tahap-3-arsitektur--cara-kerja)
4. [Detail Setiap Komponen](#tahap-4-detail-setiap-komponen)
5. [Cara Menjalankan Proyek](#tahap-5-cara-menjalankan-proyek)
6. [Status Proyek & Kekurangan](#tahap-6-status-proyek--kekurangan)
7. [Langkah Penyelesaian (Roadmap)](#tahap-7-langkah-penyelesaian)

---

## Tahap 1: Gambaran Umum

**FinanceIQ** adalah sistem pendukung keputusan keuangan yang mendistribusikan analisis ke dalam jaringan **Agen AI** (Multi-Agent). Pengguna memasukkan data keuangan (gaji, pengeluaran, hutang, tabungan), lalu sistem menganalisis melalui beberapa agen secara berantai (Chain-of-Thought) dan menghasilkan:

- Profil risiko objektif (bukan berdasarkan perasaan user)
- Alokasi portofolio investasi yang disesuaikan profil
- Simulasi stress test (skenario krisis ekonomi)
- Proyeksi pertumbuhan kekayaan 10 tahun (compounding)
- Chatbot edukatif yang memahami konteks hasil analisis

**Tech Stack:**

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16, React 19, TailwindCSS 4, Framer Motion |
| Backend | Python, FastAPI, LangGraph, Pydantic |
| LLM Gateway | 9Router (OpenAI-compatible proxy) |
| Design | Dark Mode, Glassmorphism, Material Symbols |

---

## Tahap 2: Struktur Folder

```
financiiq/
├── frontend/                        # Aplikasi Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Landing page (halaman utama "/")
│   │   │   ├── layout.tsx           # Root layout + font loading
│   │   │   ├── globals.css          # Theme tokens + glassmorphism CSS
│   │   │   ├── beranda/page.tsx     # Dashboard utama + form input + hasil analisis + chatbot
│   │   │   ├── analisa/page.tsx     # Deep dive: stress test 3 skenario krisis
│   │   │   ├── rencana/page.tsx     # Deep dive: alokasi instrumen + grafik proyeksi
│   │   │   ├── riwayat/page.tsx     # Log riwayat sesi (placeholder)
│   │   │   ├── context/
│   │   │   │   └── FinanceContext.tsx  # React Context: state global + pipeline trigger
│   │   │   └── components/
│   │   │       ├── AppWrapper.tsx    # Conditional layout (landing vs dashboard)
│   │   │       ├── Header.tsx        # Top navigation bar
│   │   │       └── Sidebar.tsx       # Side + bottom mobile navigation
│   │   └── services/agents/         # Frontend Mock Agents (sisi klien)
│   │       ├── types.ts             # Interface TypeScript untuk semua output agen
│   │       ├── Orchestrator.ts      # Pipeline runner: Agent1 → Agent2 → Agent3
│   │       ├── RiskProfilerAgent.ts # Agent 1: Kalkulasi DTI, savings rate, koreksi risiko
│   │       ├── WealthManagerAgent.ts# Agent 2: Alokasi portofolio + proyeksi compounding
│   │       └── MarketAnalystAgent.ts# Agent 3: Stress test (crash, inflasi, PHK)
│   └── package.json
│
├── backend/                         # Server FastAPI + LangGraph
│   ├── main.py                      # Entry point: FastAPI app, endpoint /api/chat
│   ├── requirements.txt             # Dependencies Python
│   ├── .env                         # API keys (NINEROUTER_URL, NINEROUTER_KEY)
│   ├── app/
│   │   ├── core/
│   │   │   └── llm.py              # Fungsi call_llm() via 9Router gateway
│   │   ├── orchestrator/
│   │   │   ├── state.py            # Pydantic models: SessionState + semua result types
│   │   │   └── graph.py            # LangGraph StateGraph: 7 node, fan-out/fan-in
│   │   └── agents/                 # 7 Agen Python (masing-masing punya prompt LLM)
│   │       ├── financial_literacy.py    # Deteksi level literasi user
│   │       ├── wealth_manager.py        # Evaluasi dana darurat + rekomendasi tabungan
│   │       ├── risk_profiler.py         # Profil risiko via LLM
│   │       ├── cross_validation.py      # Mediasi konflik antar agen
│   │       ├── market_intelligence.py   # Konteks pasar (BI rate, IHSG)
│   │       ├── investment_strategist.py # Susun portofolio + alokasi instrumen
│   │       └── communication_education.py # Rangkuman akhir + roadmap belajar
│   └── test_mock.py
│
└── files/                           # Dokumen pendukung (PRD, SRS, SAD, desain UI)
```

---

## Tahap 3: Arsitektur & Cara Kerja

### A. Frontend Pipeline (Saat Ini Aktif — Mock)

```
[User Input Form]
       │
       ▼
[FinanceContext.tsx] ─── runAgentPipeline()
       │
       ▼
[Orchestrator.ts] ─── Menjalankan 3 agen secara berurutan:
       │
       ├── 1. RiskProfilerAgent.analyzeRisk(rawData)
       │      Input:  Gaji, Pengeluaran, Hutang, Tabungan, Risiko pilihan user
       │      Output: surplus, dtiRatio, savingsRate, emergencyProgress,
       │              correctedRisk (AI bisa override pilihan user), explanation
       │
       ├── 2. WealthManagerAgent.generatePlan(riskProfileResult)
       │      Input:  Output dari Agent 1 (surplus, correctedRisk)
       │      Output: allocations {rdpu, sbn, indexFund, crypto},
       │              projections[] (10 tahun), pureInterest, message
       │
       └── 3. MarketAnalystAgent.runStressTest(riskProfileResult)
              Input:  Output dari Agent 1
              Output: survivalMonths, marketCrashImpact, hyperinflationImpact,
                      jobLossImpact, conclusion
       │
       ▼
[React Context menyimpan hasil → UI auto-render]
```

**Penting:** Ketiga agen ini saat ini menggunakan logika `if/else` murni (MOCK). Belum ada pemanggilan LLM.

### B. Backend Pipeline (Sudah Terstruktur — Belum Digunakan Frontend)

```
[POST /api/chat]
       │
       ▼
[LangGraph StateGraph] ─── 7 Node dengan alur:
       │
       ├── START → financial_literacy_node
       │              (Deteksi level: beginner/intermediate/experienced)
       │
       ├── financial_literacy_node → [Fan-Out Paralel]
       │   ├── wealth_manager_node    (Evaluasi dana darurat)
       │   └── risk_profiler_node     (Profil risiko via LLM)
       │
       ├── [Fan-In] → cross_validation_node
       │              (Mediasi: berapa yang boleh diinvestasikan?)
       │
       ├── → market_intelligence_node
       │              (Konteks pasar: BI rate, IHSG, terjemahan awam)
       │
       ├── → investment_strategist_node
       │              (Susun portofolio instrumen + analogi)
       │
       └── → communication_education_node → END
                      (Narasi akhir + roadmap belajar + disclaimer)
       │
       ▼
[Return SessionState lengkap sebagai JSON]
```

**Setiap node** memanggil `call_llm()` di `app/core/llm.py` yang mengirim request ke 9Router (OpenAI-compatible gateway). Jika gateway gagal, ada fallback string statis.

---

## Tahap 4: Detail Setiap Komponen

### Frontend Pages

| Halaman | Route | Fungsi |
|---------|-------|--------|
| Landing Page | `/` | Marketing page dengan animasi, FAQ, tech stack marquee |
| Beranda | `/beranda` | **Halaman utama**: Form input → Loading animation → Hasil 3 agen + Chatbot |
| Analisa | `/analisa` | Deep dive Risk Profiler: rasio DTI, savings rate, 3 skenario stress test |
| Rencana | `/rencana` | Deep dive Wealth Manager: breakdown instrumen + grafik bar proyeksi 10 tahun |
| Riwayat | `/riwayat` | Placeholder log sesi (belum ada persistensi data) |

### Frontend Services (Mock Agents)

| File | Kelas | Fungsi Utama | Logika |
|------|-------|-------------|--------|
| `RiskProfilerAgent.ts` | `RiskProfilerAgent` | `analyzeRisk()` | Hitung surplus, DTI, savings rate. Override risiko jika tidak sehat. |
| `WealthManagerAgent.ts` | `WealthManagerAgent` | `generatePlan()` | Alokasi % per instrumen berdasarkan correctedRisk. Proyeksi compounding 7%/tahun. |
| `MarketAnalystAgent.ts` | `MarketAnalystAgent` | `runStressTest()` | Simulasi dampak market crash, hiperinflasi, PHK berdasarkan emergency progress. |

### Backend Agents (LLM-Powered)

| File | Fungsi | Model LLM Target | Tugas |
|------|--------|------------------|-------|
| `financial_literacy.py` | `run_financial_literacy()` | `gemini-1.5-flash` | Klasifikasi literasi user → tentukan gaya bahasa |
| `wealth_manager.py` | `run_wealth_manager()` | `gpt-4o-mini` | Evaluasi dana darurat + rekomendasi tabungan naratif |
| `risk_profiler.py` | `run_risk_profiler()` | `claude-3-haiku` | Profil risiko: Konservatif/Moderat/Agresif + reasoning |
| `cross_validation.py` | `run_cross_validation()` | `mimo-code-free` | Mediasi: hitung investable amount + penjelasan empatik |
| `market_intelligence.py` | `run_market_intelligence()` | `opencode-free` | Terjemahkan data pasar (BI rate, IHSG) ke bahasa user |
| `investment_strategist.py` | `run_investment_strategist()` | `gemini-1.5-pro` | Susun portofolio + analogi per instrumen |
| `communication_education.py` | `run_communication_education()` | `gpt-4o` | Narasi akhir + roadmap belajar 3 fase + disclaimer |

### Backend Core

| File | Fungsi |
|------|--------|
| `main.py` | FastAPI app, endpoint `GET /api/health` dan `POST /api/chat` |
| `app/core/llm.py` | `call_llm()` — HTTP POST ke 9Router (`/v1/chat/completions`), timeout 30s, fallback string |
| `app/orchestrator/state.py` | Semua Pydantic model: `SessionState`, `RiskProfileResult`, `WealthStatusResult`, `AllocationResult`, dsb |
| `app/orchestrator/graph.py` | LangGraph `StateGraph` — 7 node, fan-out/fan-in, `run_agent_graph()` |

---

## Tahap 5: Cara Menjalankan Proyek

### Prasyarat
- **Node.js** ≥ 18
- **Python** ≥ 3.10 (disarankan 3.11 atau 3.12, **hindari 3.13** karena pydantic sering error)
- **Git**

### A. Menjalankan Frontend (Bisa Mandiri Tanpa Backend)

```powershell
cd financiiq/frontend
npm install
npm run dev
```

Buka: **http://localhost:3000**

> Frontend berjalan 100% mandiri menggunakan Mock Agents di sisi klien. Tidak butuh backend.

### B. Menjalankan Backend

```powershell
cd financiiq/backend

# Buat virtual environment
python -m venv venv

# Aktifkan (Windows PowerShell)
.\venv\Scripts\activate

# Aktifkan (Linux/Mac)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Jalankan server
python main.py
```

Backend: **http://localhost:8000**
Health check: **http://localhost:8000/api/health**

### C. Troubleshooting Umum

| Masalah | Solusi |
|---------|--------|
| `source` not recognized (Windows) | Gunakan `.\venv\Scripts\activate` |
| `ModuleNotFoundError: pydantic_core._pydantic_core` | `pip uninstall pydantic pydantic-core -y && pip install --no-cache-dir pydantic pydantic-core` |
| Python 3.13 + pydantic error | Downgrade ke Python 3.11 atau 3.12 |
| Backend error saat call LLM | Pastikan `.env` berisi `NINEROUTER_URL` dan `NINEROUTER_KEY` yang valid |
| Frontend ↔ Backend CORS error | Tambahkan CORS middleware di `main.py` (belum ada) |

---

## Tahap 6: Status Proyek & Kekurangan

### Status Per Modul

| Modul | Status | Keterangan |
|-------|--------|------------|
| UI/UX Landing Page | ✅ Selesai | Animasi, responsive, dark mode |
| UI/UX Dashboard (Beranda) | ✅ Selesai | Form, loading state, hasil analisis, chatbot |
| UI/UX Analisa | ✅ Selesai | Stress test 3 skenario |
| UI/UX Rencana | ✅ Selesai | Alokasi + grafik proyeksi |
| UI/UX Riwayat | ⚠️ Placeholder | Hanya 1 entry statis, tidak ada persistensi |
| Frontend Mock Agents | ✅ Berjalan | Logika if/else, tanpa LLM |
| Backend FastAPI Server | ✅ Berjalan | Endpoint siap, graph terkompilasi |
| Backend LLM Integration | ❌ Belum Terhubung | Butuh API key valid + 9Router aktif |
| **Frontend ↔ Backend Wiring** | ❌ **Terputus** | Frontend tidak `fetch` ke backend |
| CORS Middleware | ❌ Belum Ada | Backend blokir cross-origin request |
| Persistensi Data | ❌ Tidak Ada | State hilang saat refresh |
| Autentikasi | ❌ Tidak Ada | Tidak ada login/register |
| Chatbot Live | ❌ Mock | Balasan chatbot hardcoded |

### Kekurangan Kritis

1. **Frontend tidak memanggil Backend.**
   `FinanceContext.tsx` menjalankan `Orchestrator.ts` (mock lokal), bukan `fetch("/api/chat")`.

2. **CORS middleware tidak ada di `main.py`.**
   Browser akan memblokir request cross-origin.

3. **Skema data Frontend ≠ Backend.**
   - Frontend `RiskProfileResult`: `surplus`, `dtiRatio`, `correctedRisk`, `emergencyProgress`
   - Backend `RiskProfileResult`: `kategori`, `skor`, `reasoning`, `catatan_untuk_agent_lain`
   - **Tidak kompatibel. Harus diselaraskan.**

4. **Chatbot hardcoded.**
   `handleSendChat()` di `beranda/page.tsx` return string statis via `setTimeout`.

5. **LLM Gateway belum dikonfigurasi.**
   `call_llm()` mengarah ke `localhost:20128` (9Router). Tanpa ini, semua agen fallback.

6. **Alokasi portofolio di UI hardcoded 30/35/25/10%.**
   Tidak menggunakan output dari `WealthManagerAgent`.

---

## Tahap 7: Langkah Penyelesaian

### Fase 1: Koneksi Frontend ↔ Backend (Prioritas Tertinggi)

1. **Tambah CORS di `main.py`:**
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
   ```

2. **Selaraskan skema data** — pilih satu source of truth antara `types.ts` (FE) dan `state.py` (BE).

3. **Ubah `FinanceContext.tsx`** — ganti mock orchestrator menjadi:
   ```typescript
   const res = await fetch("http://localhost:8000/api/chat", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ user_input: "...", session_state: { data_dasar: {...} } })
   });
   const data = await res.json();
   ```

### Fase 2: Aktifkan LLM

4. **Konfigurasi `.env`** — isi API key yang valid, atau ubah `call_llm()` agar langsung panggil OpenAI/Anthropic.

5. **Test setiap agen** via Postman ke `POST /api/chat`.

### Fase 3: Penyempurnaan

6. **Hubungkan chatbot** ke endpoint backend (tambah `/api/chat/followup`).
7. **Persistensi** — minimal `localStorage`, idealnya database.
8. **Halaman Riwayat** — implementasi histori sesi.

---

> **Kesimpulan:** Proyek memiliki fondasi arsitektur yang sangat baik (Clean Architecture, typed contracts, LangGraph orchestration). Kekurangan utama adalah **wiring** — menghubungkan bagian-bagian yang sudah jadi menjadi satu sistem end-to-end yang utuh.