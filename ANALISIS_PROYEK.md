# 📋 Analisis Lengkap Proyek FinanceIQ

> **FinanceIQ** — Aplikasi penasihat keuangan personal berbasis Multi-Agent AI.
> Dibangun sebagai purwarupa (prototype) akademis dengan integrasi LLM aktif via 9Router.

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

**FinanceIQ** adalah sistem pendukung keputusan keuangan yang mendistribusikan analisis ke dalam jaringan **Agen AI** (Multi-Agent). Pengguna memasukkan data keuangan (gaji, pengeluaran, hutang, tabungan, profil demografis), lalu sistem menganalisis melalui beberapa agen secara berantai (Chain-of-Thought) dan menghasilkan:

- Profil risiko objektif (AI bisa mengoreksi pilihan user jika tidak sesuai kondisi keuangan)
- Alokasi portofolio investasi yang disesuaikan profil + rekomendasi instrumen spesifik
- Simulasi stress test (skenario: market crash -50%, hiperinflasi 15%, kehilangan pekerjaan)
- Proyeksi pertumbuhan kekayaan 10 tahun (compounding)
- Chatbot edukatif "Literacy Agent" yang sudah memiliki konteks penuh hasil analisis

**Tech Stack:**

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, TailwindCSS 4, Framer Motion, Recharts |
| Backend | Python, FastAPI, LangGraph, Pydantic, yfinance |
| LLM Gateway | 9Router (OpenAI-compatible proxy) — model kr/claude-sonnet-4.5, kr/claude-haiku-4.5, kr/deepseek-3.2 |
| Design | Dark Mode, Glassmorphism, Material Symbols |

---

## Tahap 2: Struktur Folder

```
FinanceIQ/
├── frontend/                        # Aplikasi Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Landing page (halaman utama "/")
│   │   │   ├── layout.tsx           # Root layout + font loading
│   │   │   ├── globals.css          # Theme tokens + glassmorphism CSS
│   │   │   ├── beranda/page.tsx     # Dashboard utama + form input + hasil analisis + chatbot
│   │   │   ├── analisa/page.tsx     # Deep dive: stress test 3 skenario krisis
│   │   │   ├── rencana/page.tsx     # Deep dive: alokasi instrumen + grafik proyeksi
│   │   │   ├── riwayat/page.tsx     # Log riwayat sesi (menggunakan AgentMemoryStore)
│   │   │   ├── login/page.tsx       # Halaman login (AuthContext)
│   │   │   ├── context/
│   │   │   │   ├── FinanceContext.tsx  # React Context: state global + pipeline trigger
│   │   │   │   └── AuthContext.tsx     # Auth Context: user session management
│   │   │   └── components/
│   │   │       ├── AppWrapper.tsx    # Conditional layout (landing vs dashboard)
│   │   │       ├── Header.tsx        # Top navigation bar
│   │   │       └── Sidebar.tsx       # Side + bottom mobile navigation
│   │   └── services/agents/         # Frontend Agents + Services (sisi klien)
│   │       ├── types.ts             # Interface TypeScript semua output agen & market data
│   │       ├── LLMService.ts        # Klien 9Router: callAgentLLM() + model rotation + SSE fallback
│   │       ├── Orchestrator.ts      # Pipeline v3.0: Tools → Agent1 → Agent2+3 (parallel) → Memory
│   │       ├── RiskProfilerAgent.ts # Agent 1: LLM profil risiko + fallback rule-based
│   │       ├── WealthManagerAgent.ts# Agent 2: LLM alokasi + instrumen spesifik + compounding
│   │       ├── MarketAnalystAgent.ts# Agent 3: LLM stress test (crash, inflasi, PHK)
│   │       ├── ChatService.ts       # Literacy Agent: chatbot LLM + portfolio snapshot injection
│   │       ├── AgentMemoryStore.ts  # Memori persisten: localStorage + buildContextForChatbot()
│   │       ├── AgentCapabilities.ts # Goal/Plan/ReasoningTrace builder untuk semua agen
│   │       ├── AgentTools.ts        # Alat deterministik: FinancialCalculator, RiskScorer, dll.
│   │       └── MarketDataService.ts # Klien backend: fetch instrumen, harga, IHSG, BTC, gold
│   └── package.json
│
├── backend/                         # Server FastAPI + LangGraph
│   ├── main.py                      # FastAPI app: CORS, /api/chat, /api/market/*
│   ├── requirements.txt             # fastapi, uvicorn, pydantic, langgraph, httpx, yfinance
│   ├── .env                         # NINEROUTER_URL, NINEROUTER_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY
│   ├── test_mock.py                 # Test lokal backend
│   └── app/
│       ├── core/
│       │   └── llm.py              # call_llm() via 9Router (OpenAI-compatible), timeout 30s
│       ├── orchestrator/
│       │   ├── state.py            # Pydantic models: SessionState + semua result types
│       │   └── graph.py            # LangGraph StateGraph: 7 node, fan-out/fan-in
│       ├── agents/                 # 7 Agen Python (masing-masing punya prompt LLM)
│       │   ├── financial_literacy.py    # Deteksi level literasi user
│       │   ├── wealth_manager.py        # Evaluasi dana darurat + rekomendasi tabungan
│       │   ├── risk_profiler.py         # Profil risiko via LLM
│       │   ├── cross_validation.py      # Mediasi konflik antar agen
│       │   ├── market_intelligence.py   # Konteks pasar (BI rate, IHSG)
│       │   ├── investment_strategist.py # Susun portofolio + alokasi instrumen
│       │   └── communication_education.py # Rangkuman akhir + roadmap belajar
│       └── services/
│           └── market_data.py      # Data pasar: yfinance (saham IDX, BTC, emas, reksa dana)
│
└── files/                           # Dokumen pendukung (PRD, SRS, SAD, desain UI)
```

---

## Tahap 3: Arsitektur & Cara Kerja

### A. Frontend Pipeline (AKTIF — LLM + Fallback)

```
[User Input Form — 3 Seksi: Keuangan, Demografis, Tujuan & Risiko]
       │
       ▼
[FinanceContext.tsx] ─── runAgentPipeline()
       │
       ▼
[Orchestrator.ts v3.0] ─── Full Agentic Pipeline:
       │
       ├── PHASE 0: PLANNING — Bangun AgentPlan (6 steps)
       │
       ├── PHASE 1: TOOLS — Kalkulasi deterministik
       │   ├── toolFinancialCalculator() → surplus, dtiRatio, savingsRate
       │   ├── toolRiskScorer()          → riskScore, correctedRisk
       │   └── toolEmergencyFundAnalyzer() → status, progress, monthsNeeded
       │
       ├── PHASE 2: AGENT 1 — RiskProfilerAgent (LLM via 9Router)
       │      Input:  RawFinancialData
       │      LLM:    Prompt profiler + data keuangan → JSON parsing
       │      Output: surplus, dtiRatio, savingsRate, emergencyProgress,
       │              correctedRisk, isHealthy, explanation
       │      Fallback: Rule-based jika LLM gagal
       │
       ├── PHASE 3: AGENT 2 & 3 — Parallel (Promise.all)
       │   ├── WealthManagerAgent (LLM)
       │   │      Input:  RiskProfileResult + MarketData
       │   │      Output: allocations {rdpu, sbn, indexFund, crypto},
       │   │              projections[] (10 tahun), recommendedInstruments,
       │   │              message, pureInterest, totalOriginalCapital
       │   └── MarketAnalystAgent (LLM)
       │          Input:  RiskProfileResult
       │          Output: survivalMonths, isSurvivalDanger, floatingDebtImpact,
       │                  marketCrashImpact, hyperinflationImpact, jobLossImpact, conclusion
       │
       └── PHASE 4: MEMORY — Simpan ke AgentMemoryStore (localStorage)
              ReasoningTraces + AgentPlan + LastAnalysis tersimpan
              ChatService di-inject PortfolioSnapshot untuk chatbot
       │
       ▼
[React Context menyimpan hasil → UI auto-render semua halaman]
[ChatService.setPortfolioSnapshot() → Chatbot siap dengan konteks penuh]
```

### B. Backend Pipeline (Siap — Perlu API Key Valid)

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

**Market Data Endpoints (Backend):**
- `GET /api/market/instruments` — Katalog lengkap (saham IDX, RDPU, SBN, crypto, emas)
- `GET /api/market/summary` — Ringkasan pasar (IHSG, BTC, Gold, BI Rate)
- `GET /api/market/stocks` — Daftar saham IDX dengan harga live
- `GET /api/market/indices` — IHSG dan LQ45
- `GET /api/market/stock/{ticker}` — Detail harga per ticker
- `GET /api/market/history/{ticker}` — Historis harga untuk charting

---

## Tahap 4: Detail Setiap Komponen

### Frontend Pages

| Halaman | Route | Fungsi |
|---------|-------|--------|
| Landing Page | `/` | Marketing page dengan animasi, FAQ, tech stack marquee |
| Login | `/login` | Halaman autentikasi (AuthContext) |
| Beranda | `/beranda` | **Halaman utama**: Form 3 seksi → Loading animation → Hasil 3 agen + Chatbot Literacy Agent |
| Analisa | `/analisa` | Deep dive Risk Profiler: rasio DTI, savings rate, 3 skenario stress test |
| Rencana | `/rencana` | Deep dive Wealth Manager: breakdown instrumen + grafik bar proyeksi 10 tahun |
| Riwayat | `/riwayat` | Log riwayat sesi (membaca dari AgentMemoryStore localStorage) |

### Frontend Services (LLM-Powered + Fallback)

| File | Kelas/Fungsi | Status | Fungsi Utama |
|------|-------------|--------|--------------|
| `LLMService.ts` | `callAgentLLM()` | ✅ Aktif | HTTP POST ke 9Router, model rotation, SSE fallback parsing |
| `RiskProfilerAgent.ts` | `RiskProfilerAgent` | ✅ LLM + Fallback | Profil risiko via LLM, fallback rule-based jika LLM gagal |
| `WealthManagerAgent.ts` | `WealthManagerAgent` | ✅ LLM + Fallback | Alokasi + instrumen spesifik via LLM, fallback deterministik |
| `MarketAnalystAgent.ts` | `MarketAnalystAgent` | ✅ LLM + Fallback | Stress test via LLM, fallback kalkulasi lokal |
| `ChatService.ts` | `ChatService` | ✅ LLM Live | Chatbot dengan sistem prompt penuh + portfolio snapshot |
| `AgentMemoryStore.ts` | `AgentMemoryStore` | ✅ Aktif | localStorage, buildContextForChatbot(), max 50 episodic entries |
| `AgentCapabilities.ts` | — | ✅ Aktif | AGENT_GOALS, buildAgentPlan(), createReasoningTrace() |
| `AgentTools.ts` | — | ✅ Aktif | 4 alat deterministik (Calculator, RiskScorer, EmergencyFund, Allocator) |
| `MarketDataService.ts` | — | ✅ Aktif | Fetch dari backend + FALLBACK_INSTRUMENTS statis jika backend offline |
| `Orchestrator.ts` | `Orchestrator` | ✅ Full Agentic | Pipeline v3.0: Planning → Tools → Agent1 → Agent2+3 parallel → Memory |

### Backend Agents (LLM-Powered via 9Router)

| File | Fungsi | Model Target | Tugas |
|------|--------|--------------|-------|
| `financial_literacy.py` | `run_financial_literacy()` | `gemini-1.5-flash` | Klasifikasi literasi user |
| `wealth_manager.py` | `run_wealth_manager()` | `gpt-4o-mini` | Evaluasi dana darurat |
| `risk_profiler.py` | `run_risk_profiler()` | `claude-3-haiku` | Profil risiko: Konservatif/Moderat/Agresif |
| `cross_validation.py` | `run_cross_validation()` | `mimo-code-free` | Mediasi & hitung investable amount |
| `market_intelligence.py` | `run_market_intelligence()` | `opencode-free` | Konteks pasar (BI rate, IHSG) |
| `investment_strategist.py` | `run_investment_strategist()` | `gemini-1.5-pro` | Portofolio + alokasi instrumen |
| `communication_education.py` | `run_communication_education()` | `gpt-4o` | Narasi akhir + roadmap belajar |

### Backend Core

| File | Fungsi |
|------|--------|
| `main.py` | FastAPI v3.0 — CORS, `GET /api/health`, `POST /api/chat`, 6x `GET /api/market/*` |
| `app/core/llm.py` | `call_llm()` — HTTP POST ke 9Router, timeout 30s, fallback string |
| `app/services/market_data.py` | Fetch data saham IDX via yfinance, fallback statis |
| `app/orchestrator/state.py` | Pydantic models: `SessionState`, `RiskProfileResult`, `WealthStatusResult`, dll. |
| `app/orchestrator/graph.py` | LangGraph `StateGraph` — 7 node, fan-out/fan-in, `run_agent_graph()` |

---

## Tahap 5: Cara Menjalankan Proyek

### Prasyarat
- **Node.js** ≥ 18
- **Python** ≥ 3.10 (**gunakan 3.11 atau 3.12**, hindari 3.13)
- **Git**
- **9Router** atau provider LLM lain (OpenAI, Groq, OpenRouter)

### A. Menjalankan Frontend (Bisa Mandiri Tanpa Backend)

```powershell
cd FinanceIQ/frontend
npm install
npm run dev
```

Buka: **http://localhost:3000**

> Frontend berjalan mandiri. Agen memanggil LLM via 9Router (`localhost:20128`). Jika LLM tidak tersedia, fallback rule-based aktif otomatis. Market data di-fetch dari backend; jika backend offline, menggunakan data statis bawaan.

### B. Menjalankan Backend

```powershell
cd FinanceIQ/backend

# Buat virtual environment
python -m venv venv

# Aktifkan (Windows PowerShell)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Jalankan server
python main.py
```

Backend: **http://localhost:8000**
Health check: **http://localhost:8000/api/health**
Market summary: **http://localhost:8000/api/market/summary**

### C. Konfigurasi LLM

Edit `backend/.env`:
```env
NINEROUTER_URL=http://localhost:20128
NINEROUTER_KEY=your-9router-key

# Atau langsung ke provider resmi:
# NINEROUTER_URL=https://api.openai.com
# NINEROUTER_KEY=sk-xxxx
```

Edit `frontend/src/services/agents/LLMService.ts`:
```typescript
const API_URL = "http://localhost:20128/v1/chat/completions"; // Ganti sesuai provider
const API_KEY = "your-api-key";
```

### D. Troubleshooting Umum

| Masalah | Solusi |
|---------|--------|
| `source` not recognized (Windows) | Gunakan `.\venv\Scripts\activate` |
| `ModuleNotFoundError: pydantic_core._pydantic_core` | `pip uninstall pydantic pydantic-core -y && pip install --no-cache-dir pydantic pydantic-core` |
| Python 3.13 + pydantic error | Downgrade ke Python 3.11 atau 3.12 |
| LLM tidak merespons (Frontend) | Agen otomatis fallback ke rule-based — cek console browser |
| Backend LLM error | Pastikan `.env` berisi `NINEROUTER_URL` dan `NINEROUTER_KEY` yang valid |
| yfinance timeout | Backend pakai data statis jika fetch gagal — tidak memengaruhi frontend |

---

## Tahap 6: Status Proyek & Kekurangan

### Status Per Modul

| Modul | Status | Keterangan |
|-------|--------|------------|
| UI/UX Landing Page | ✅ Selesai | Animasi, responsive, dark mode |
| UI/UX Dashboard (Beranda) | ✅ Selesai | Form 3 seksi, loading state, hasil analisis, chatbot |
| UI/UX Analisa | ✅ Selesai | Stress test 3 skenario |
| UI/UX Rencana | ✅ Selesai | Alokasi instrumen + grafik proyeksi Recharts |
| UI/UX Riwayat | ⚠️ Basic | Membaca localStorage, belum ada persistensi cloud |
| UI/UX Login | ✅ Selesai | Halaman login dengan AuthContext |
| Frontend LLMService | ✅ Aktif | 9Router + model rotation + SSE parsing fallback |
| Frontend Mock Fallback | ✅ Aktif | Rule-based otomatis jika LLM gagal |
| Frontend Agents (3 agen) | ✅ LLM + Fallback | RiskProfiler, WealthManager, MarketAnalyst |
| ChatService (Literacy Agent) | ✅ LLM Live | Portfolio snapshot injection, 5 pesan gratis/sesi |
| AgentMemoryStore | ✅ Aktif | localStorage, context chatbot, episodic history |
| AgentTools (4 alat) | ✅ Aktif | Deterministik, dijalankan sebelum LLM |
| MarketDataService | ✅ Aktif | Fetch backend + fallback data statis |
| Backend FastAPI + CORS | ✅ Selesai | CORS dikonfigurasi, endpoint siap |
| Backend Market Data (yfinance) | ✅ Selesai | 6 endpoint aktif |
| Backend LLM (7 agen Python) | ⚠️ Perlu Key Valid | Struktur siap, butuh 9Router aktif atau API key resmi |
| Backend LangGraph Graph | ✅ Terkompilasi | 7 node, fan-out/fan-in, siap dijalankan |
| **Frontend ↔ Backend Wiring (Chat)** | ⚠️ **Belum Terhubung** | Frontend masih memanggil agen lokal, bukan `/api/chat` |
| Persistensi Data Cloud | ❌ Tidak Ada | Hanya localStorage — hilang saat clear cache |
| Autentikasi Penuh | ⚠️ Partial | AuthContext ada tapi belum ada backend auth |
| JSON Parse Reliability | ⚠️ Risiko | LLM kadang return JSON malformed — ada fallback tapi diam |

### Kekurangan Aktual (Update Terbaru)

1. **Frontend tidak memanggil Backend untuk analisis utama.**
   `FinanceContext.tsx` memanggil `Orchestrator.ts` (frontend agen lokal), bukan `POST /api/chat`. Backend 7-agen belum diintegrasikan ke alur utama.

2. **JSON Extraction reliability.**
   `LLMService.ts` sudah memiliki pembersih markdown `json` blok, tapi model yang berbeda-beda kadang return format berbeda. Silent fail ke mock data bisa terjadi tanpa UI feedback.

3. **Persistensi Data.**
   `AgentMemoryStore` menggunakan `localStorage`. Data hilang jika user ganti perangkat atau clear cache browser.

4. **Autentikasi belum lengkap.**
   `AuthContext.tsx` ada, halaman `/login` ada, tapi tidak ada backend auth (JWT, session). Semua user memiliki akses penuh tanpa login.

5. **ChatService limit 5 pesan hardcoded.**
   Setelah 5 pesan, user ditolak. Tidak ada mekanisme reset atau premium tier yang berfungsi.

6. **Halaman Riwayat terbatas.**
   Hanya membaca `localStorage` — tidak ada sinkronisasi antar perangkat atau penyimpanan permanen.

---

## Tahap 7: Langkah Penyelesaian

### Fase 1: Koneksi Frontend ↔ Backend (Opsional — Arsitektur Hybrid)

Backend 7-agen (Python/LangGraph) menggunakan schema berbeda dari frontend 3-agen (TypeScript). Pilih strategi:

**Opsi A — Tetap Frontend-Only (Rekomendasi Sementara):**
> Pertahankan arsitektur saat ini. Frontend sudah berjalan dengan LLM via 9Router. Fokus ke perbaikan lain lebih dulu.

**Opsi B — Integrasikan Backend:**
1. Selaraskan schema `types.ts` (FE) dengan `state.py` (BE)
2. Ubah `FinanceContext.tsx` agar `fetch` ke `POST /api/chat`
3. Pastikan 9Router aktif dan key valid di `backend/.env`

### Fase 2: Perkuat Reliabilitas LLM

4. **Implementasi Structured Outputs (Function Calling)** — gunakan `response_format: { type: "json_schema" }` untuk jaminan 100% schema JSON tidak error.
5. **UI feedback saat LLM fallback** — tampilkan toast/banner "Menggunakan mode estimasi (AI sedang sibuk)".

### Fase 3: Persistensi & Autentikasi

6. **Gantikan `localStorage`** dengan API calls ke backend (atau Firebase/Supabase).
7. **Implementasikan auth backend** — JWT atau NextAuth.js untuk sesi yang persistent.
8. **Halaman Riwayat** — fetch riwayat sesi dari database per user ID.

### Fase 4: Pengalaman Pengguna

9. **Streaming response** untuk chatbot (SSE/WebSocket) — efek typewriter agar tidak terasa lag.
10. **Validasi form lebih ketat** — cegah input dengan pendapatan = 0 atau pengeluaran > pendapatan ekstrem.
11. **Real-time market data** — update yfinance secara terjadwal di backend, bukan hanya saat request.

---

> **Kesimpulan:** Proyek memiliki fondasi arsitektur yang sangat matang — Clean Architecture, typed contracts, LangGraph orchestration, full agentic pipeline dengan memory & reasoning traces. LLM integration di frontend sudah berjalan aktif via 9Router dengan fallback otomatis. Prioritas berikutnya adalah reliabilitas JSON parsing, persistensi data cloud, dan autentikasi penuh.