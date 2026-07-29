# Panduan Mengganti API Key — dari 9Router ke Provider Resmi

> Dokumen ini menjelaskan cara mengganti konfigurasi LLM proyek FinanceIQ dari gateway **9Router** (saat ini aktif) ke API resmi dari provider seperti **OpenAI, Google Gemini, Anthropic Claude, Groq, atau OpenRouter**.

---

## Bagaimana Sistem LLM Saat Ini Bekerja

FinanceIQ menggunakan LLM di **dua lapisan**:

### Lapisan 1: Frontend (TypeScript)
File: `frontend/src/services/agents/LLMService.ts`

Fungsi `callAgentLLM()` dipakai oleh semua 3 agen frontend:
- `RiskProfilerAgent.ts`
- `WealthManagerAgent.ts`
- `MarketAnalystAgent.ts`
- `ChatService.ts` (Literacy Agent / Chatbot)

**Konfigurasi hardcoded di `LLMService.ts`:**
```typescript
const API_URL = "http://localhost:20128/v1/chat/completions";
const API_KEY = "sk-d87a7e..."; // 9Router API Key

const MODELS = [
  "kr/claude-sonnet-4.5",
  "kr/claude-haiku-4.5",
  "kr/deepseek-3.2"
];
```

Sistem merotasi model secara acak dan mencoba ulang jika gagal (`numModelsToTry = 2`).
Jika semua model gagal, setiap agen otomatis aktifkan **fallback rule-based**.

### Lapisan 2: Backend (Python)
File: `backend/app/core/llm.py`

Fungsi `call_llm()` dipakai oleh semua 7 agen backend. Konfigurasi dibaca dari `.env`:

| Variabel di `llm.py` | Dibaca dari `.env` | Default |
|---|---|---|
| `NINEROUTER_URL` | `NINEROUTER_URL` | `http://localhost:20128` |
| `NINEROUTER_KEY` | `NINEROUTER_KEY` | `dummy_key` |

Request dikirim ke: `{NINEROUTER_URL}/v1/chat/completions`

Format ini adalah **OpenAI-Compatible** — penggantian provider hanya perlu ganti 2 baris di `.env`.

---

## Peta Model yang Digunakan Tiap Agen

### Frontend Agents (3 agen, semua pakai LLMService)

| Agen | Model (rotasi acak via 9Router) | Fallback |
|---|---|---|
| `RiskProfilerAgent.ts` | kr/claude-sonnet-4.5, kr/claude-haiku-4.5, kr/deepseek-3.2 | Rule-based kalkulasi |
| `WealthManagerAgent.ts` | kr/claude-sonnet-4.5, kr/claude-haiku-4.5, kr/deepseek-3.2 | Alokasi deterministik |
| `MarketAnalystAgent.ts` | kr/claude-sonnet-4.5, kr/claude-haiku-4.5, kr/deepseek-3.2 | Kalkulasi lokal |
| `ChatService.ts` | kr/claude-sonnet-4.5, kr/claude-haiku-4.5, kr/deepseek-3.2 | buildFallbackResponse() |

### Backend Agents (7 agen, masing-masing tentukan model sendiri)

| File Agen | Model Saat Ini (via 9Router) | Fungsi |
|---|---|---|
| `risk_profiler.py` | `claude-3-haiku` | Analisis profil risiko keuangan |
| `wealth_manager.py` | `gpt-4o-mini` | Alokasi dan perencanaan kekayaan |
| `investment_strategist.py` | `gemini-1.5-pro` | Strategi portofolio investasi |
| `financial_literacy.py` | `gemini-1.5-flash` | Edukasi dan literasi keuangan |
| `market_intelligence.py` | `opencode-free` | Analisis intelijen pasar |
| `cross_validation.py` | `mimo-code-free` | Validasi silang antar agen |
| `communication_education.py` | `gpt-4o` | Komunikasi dan narasi akhir |

---

## Cara Mengganti ke Provider Resmi

### Langkah 1: Pilih Provider dan Dapatkan API Key

#### A. OpenAI (ChatGPT)
- Daftar: https://platform.openai.com/api-keys
- Model tersedia: `gpt-4o`, `gpt-4o-mini`, `o3-mini`
- Base URL: `https://api.openai.com`

#### B. Google Gemini
- Daftar: https://aistudio.google.com/apikey
- Model tersedia: `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash`
- Base URL: `https://generativelanguage.googleapis.com/v1beta/openai`
- Harga: Ada tier gratis yang cukup generous

#### C. Anthropic Claude
- Daftar: https://console.anthropic.com/settings/keys
- Catatan: **Tidak OpenAI-compatible secara native** — gunakan via OpenRouter (lihat opsi E)

#### D. Groq (Gratis, Sangat Cepat)
- Daftar: https://console.groq.com/keys
- Model tersedia: `llama-3.3-70b-versatile`, `gemma2-9b-it`, `mixtral-8x7b-32768`
- Base URL: `https://api.groq.com/openai`
- Harga: **Gratis** dengan rate limit lumayan

#### E. OpenRouter (Multi-Provider, Banyak Model Gratis)
- Daftar: https://openrouter.ai/settings/keys
- Model tersedia: Ratusan model, format: `openai/gpt-4o`, `anthropic/claude-3-haiku`, `google/gemini-flash-1.5`
- Base URL: `https://openrouter.ai/api`
- Harga: Pay-as-you-go, banyak model gratis dengan suffix `:free`

---

### Langkah 2A: Ganti Konfigurasi Frontend (`LLMService.ts`)

Buka `frontend/src/services/agents/LLMService.ts` dan ubah 2 baris pertama:

```typescript
// Sebelum (9Router lokal):
const API_URL = "http://localhost:20128/v1/chat/completions";
const API_KEY = "sk-d87a7e...";

// ── Pilih salah satu opsi di bawah ini ──────────────────────────

// Opsi A — OpenAI:
const API_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx";

// Opsi B — Google Gemini:
const API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const API_KEY = "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX";

// Opsi C — Groq (Gratis):
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = "gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx";

// Opsi D — OpenRouter (Multi-Provider):
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = "sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxx";
```

Lalu sesuaikan array model:
```typescript
// Untuk OpenAI:
const MODELS = ["gpt-4o-mini", "gpt-4o"];

// Untuk Groq (gratis):
const MODELS = ["llama-3.3-70b-versatile", "gemma2-9b-it"];

// Untuk OpenRouter (gratis):
const MODELS = [
  "meta-llama/llama-3-70b-instruct:free",
  "google/gemini-flash-1.5:free",
  "mistralai/mistral-7b-instruct:free"
];
```

### Langkah 2B: Ganti Konfigurasi Backend (`backend/.env`)

```env
# Sebelum (9Router lokal):
NINEROUTER_URL=http://localhost:20128
NINEROUTER_KEY=dummy_key

# Opsi A — OpenAI:
NINEROUTER_URL=https://api.openai.com
NINEROUTER_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Opsi B — Google Gemini:
NINEROUTER_URL=https://generativelanguage.googleapis.com/v1beta/openai
NINEROUTER_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX

# Opsi C — Groq (Gratis):
NINEROUTER_URL=https://api.groq.com/openai
NINEROUTER_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Opsi D — OpenRouter (Multi-Provider):
NINEROUTER_URL=https://openrouter.ai/api
NINEROUTER_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Penting**: Nama variabelnya tetap `NINEROUTER_URL` dan `NINEROUTER_KEY`.
> Hanya **nilainya** yang diganti. File `llm.py` tidak perlu diubah.

### Langkah 3: Update Nama Model di Agen Backend (jika perlu)

Setelah ganti provider, nama model di tiap file agen backend perlu disesuaikan:

```
backend/app/agents/
├── risk_profiler.py          → model="claude-3-haiku"
├── wealth_manager.py         → model="gpt-4o-mini"
├── investment_strategist.py  → model="gemini-1.5-pro"
├── financial_literacy.py     → model="gemini-1.5-flash"
├── market_intelligence.py    → model="opencode-free"
├── cross_validation.py       → model="mimo-code-free"
└── communication_education.py→ model="gpt-4o"
```

**Referensi nama model yang valid per provider:**

| Agen | OpenAI | Gemini | Groq | OpenRouter |
|---|---|---|---|---|
| `risk_profiler` | `gpt-4o-mini` | `gemini-1.5-flash` | `llama-3.3-70b-versatile` | `anthropic/claude-3-haiku` |
| `wealth_manager` | `gpt-4o-mini` | `gemini-1.5-flash` | `llama-3.3-70b-versatile` | `openai/gpt-4o-mini` |
| `investment_strategist` | `gpt-4o` | `gemini-1.5-pro` | `llama-3.3-70b-versatile` | `google/gemini-pro-1.5` |
| `financial_literacy` | `gpt-4o-mini` | `gemini-1.5-flash` | `gemma2-9b-it` | `google/gemini-flash-1.5` |
| `market_intelligence` | `gpt-4o-mini` | `gemini-1.5-flash` | `llama-3.3-70b-versatile` | `meta-llama/llama-3-70b-instruct` |
| `cross_validation` | `gpt-4o` | `gemini-1.5-pro` | `llama-3.3-70b-versatile` | `openai/gpt-4o` |
| `communication_education` | `gpt-4o` | `gemini-1.5-pro` | `llama-3.3-70b-versatile` | `openai/gpt-4o` |

---

## Rekomendasi Setup Paling Hemat (Gratis 100%)

Gunakan **OpenRouter** sebagai gateway tunggal — banyak model gratis tersedia:

```typescript
// LLMService.ts (Frontend)
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = "sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const MODELS = [
  "meta-llama/llama-3-70b-instruct:free",
  "google/gemini-flash-1.5:free",
  "mistralai/mistral-7b-instruct:free"
];
```

```env
# backend/.env
NINEROUTER_URL=https://openrouter.ai/api
NINEROUTER_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

```python
# Ganti di setiap file agen backend:
model="meta-llama/llama-3-70b-instruct:free"
# atau:
model="google/gemini-flash-1.5:free"
```

---

## Catatan Khusus: Anthropic Claude Direct

Anthropic menggunakan format header yang berbeda (`x-api-key` bukan `Authorization: Bearer`).
Jika ingin Claude direct tanpa OpenRouter, `llm.py` perlu dimodifikasi:

```python
headers = {
    "x-api-key": NINEROUTER_KEY,
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json"
}
endpoint = "https://api.anthropic.com/v1/messages"
```

**Cara paling mudah tetap: gunakan Claude via OpenRouter** — tidak perlu ubah kode sama sekali.

---

## Ringkasan: File yang Perlu Diubah

| Perubahan | File | Jumlah Edit |
|---|---|---|
| Ganti URL & API Key (Frontend) | `frontend/src/services/agents/LLMService.ts` | 2 baris + array model |
| Ganti URL & API Key (Backend) | `backend/.env` | 2 baris |
| Ganti nama model backend | `backend/app/agents/*.py` | 7 file, 1 baris per file |
| Multi-provider routing (opsional) | `backend/app/core/llm.py` | Pengembangan lanjut |
