# Laporan Status Proyek: FinanceIQ (Handover & Update)

Dokumen ini berisi rangkuman status pengembangan terkini (Frontend, Backend, dan AI) aplikasi FinanceIQ. Dokumen ini memastikan tim mengetahui persis apa yang sudah selesai, perubahan terbaru yang diimplementasikan, serta analisis kekurangan dan langkah selanjutnya.

---

## 1. Frontend & UI (Status: ✅ SELESAI)
Seluruh antarmuka pengguna (*User Interface*) telah selesai dibangun dan siap pakai.

- **Desain & Layout:** Skema warna premium Dark Mode/Glassmorphism. Framer Motion untuk animasi halus. Recharts untuk grafik proyeksi.
- **Form Input 3 Seksi:** Form diperluas menjadi tiga seksi lengkap:
  - **Seksi A:** Data keuangan dasar (Pendapatan, Pengeluaran, Cicilan, Tabungan, Side Income, Investasi Existing)
  - **Seksi B:** Profil demografis (Usia, Status Kerja, Tanggungan, Pengalaman Investasi, Horison, Instrumen Dikenal)
  - **Seksi C:** Tujuan & Toleransi Risiko (Goal, Profil Risiko, Reaksi Drawdown, Catatan Tambahan)
- **Format Rupiah Dinamis:** Semua input field finansial mendukung auto-format Rupiah secara *real-time* tanpa mengacaukan pengiriman data *raw* ke *state*.
- **Halaman Login:** Halaman `/login` dengan `AuthContext.tsx` untuk manajemen sesi user.
- **Visualisasi Hasil:** Komponen `InstrumentBreakdownSection` yang dapat di-*expand* (*collapsible*) untuk menampilkan rincian instrumen spesifik (RDPU, SBN, Index Fund, Crypto) lengkap dengan alasan rekomendasi AI dan persentase alokasi.
- **Grafik Proyeksi:** Halaman `/rencana` menggunakan Recharts untuk visualisasi proyeksi 10 tahun.

---

## 2. Arsitektur Multi-Agent & LLM (Status: ✅ TERINTEGRASI — LLM Aktif)

Sistem Multi-Agent versi 3.0 telah dibangun menggunakan pola **Clean Architecture** pada folder `src/services/agents/`.

### Pipeline Agentic (Frontend)
`Orchestrator.ts` mengatur pipeline *Full Agentic* dalam 4 fase:

1. **PHASE 0 — PLANNING:** Membangun `AgentPlan` dengan 6 langkah sebelum eksekusi.
2. **PHASE 1 — TOOLS:** 4 alat deterministik dijalankan sebelum LLM:
   - `toolFinancialCalculator` — surplus, DTI, savings rate
   - `toolRiskScorer` — risk score 0-100 + corrected risk
   - `toolEmergencyFundAnalyzer` — status, progress, bulan yang dibutuhkan
   - `toolInvestmentAllocator` — pra-alokasi berdasarkan risk score
3. **PHASE 2 — AGENT 1 (Risk Profiler):** LLM via 9Router → JSON parsing → fallback rule-based.
4. **PHASE 3 — AGENT 2 & 3 (Parallel):** `Promise.all()` — WealthManager + MarketAnalyst secara bersamaan.
5. **PHASE 4 — MEMORY:** Simpan ke `AgentMemoryStore` (localStorage).

### LLM Integration (`LLMService.ts`)
- Memanggil **9Router** (`localhost:20128`) dengan format OpenAI-compatible.
- **Model rotation:** Pilih acak dari `[kr/claude-sonnet-4.5, kr/claude-haiku-4.5, kr/deepseek-3.2]`.
- **Retry mechanism:** Coba 2 model berbeda sebelum menyerah.
- **SSE parsing fallback:** Menangani jika 9Router mengirim response sebagai Server-Sent Events.
- **JSON extraction:** Otomatis bersihkan markdown code block ` ```json ` dari respons LLM.
- **Jika semua gagal:** Setiap agen punya fallback rule-based deterministik (tidak crash).

### Instrumen Spesifik via LLM
`WealthManagerAgent.ts` kini merekomendasikan instrumen **spesifik** (bukan hanya kategori umum):
- **RDPU:** Nama reksa dana pasar uang spesifik dengan manajer investasi
- **SBN:** Seri ORI/SR/SBR/ST terkini dengan kupon dan tenor
- **Index Fund:** ETF atau reksa dana indeks dengan return 1 tahun
- **Crypto:** Bitcoin, Ethereum, atau Solana dengan risk disclaimer
- Setiap instrumen dilengkapi `whyRecommended` — penjelasan AI kenapa instrumen itu cocok.

### Market Data Live (`MarketDataService.ts`)
Fetch data dari **Backend FastAPI** (`/api/market/*`):
- Harga saham IDX via yfinance
- Data RDPU, SBN, crypto (fallback statis jika backend offline)
- IHSG, BTC, Gold, BI Rate untuk konteks LLM

---

## 3. Chatbot Konsultasi "Literacy Agent" (Status: ✅ AKTIF & SINKRON)

- **LLM Live:** `ChatService.ts` memanggil LLM via `LLMService` — bukan respons hardcoded.
- **Konteks Memori — Bug Diperbaiki:** Chatbot di-*inject* langsung (via `PortfolioSnapshot`) dengan data React Context begitu proses *pipeline Orchestrator* selesai. Agen tidak akan lagi meminta user memasukkan ulang datanya.
- **Sistem Prompt Lengkap:** Prompt chatbot mencakup data input pengguna + hasil ketiga agen (Risk Profiler, Wealth Manager, Market Analyst) + nama instrumen spesifik yang direkomendasikan.
- **Fallback Berbasis Data:** Jika LLM gagal, `buildFallbackResponse()` tetap memberikan jawaban yang menggunakan angka nyata user (bukan respons generik).
- **Batas Pesan:** 5 pesan gratis per sesi (dikontrol via `sessionStorage`).

---

## 4. Backend (Status: ✅ Siap — Perlu API Key Valid untuk LLM)

### FastAPI Server
- **CORS dikonfigurasi** — Allow origins: `localhost:3000`, `localhost:3001`
- **Version 3.0** — `GET /api/health` return `{"status": "ok", "version": "3.0"}`
- **Endpoint utama:** `POST /api/chat` — menerima `ChatRequest` dan menjalankan LangGraph graph

### Market Data (6 Endpoint Aktif)
| Endpoint | Fungsi |
|---|---|
| `GET /api/market/instruments` | Katalog lengkap (saham, RDPU, SBN, crypto, emas) |
| `GET /api/market/summary` | IHSG, BTC, Gold, BI Rate |
| `GET /api/market/stocks` | Saham IDX dengan harga live (yfinance) |
| `GET /api/market/indices` | IHSG dan LQ45 |
| `GET /api/market/stock/{ticker}` | Detail per ticker |
| `GET /api/market/history/{ticker}` | Historis harga untuk charting |

### LangGraph (7 Node)
Graph sudah terkompilasi dan siap. Bergantung pada `call_llm()` yang memanggil 9Router. Jika API key tidak valid, setiap node return fallback string.

---

## 5. Analisis Kekurangan (Apa yang Belum Dioptimalkan)

1. **Frontend ↔ Backend Wiring (Analisis Utama):**
   `FinanceContext.tsx` masih memanggil `Orchestrator.ts` (frontend agents), bukan `POST /api/chat`. Backend 7-agen LangGraph belum diintegrasikan ke alur utama.

2. **Keandalan Ekstraksi JSON dari LLM:**
   LLM kadang mengembalikan JSON dengan teks tambahan atau struktur sedikit berbeda yang menyebabkan *silent fail* ke mock/fallback. Belum ada Structured Outputs / Function Calling.

3. **Persistensi Data:**
   `AgentMemoryStore` menggunakan `localStorage`. Jika user ganti perangkat atau bersihkan cache, seluruh riwayat chat dan profil finansial hilang. Integrasi database cloud (Firebase/Supabase) belum ada.

4. **Autentikasi Belum Lengkap:**
   `AuthContext.tsx` dan halaman `/login` sudah ada, tapi tidak ada backend auth (JWT/NextAuth). Semua pengguna mengakses fitur tanpa login yang sesungguhnya.

5. **Limit Chatbot Hardcoded:**
   5 pesan gratis per sesi dikontrol di `sessionStorage` — mudah di-reset dan tidak ada mekanisme premium tier yang berfungsi.

6. **Halaman Riwayat Terbatas:**
   Membaca dari `localStorage` saja — tidak sinkron antar perangkat, tidak ada server-side storage.

7. **yfinance Ketergantungan Jaringan:**
   Backend market data bergantung pada koneksi ke yfinance. Jika timeout, frontend otomatis pakai data fallback statis — tapi data bisa sudah lama.

---

## 6. Rekomendasi Selanjutnya (Langkah Perbaikan)

1. **Implementasi Structured Outputs (Function Calling):**
   Gunakan `response_format: { type: "json_schema" }` untuk menjamin 100% schema JSON dari LLM tidak akan error saat di-*parse*.

2. **UI Feedback saat Fallback Aktif:**
   Tampilkan toast/banner "Menggunakan mode estimasi — AI sedang sibuk" agar user tidak bingung dengan respons berbeda.

3. **Koneksi Database (PostgreSQL / Firebase):**
   Gantikan `localStorage` di `AgentMemoryStore.ts` dengan HTTP call ke backend agar data profil dan reasoning traces tersimpan permanen per User ID.

4. **Backend Auth (NextAuth.js atau JWT):**
   Implementasikan auth sesungguhnya — sinkronkan `AuthContext.tsx` ke endpoint backend, bukan hanya state lokal.

5. **Streaming Response untuk Chatbot:**
   Ubah `ChatService.ts` agar mendukung SSE (*Server-Sent Events*). Saat ini chat menunggu seluruh respons selesai sebelum ditampilkan — efek typewriter akan buat UX jauh lebih baik.

6. **Perkaya & Jadwalkan Market Data:**
   Update `market_data.py` di backend agar me-*cache* data yfinance secara terjadwal (setiap 15 menit via Celery/APScheduler), sehingga tidak semua request ke yfinance langsung.

7. **Integrasikan Backend 7-Agen (Long-term):**
   Selaraskan schema `types.ts` (FE) dengan `state.py` (BE), lalu ubah `FinanceContext.tsx` agar memanggil `POST /api/chat` untuk analisis utama.
