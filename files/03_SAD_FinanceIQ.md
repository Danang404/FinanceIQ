# Software Architecture Document (SAD)
# FinanceIQ — Arsitektur Sistem Multi-Agent AI

**Versi:** 2.0 (Refactor)
**Referensi:** PRD v2.0, SRS v2.0
**Disusun oleh:** Danang Yudo Prakosa (23.11.5841)

---

## 1. Tujuan Dokumen
Menjabarkan arsitektur teknis sistem FinanceIQ hasil refactor: struktur komponen, alur data antar agent, keputusan teknologi, dan strategi deployment — seluruhnya dengan batasan wajib **free tier only** dan **9Router sebagai LLM gateway tunggal**.

## 2. Gambaran Arsitektur Tingkat Tinggi

```
┌────────────────────┐        ┌──────────────────────────────┐
│  Frontend (Next.js) │  HTTP  │  Backend (FastAPI)            │
│  Vercel (free tier)  │◄──────►│  Render (free tier)            │
│                      │        │  LangGraph Orchestrator        │
└─────────┬───────────┘        └───────────┬───────────────────┘
          │                                  │
          │                                  ▼
          │                    ┌──────────────────────────┐
          │                    │  9Router (self-hosted)     │
          │                    │  Railway (free tier)         │
          │                    │  fallback: Kiro AI → iFlow  │
          │                    │  → MiMo Code Free/OpenCode  │
          │                    └──────────────────────────┘
          │
          ▼
┌────────────────────┐        ┌──────────────────────────┐
│  Supabase (Postgres) │        │  Redis Upstash (state/cache) │
│  data sesi & profil   │        │  free tier                    │
└────────────────────┘        └──────────────────────────┘
```

## 3. Komponen Utama

### 3.1 Frontend — Next.js 14 (Vercel)
- App Router, rendering hybrid (server component untuk data statis, client component untuk interaksi chat).
- Antarmuka chat-based dengan kartu hasil terstruktur (lihat mockup `financeiq_mockup_alur_pemula.html` sebagai referensi visual dark glassmorphism).
- State sesi di sisi klien minimal — sumber kebenaran (source of truth) tetap di backend/Supabase agar sesi dapat dilanjutkan lintas perangkat.

### 3.2 Backend — FastAPI + LangGraph (Render)
- FastAPI sebagai lapisan HTTP/API.
- LangGraph sebagai orchestrator state graph 6 node agent + 1 node mediasi (Cross-Validation).
- Setiap node adalah fungsi Python yang menerima `state` (Pydantic model), memanggil LLM via 9Router bila diperlukan, dan mengembalikan `state` yang diperbarui.

### 3.3 LLM Gateway — 9Router (wajib, self-hosted) + Fallback Chain
- 9Router secara default berjalan sebagai proxy lokal (`localhost:20128`), dirancang untuk dipakai bareng coding tools di komputer pribadi. Karena backend FinanceIQ berjalan di Render (bukan di komputer pengembang), 9Router **wajib di-deploy sebagai layanan hosting sendiri**, bukan dijalankan secara lokal.
- Deployment 9Router dilakukan ke **Railway (tingkat gratis)** menggunakan template deploy yang tersedia, menghasilkan URL publik (mis. `https://9router-financeiq.up.railway.app`) yang menggantikan `localhost:20128` di seluruh konfigurasi backend.
- Endpoint hosting 9Router wajib diamankan: `INITIAL_PASSWORD`/`JWT_SECRET` kuat, dan `REQUIRE_API_KEY=true` diaktifkan karena instance ini terekspos ke internet (bukan lagi hanya `127.0.0.1`).
- Seluruh pemanggilan model dari LangGraph node diarahkan ke endpoint 9Router hosted tersebut (`{NINEROUTER_URL}/v1/chat/completions`).
- Skema fallback berurutan tetap: **9Router → Kiro AI → iFlow → MiMo Code Free / OpenCode Free**, dikonfigurasi sebagai daftar prioritas di lapisan klien LLM backend, dengan retry otomatis saat provider utama mengembalikan error rate-limit atau timeout.
- Abstraksi ini diimplementasikan sebagai satu modul `llm_client` yang membaca `NINEROUTER_URL` dan `NINEROUTER_KEY` dari environment variable Render, agar node agent tidak perlu tahu provider mana yang sedang aktif maupun di mana 9Router di-hosting.

### 3.4 Basis Data — Supabase (Postgres, free tier)
- Menyimpan: profil pengguna, riwayat sesi, snapshot state tiap node (untuk audit trail akademis), dan hasil akhir tiap sesi.
- Row Level Security (RLS) aktif; akses ditentukan oleh token sesi pengguna, bukan akses langsung dari klien ke kredensial database.

### 3.5 Cache/State Sementara — Redis Upstash (free tier)
- Menyimpan state LangGraph yang sedang berjalan (in-progress) selama sesi aktif, untuk mengurangi round-trip ke Postgres pada tiap langkah percakapan.
- State final di-*persist* ke Supabase setelah sesi selesai atau pada checkpoint tertentu.

## 4. Arsitektur Multi-Agent (LangGraph State Graph)

### 4.1 Struktur Graph

```
[Entry]
   │
   ▼
(1) Financial Literacy Agent ──► set literacy_level, communication_style
   │
   ▼
(2) Pengumpulan Data Dasar (non-agent, form/percakapan terstruktur)
   │
   ├──► (3) Risk Profiling Agent ─────┐
   │                                   │
   └──► (4) Wealth Management Agent ──┤
                                       ▼
                          (5) Cross-Validation (node mediasi)
                                       │
                                       ▼
                          (6) Market Intelligence Agent
                                       │
                                       ▼
                          (7) Investment Strategist Agent
                                       │
                                       ▼
                          (8) Communication & Education Agent
                                       │
                                       ▼
                                  [Output Final]
```

Catatan: node (3) Risk Profiling dan (4) Wealth Management dijalankan **paralel** dalam LangGraph (fan-out), kemudian hasilnya digabung di node (5) Cross-Validation (fan-in) sebelum lanjut ke node berikutnya — mencerminkan bahwa kedua penilaian ini independen satu sama lain tapi harus dimediasi sebelum lanjut ke strategi investasi.

### 4.2 Kontrak Data Antar Node (Shared State)

Seluruh node membaca/menulis satu objek `SessionState` (Pydantic), bukan riwayat chat mentah. Struktur inti:

```python
class SessionState(BaseModel):
    literacy_level: str
    communication_style: str
    data_dasar: DataDasarKeuangan
    risk_profile: RiskProfileResult | None
    wealth_status: WealthStatusResult | None
    mediation_result: MediationResult | None
    market_context: MarketContextResult | None
    allocation: AllocationResult | None
    final_output: FinalOutputResult | None
    glosarium: list[GlossaryTerm]
```

Pendekatan ini memastikan setiap agent hanya bergantung pada *field* yang relevan dari state, bukan keseluruhan riwayat percakapan — mengurangi ukuran prompt yang dikirim ke LLM (penting untuk efisiensi pada free tier) dan mencegah *context bleeding* antar agent.

### 4.3 Prinsip Desain Tiap Node
- Setiap node memiliki **satu tanggung jawab tunggal** dan tidak boleh mengetahui detail implementasi node lain.
- Node hanya boleh menulis ke *field* state yang menjadi tanggung jawabnya.
- Node yang bergantung pada literasi pengguna (Risk Profiling, Wealth Management, Investment Strategist, Communication & Education) wajib membaca `communication_style` di awal eksekusinya untuk menentukan gaya bahasa output.

## 5. Keputusan Arsitektural Kunci (ADR Ringkas)

| Keputusan | Alasan |
|---|---|
| LangGraph dipilih ketimbang orkestrasi manual berbasis if-else | Mendukung percabangan (fan-out/fan-in) dan checkpointing bawaan, relevan untuk trade-off akademis "state graph vs pipeline linear" |
| Redis Upstash untuk state in-progress, Supabase untuk state final | Memisahkan beban baca-tulis frekuensi tinggi (selama sesi aktif) dari penyimpanan permanen, tetap dalam batas free tier |
| 9Router sebagai gateway tunggal + fallback chain | Menghindari ketergantungan pada satu provider LLM yang mungkin kena rate-limit saat demo, tanpa biaya tambahan |
| State terstruktur (Pydantic) ketimbang mengoper transcript chat mentah antar agent | Konsistensi output, prompt lebih ringkas, dan lebih mudah diuji/divalidasi secara programatik |
| Cross-Validation sebagai *node* dalam graph, bukan agent LLM terpisah | Logikanya bersifat deterministik/rule-based (deteksi konflik dana darurat vs investasi), sehingga tidak selalu perlu pemanggilan LLM tambahan — menghemat kuota gratis |
| 9Router di-deploy ke Railway (self-hosted), bukan dijalankan sebagai proxy lokal | Backend Render berjalan 24/7 tanpa komputer pengembang menyala; 9Router butuh endpoint publik yang stabil agar dapat diakses backend kapan saja, termasuk saat demo sidang |

## 6. Keamanan

- Kredensial 9Router dan provider fallback disimpan sebagai environment variable di Render, tidak pernah dikirim ke klien.
- RLS Supabase memastikan satu pengguna hanya bisa membaca/menulis data sesinya sendiri.
- Endpoint FastAPI memvalidasi token sesi pada setiap pemanggilan node, mencegah manipulasi state dari sisi klien.

## 7. Deployment

| Layer | Penyedia | Tingkat |
|---|---|---|
| Frontend | Vercel | Free |
| Backend/API | Render | Free |
| Database | Supabase | Free |
| Cache/state | Redis Upstash | Free |
| LLM Gateway (9Router, self-hosted) | Railway | Free |
| Fallback providers | Kiro AI, iFlow, MiMo Code Free/OpenCode Free | Free/tier gratis masing-masing |

Karena Render free tier memiliki cold start setelah idle, backend perlu strategi *warm-up* ringan (mis. health-check periodik) agar demo sidang tidak terkendala latensi awal.

## 8. Keterkaitan dengan Dokumen Lain
- Kebutuhan fungsional per node mengacu pada `02_SRS_FinanceIQ.md` (FR-1 s.d. FR-9).
- Tahapan migrasi dari arsitektur lama ke arsitektur ini dijabarkan di `04_Blueprint_Refactor_FinanceIQ.md`.
