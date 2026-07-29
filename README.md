<div align="center">
  <h1>🌟 FinanceIQ</h1>
  <p><em>Your Intelligent, AI-Driven Financial Companion</em></p>
</div>

<br/>

**FinanceIQ** adalah platform finansial canggih berbasis Artificial Intelligence yang dirancang khusus untuk memberdayakan setiap keputusan finansial Anda. Dengan arsitektur **Multi-Agent AI** yang menganalisis pasar, memetakan risiko, hingga mengelola kekayaan, FinanceIQ membawa kecerdasan finansial kelas institusi langsung ke genggaman Anda dengan antarmuka yang modern dan memanjakan mata.

## ✨ Fitur Unggulan

- **📈 Market Analyst Agent**: Stress test multi-skenario (market crash, hiperinflasi, PHK) berbasis LLM.
- **🛡️ Risk Profiler Agent**: Koreksi bias persepsi risiko user berdasarkan DTI, savings rate, dan emergency fund — dengan LLM *reasoning*.
- **💼 Wealth Manager Agent**: Alokasi portofolio + proyeksi *compounding* 10 tahun + rekomendasi instrumen spesifik (RDPU, SBN, Index Fund, Crypto).
- **💬 Chatbot Literacy Agent**: Konsultasi finansial personal berbasis LLM yang sudah memiliki konteks seluruh hasil analisis.
- **📊 Market Data Real-time**: Data harga saham IDX, reksa dana, SBN, dan kripto dari backend FastAPI (via yfinance).
- **🎨 UI/UX Premium**: Dark mode, glassmorphism, Framer Motion, responsive — dibangun dengan Next.js 16 + React 19.

## 🚀 Mulai Menjalankan Proyek

FinanceIQ terbagi menjadi dua bagian: **Frontend** (Next.js) dan **Backend** (FastAPI).

### 💻 Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Aplikasi web akan berjalan di `http://localhost:3000`.

> ✅ Frontend **bisa berjalan mandiri** tanpa backend. Semua agen menggunakan LLM via **9Router** (`localhost:20128`) dan menyediakan fallback rule-based jika LLM tidak tersedia.

### ⚙️ Backend (FastAPI / Python)
```bash
cd backend
python -m venv venv
# Aktifkan virtual environment (Windows): .\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
API server akan berjalan di `http://localhost:8000`.

> ⚠️ Gunakan **Python 3.10–3.12** (hindari 3.13 karena ada isu kompatibilitas pydantic).

### 🔑 Konfigurasi API Key
Edit file `backend/.env`:
```env
NINEROUTER_URL=http://localhost:20128
NINEROUTER_KEY=your-api-key
```

## 🛠️ Teknologi yang Digunakan

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, TailwindCSS 4, Framer Motion, Recharts |
| **Backend** | Python, FastAPI, LangGraph, Pydantic, yfinance |
| **AI / LLM** | 9Router Gateway (OpenAI-compatible) — model: Claude, DeepSeek |
| **Arsitektur** | Multi-Agent Clean Architecture: 3 Frontend Agents + 7 Backend Agents |
| **Memori** | localStorage (AgentMemoryStore) + React Context |

---
<div align="center">
  <i>Dibangun untuk masa depan finansial yang lebih cerdas 🚀</i>
</div>
