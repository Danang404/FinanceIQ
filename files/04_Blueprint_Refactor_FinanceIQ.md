# Blueprint Refactor
# FinanceIQ — Dari Versi Investor Umum ke Versi Multi-Agent Berorientasi Awam

**Versi:** 1.0
**Referensi:** PRD v2.0, SRS v2.0, SAD v2.0
**Disusun oleh:** Danang Yudo Prakosa (23.11.5841)

---

## 1. Tujuan Blueprint
Menjadi panduan langkah-demi-langkah untuk merefactor project FinanceIQ yang sudah ada (5-agent, berorientasi investor umum) menjadi versi baru (6-agent + node mediasi, berorientasi awam), tanpa membangun ulang dari nol dan tetap dalam batas free tier.

## 2. Perbandingan Ringkas Versi Lama vs Baru

| Aspek | Versi lama | Versi baru |
|---|---|---|
| Jumlah agent | 5 | 6 (tambahan: Financial Literacy Agent) |
| Cross-Validation | Agent terpisah berbasis LLM | Node mediasi rule-based di dalam graph |
| Bahasa output | Istilah teknis standar industri | Analogi + penjelasan istilah saat pertama muncul |
| Syarat input awal | Target nominal & horizon wajib | Boleh kosong, sistem tetap jalan |
| Prioritas rekomendasi | Optimalisasi return sesuai skor risiko | Kenyamanan psikologis dulu untuk pemula, baru optimalisasi |
| Output akhir | Alokasi + proyeksi angka | Alokasi + roadmap belajar bertahap + glosarium |
| UI | Form-based per tahap | Chat-based, satu alur percakapan berkelanjutan |

## 3. Prinsip Refactor

1. **Tidak mengganti stack.** Next.js 14 + FastAPI/LangGraph + Supabase + Redis Upstash + 9Router tetap dipertahankan — perubahan di level graph/agent dan UI, bukan infrastruktur.
2. **Tambah, jangan hapus dulu.** Agent lama tetap ada fungsinya, hanya ditambah lapisan "penerjemahan bahasa" dan satu agent baru di depan graph.
3. **Migrasi bertahap per fase**, agar setiap fase dapat diuji secara independen sebelum lanjut, dan risiko kerusakan sistem yang sudah berjalan dapat diminimalkan.

## 4. Fase Refactor

### Fase 0 — Migrasi 9Router dari Local ke Hosting
- Deploy 9Router ke Railway (tingkat gratis) menggunakan template deploy yang tersedia, ganti dari sebelumnya dijalankan lokal di `localhost:20128`.
- Set `INITIAL_PASSWORD` kuat, aktifkan `REQUIRE_API_KEY=true` karena instance ini akan terekspos ke internet.
- Perbarui environment variable backend Render: `NINEROUTER_URL` dan `NINEROUTER_KEY` menunjuk ke URL Railway, bukan lagi `localhost`.
- Uji konektivitas backend → 9Router hosted dengan health-check (`/api/health`) sebelum lanjut ke fase berikutnya, karena seluruh node agent di Fase 1–8 bergantung pada gateway ini aktif.
- **Keluaran fase:** endpoint 9Router publik aktif dan dapat diakses backend Render, terverifikasi lewat pemanggilan uji `/v1/models`.

### Fase 1 — Audit & Pemetaan Graph Lama
- Inventarisasi seluruh node LangGraph yang sudah ada beserta skema state (Pydantic model) masing-masing.
- Petakan field state mana yang akan tetap dipakai apa adanya, mana yang perlu diperluas (mis. menambah field `analogi`, `penjelasan_istilah` di output Wealth Management dan Investment Strategist).
- **Keluaran fase:** dokumen pemetaan `state_lama → state_baru` per node.

### Fase 2 — Implementasi Financial Literacy Agent (Node Baru)
- Tambahkan node baru sebagai entry point graph, sebelum node pengumpulan data dasar.
- Definisikan skema output: `literacy_level`, `communication_style`, dan flag `istilah_perlu_dijelaskan`.
- Tambahkan edge kondisional (conditional edge) di LangGraph: output node ini menentukan parameter yang dibaca oleh seluruh node berikutnya, bukan mengubah struktur graph itu sendiri.
- **Keluaran fase:** node baru lolos pengujian isolasi (unit test) dengan berbagai simulasi jawaban pengguna (pemula total, menengah, berpengalaman).

### Fase 3 — Adaptasi Prompt & Output Node Existing
- Perbarui prompt system tiap agent (Wealth Management, Risk Profiling, Market Intelligence, Investment Strategist, Communication & Education) agar:
  - Membaca `communication_style` dari state di awal eksekusi.
  - Menyisipkan penjelasan istilah teknis saat field terkait pertama kali muncul, jika `istilah_perlu_dijelaskan = true`.
  - Risk Profiling Agent menggunakan bank pertanyaan berbasis analogi sebagai alternatif dari kuesioner teknis lama, dipilih berdasarkan `literacy_level`.
- **Keluaran fase:** seluruh node existing menghasilkan output yang secara terukur berbeda gaya bahasanya antara mode `beginner_first_time` dan mode lama (`experienced`), diverifikasi lewat pengujian A/B prompt.

### Fase 4 — Refactor Node Cross-Validation
- Ubah dari pemanggilan LLM penuh menjadi kombinasi rule-based (deteksi konflik dana darurat vs investasi berdasarkan ambang rasio) dengan lapisan LLM tipis hanya untuk menyusun `catatan_untuk_user` dalam bahasa sesuai `communication_style`.
- Tujuannya menghemat pemanggilan LLM sekaligus membuat logika mediasi lebih deterministik dan mudah diuji.
- **Keluaran fase:** unit test mediasi mencakup skenario dana darurat kosong, sebagian, dan penuh.

### Fase 5 — Investment Strategist: Batasan Instrumen untuk Pemula
- Tambahkan aturan eksplisit: jika `literacy_level = beginner_first_time`, instrumen berisiko tinggi (saham individu, reksadana saham) tidak direkomendasikan pada rekomendasi pertama, kecuali diminta eksplisit oleh pengguna.
- Tambahkan generator `analogi` dan `kenapa_cocok` per instrumen sebagai field wajib baru saat mode pemula aktif.
- **Keluaran fase:** hasil alokasi untuk skenario pemula terverifikasi tidak memasukkan instrumen agresif secara default.

### Fase 6 — Communication & Education Agent: Roadmap & Glosarium
- Tambahkan logika akumulasi seluruh istilah yang telah dijelaskan sepanjang sesi (dikumpulkan dari field `penjelasan_istilah` tiap node) menjadi `istilah_yang_baru_dipelajari` di output akhir.
- Tambahkan struktur `roadmap_belajar` minimal 3 fase (jangka pendek, menengah, lanjutan).
- **Keluaran fase:** output akhir untuk sesi pemula mencakup narasi, roadmap, glosarium, dan disclaimer secara lengkap dan konsisten dengan format pada dokumen konsep.

### Fase 7 — Refactor UI Frontend
- Ubah antarmuka dari form bertahap (versi lama) menjadi satu alur chat berkelanjutan, mengikuti referensi visual dark glassmorphism yang telah dibuat (`financeiq_mockup_alur_pemula.html`).
- Tambahkan komponen kartu hasil terstruktur per tahap (bukan menampilkan JSON mentah ke pengguna).
- Tambahkan indikator mode aktif (`Mode: Pemula` / `Mode: Berpengalaman`) yang persisten di header sesi.
- **Keluaran fase:** prototipe frontend terhubung ke backend hasil Fase 1–6, diuji end-to-end dengan skenario pemula dan berpengalaman.

### Fase 8 — Pengujian End-to-End & Persiapan Sidang
- Uji alur penuh dari Financial Literacy Agent sampai output final untuk kedua persona (Rani/pemula dan Bimo/berpengalaman) sesuai PRD.
- Verifikasi seluruh layanan tetap dalam batas free tier saat pengujian beban ringan (simulasi beberapa sesi bersamaan).
- Verifikasi fallback chain LLM gateway (9Router → Kiro AI → iFlow → MiMo Code Free/OpenCode Free) benar-benar aktif saat provider utama disimulasikan gagal.
- **Keluaran fase:** sistem siap didemonstrasikan langsung saat sidang, dengan dokumentasi hasil pengujian sebagai lampiran skripsi.

## 5. Ringkasan Timeline Indikatif

| Fase | Fokus | Estimasi durasi |
|---|---|---|
| 0 | Migrasi 9Router ke Railway (hosting) | 1–2 hari |
| 1 | Audit & pemetaan | 3–5 hari |
| 2 | Financial Literacy Agent | 5–7 hari |
| 3 | Adaptasi prompt node existing | 7–10 hari |
| 4 | Refactor Cross-Validation | 3–5 hari |
| 5 | Batasan instrumen pemula | 3–5 hari |
| 6 | Roadmap & glosarium | 3–5 hari |
| 7 | Refactor UI frontend | 7–10 hari |
| 8 | Pengujian end-to-end | 5–7 hari |

Total estimasi: sekitar **6–8 minggu kerja**, dapat disesuaikan dengan beban akademis paralel.

## 6. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Rate-limit 9Router saat pengujian intensif | Fallback chain diuji sejak Fase 2, bukan ditunda ke akhir |
| Instance 9Router hosted terekspos ke internet tanpa proteksi memadai | Wajib set password/JWT kuat dan `REQUIRE_API_KEY=true` sejak Fase 0, idealnya ditambah reverse proxy HTTPS |
| Railway free tier punya batas jam/bulan yang bisa habis saat demo | Pantau kuota Railway menjelang sidang, siapkan fallback chain sebagai jaring pengaman kalau 9Router hosted sempat down |
| Prompt yang membengkak karena tambahan instruksi bahasa awam | Batasi instruksi gaya bahasa ke system prompt singkat per node, bukan diulang di setiap giliran |
| Cold start Render free tier mengganggu demo sidang | Tambahkan health-check warm-up terjadwal sebelum sidang dimulai |
| Kompleksitas graph bertambah sulit dijelaskan ke penguji | Gunakan diagram graph (Bagian 4, `03_SAD_FinanceIQ.md`) sebagai materi presentasi visual |

## 7. Referensi Silang
- Kebutuhan detail tiap fase mengacu pada FR-1 s.d. FR-9 di `02_SRS_FinanceIQ.md`.
- Struktur graph dan kontrak state mengacu pada Bagian 4 `03_SAD_FinanceIQ.md`.
- Referensi visual UI: `financeiq_mockup_alur_pemula.html`.
