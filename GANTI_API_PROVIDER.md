# Panduan Mengganti API Key — dari 9Router ke Provider Resmi

> Dokumen ini menjelaskan cara mengganti konfigurasi LLM proyek FinanceIQ dari gateway **9Router** (localhost) ke API resmi dari provider seperti **OpenAI, Google Gemini, Anthropic Claude, Groq, atau OpenRouter**.

---

## Bagaimana Sistem LLM Saat Ini Bekerja

Semua panggilan AI di proyek ini melewati **satu file tunggal**:

```
backend/app/core/llm.py
```

File ini berisi fungsi `call_llm()` yang dipakai oleh semua **7 agen** di folder `backend/app/agents/`. Berikut variabel kunci di dalamnya:

| Variabel di `llm.py` | Dibaca dari `.env` | Default |
|---|---|---|
| `NINEROUTER_URL` | `NINEROUTER_URL` | `http://localhost:20128` |
| `NINEROUTER_KEY` | `NINEROUTER_KEY` | `dummy_key` |

Request dikirim ke endpoint: `{NINEROUTER_URL}/v1/chat/completions`

Format ini adalah **OpenAI-Compatible**, artinya hampir semua provider modern menggunakan format yang sama. Ini yang membuat penggantian mudah dilakukan — **cukup ganti 2 baris di file `.env`**.

---

## Peta Model yang Digunakan Tiap Agen

Setiap agen memanggil `call_llm(..., model="nama-model")`:

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
- Harga: Berbayar per token (gpt-4o-mini paling hemat)

#### B. Google Gemini
- Daftar: https://aistudio.google.com/apikey
- Model tersedia: `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash`
- Base URL: `https://generativelanguage.googleapis.com/v1beta/openai`
- Harga: Ada tier gratis yang cukup generous

#### C. Anthropic Claude
- Daftar: https://console.anthropic.com/settings/keys
- Model tersedia: `claude-3-haiku-20240307`, `claude-3-5-sonnet-20241022`
- Catatan: Tidak OpenAI-compatible secara native — gunakan via OpenRouter (lihat bagian E)

#### D. Groq (Gratis, Sangat Cepat)
- Daftar: https://console.groq.com/keys
- Model tersedia: `llama-3.3-70b-versatile`, `gemma2-9b-it`, `mixtral-8x7b-32768`
- Base URL: `https://api.groq.com/openai`
- Harga: **Gratis** dengan rate limit yang lumayan

#### E. OpenRouter (Multi-Provider, Banyak Model Gratis)
- Daftar: https://openrouter.ai/settings/keys
- Model tersedia: Ratusan model, format: `openai/gpt-4o`, `anthropic/claude-3-haiku`, `google/gemini-flash-1.5`
- Base URL: `https://openrouter.ai/api`
- Harga: Pay-as-you-go, banyak model gratis dengan suffix `:free`

---

### Langkah 2: Edit File `backend/.env`

Buka file `backend/.env`, lalu ubah dua baris ini:

```env
# Sebelum (menggunakan 9Router lokal):
NINEROUTER_URL=http://localhost:20128
NINEROUTER_KEY=dummy_key

# ── Pilih salah satu opsi di bawah ini ──────────────────────────

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

---

### Langkah 3: Update Nama Model di Tiap Agen

Setelah ganti provider, nama model di tiap file agen perlu disesuaikan.

**File-file yang perlu diedit** (semuanya di `backend/app/agents/`):

```
risk_profiler.py          → cari: model="claude-3-haiku"
wealth_manager.py         → cari: model="gpt-4o-mini"
investment_strategist.py  → cari: model="gemini-1.5-pro"
financial_literacy.py     → cari: model="gemini-1.5-flash"
market_intelligence.py    → cari: model="opencode-free"
cross_validation.py       → cari: model="mimo-code-free"
communication_education.py→ cari: model="gpt-4o"
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

Gunakan kombinasi **Groq** (untuk model Llama/Gemma yang gratis) dan **OpenRouter** (untuk akses Claude/Gemini gratis):

```env
# Gunakan OpenRouter sebagai gateway tunggal — punya banyak model gratis
NINEROUTER_URL=https://openrouter.ai/api
NINEROUTER_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Lalu ubah semua model di agen ke model gratis OpenRouter:

```python
# Ganti di setiap agen:
model="meta-llama/llama-3-70b-instruct:free"
# atau:
model="mistralai/mistral-7b-instruct:free"
# atau:
model="google/gemini-flash-1.5:free"
```

---

## Catatan Khusus: Anthropic Claude Direct

Anthropic menggunakan format header yang berbeda (`x-api-key` bukan `Authorization: Bearer`).  
Jika ingin Claude direct tanpa OpenRouter, `llm.py` perlu dimodifikasi:

```python
# Modifikasi di llm.py untuk Claude direct:
headers = {
    "x-api-key": NINEROUTER_KEY,          # bukan "Authorization: Bearer ..."
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json"
}
endpoint = "https://api.anthropic.com/v1/messages"
# Format body juga berbeda (messages format berbeda)
```

**Cara paling mudah tetap: gunakan Claude via OpenRouter** — tidak perlu ubah kode sama sekali.

---

## Ringkasan: File yang Perlu Diubah

| Perubahan | File | Jumlah Edit |
|---|---|---|
| Ganti URL & API Key | `backend/.env` | 2 baris |
| Ganti nama model setiap agen | `backend/app/agents/*.py` | 7 file, 1 baris per file |
| Multi-provider routing (opsional) | `backend/app/core/llm.py` | Pengembangan lanjut |
