# Product Requirements Document (PRD)
# FinanceIQ — Asisten Keuangan Personal Berbasis Multi-Agent AI

**Versi:** 2.0 (Refactor)
**Status:** Draft
**Proyek:** Tugas Akhir — Program Studi Informatika, Universitas AMIKOM Yogyakarta
**Disusun oleh:** Danang Yudo Prakosa (23.11.5841)

---

## 1. Latar Belakang

Versi awal FinanceIQ dirancang sebagai sistem multi-agent yang menganalisis kondisi keuangan pengguna dan memberikan rekomendasi alokasi investasi berdasarkan profil risiko. Sistem ini efektif untuk pengguna yang sudah familiar dengan istilah dan konsep dasar investasi, namun mengasumsikan bekal literasi keuangan yang sebenarnya tidak dimiliki mayoritas calon pengguna di Indonesia.

Refactor ini mengubah orientasi produk dari **"mesin analisis dan skoring"** menjadi **"asisten yang mengajar sambil bertanya"**. Perubahan ini dipicu oleh temuan bahwa target pengguna riil sistem ini seringkali belum tahu perbedaan menabung dan berinvestasi, belum punya dana darurat, dan belum punya target nominal atau horizon waktu yang jelas — sehingga sistem versi lama yang mewajibkan input tersebut di awal berpotensi membuat pengguna berhenti sebelum sempat mendapat manfaat.

## 2. Tujuan Produk

1. Menyediakan asisten keuangan personal yang dapat diakses pengguna dengan literasi keuangan apa pun, termasuk yang belum pernah berinvestasi sama sekali.
2. Mendemonstrasikan arsitektur multi-agent AI yang melakukan *reasoning* bertingkat — bukan sekadar templat respons — sebagai kontribusi akademis skripsi.
3. Menghasilkan rekomendasi alokasi investasi yang **mempertimbangkan trade-off non-matematis** (kenyamanan psikologis dan pembentukan kebiasaan) di samping optimalitas return, sebagai pembeda dari kalkulator investasi konvensional.
4. Menjaga seluruh infrastruktur berjalan di **tingkat gratis (free tier)** tanpa biaya operasional, agar dapat didemonstrasikan dan dipertahankan pasca-sidang tanpa beban biaya.

## 3. Masalah yang Diselesaikan

| Masalah | Kondisi saat ini | Solusi FinanceIQ |
|---|---|---|
| Kalkulator/robo-advisor generik memaksa pengguna mengisi profil risiko dengan istilah teknis (volatilitas, alokasi aset) | Pengguna awam bingung atau asal isi form | Financial Literacy Agent mendeteksi level pemahaman lebih dulu, lalu menyesuaikan bahasa seluruh sesi |
| Rekomendasi investasi sering langsung optimal secara matematis tanpa mempertimbangkan kesiapan psikologis pemula | Pengguna panik dan menjual rugi saat nilai turun di awal | Risk Profiling Agent secara eksplisit memprioritaskan kenyamanan psikologis untuk pemula |
| Sistem menuntut target nominal/horizon di awal | Pengguna yang belum tahu targetnya berhenti mengisi form | Sistem tetap dapat berjalan tanpa target spesifik |
| Hasil rekomendasi berupa angka/tabel tanpa penjelasan | Pengguna tidak paham kenapa direkomendasikan sesuatu, tidak percaya sistem | Setiap keputusan disertai analogi dan penjelasan istilah saat pertama muncul |

## 4. Target Pengguna

**Persona utama — "Rani, 24 tahun, karyawan baru"**
Baru bekerja 6 bulan, penghasilan sekitar Rp 5–7 juta/bulan, belum punya tabungan besar, ingin mulai berinvestasi tapi takut salah langkah dan belum tahu istilah-istilah dasar. Mencari sesuatu yang terasa seperti "dipandu", bukan "dites".

**Persona sekunder — "Bimo, 29 tahun, sudah pernah investasi"**
Sudah punya reksadana tapi ala kadarnya, ingin evaluasi ulang alokasi dan dana darurat. Sistem harus tetap bisa melayani pengguna dengan literasi lebih tinggi tanpa terasa terlalu "menggurui".

## 5. Ruang Lingkup Produk

### 5.1 Termasuk dalam lingkup
- Alur onboarding percakapan (chat-based) yang menentukan level literasi pengguna.
- 6 agent AI yang bekerja secara berurutan/bercabang melalui orkestrasi LangGraph.
- Rekomendasi alokasi portofolio ke instrumen umum di Indonesia (reksadana pasar uang, pendapatan tetap, campuran, saham) sesuai profil dan tahap literasi.
- Roadmap belajar bertahap (bukan hanya rekomendasi satu kali).
- Glosarium istilah yang terkumpul otomatis dari istilah yang telah dijelaskan ke pengguna.
- Disclaimer edukasi non-lisensi keuangan pada setiap output.

### 5.2 Di luar lingkup
- Eksekusi transaksi pembelian instrumen investasi riil (produk ini bersifat edukasi/rekomendasi, bukan platform transaksi).
- Nasihat keuangan berlisensi resmi (bukan pengganti perencana keuangan bersertifikat).
- Dukungan multi-mata uang / instrumen luar negeri pada versi ini.

## 6. Gambaran Fitur per Agent

| # | Agent | Fungsi utama | Output kunci |
|---|---|---|---|
| 1 | Financial Literacy Agent | Mendeteksi level pemahaman pengguna di awal sesi, menyusun konfigurasi bahasa untuk seluruh agent lain | `literacy_level`, `communication_style` |
| 2 | Wealth Management Agent | Menilai kesehatan keuangan dasar (rasio dana darurat, pengeluaran vs pendapatan) | Status dana darurat + penjelasan istilah terkait |
| 3 | Risk Profiling Agent | Mengukur toleransi risiko lewat analogi konkret, bukan kuesioner teknis | Kategori & skor risiko + catatan psikologis |
| 4 | Market Intelligence Agent | Mengumpulkan dan menerjemahkan kondisi pasar terkini ke bahasa awam | Ringkasan kondisi pasar dalam bahasa sehari-hari |
| 5 | Investment Strategist Agent | Menyusun alokasi portofolio berdasarkan hasil agent lain, dengan analogi per instrumen | Alokasi + alasan tiap instrumen |
| 6 | Communication & Education Agent | Menyatukan seluruh hasil menjadi narasi akhir, roadmap belajar, dan glosarium | Output final + roadmap + daftar istilah |

Agent tambahan dari sistem lama: **Cross-Validation** kini menjadi *node* mediasi di dalam graph (bukan agent independen), bertugas menyelesaikan konflik antar rekomendasi (misalnya dana darurat belum terpenuhi vs keinginan mulai investasi).

## 7. Kebutuhan Non-Fungsional Tingkat Produk

- **Biaya:** seluruh layanan (hosting, database, cache, LLM gateway) wajib berjalan di tingkat gratis.
- **Bahasa:** antarmuka dan seluruh komunikasi agent berbahasa Indonesia.
- **Latensi:** respons tiap agent idealnya di bawah beberapa detik agar alur percakapan tidak terasa patah, mengingat batasan free tier pada compute.
- **Ketersediaan:** sistem dapat didemonstrasikan secara langsung (live demo) saat sidang tanpa downtime akibat rate-limit gratis.

## 8. Metrik Keberhasilan

1. Pengguna awam (tanpa pengalaman investasi) dapat menyelesaikan onboarding penuh tanpa berhenti di tengah jalan.
2. Setiap istilah teknis yang muncul di sesi disertai penjelasan (tidak ada istilah "lolos" tanpa definisi).
3. Rekomendasi akhir konsisten dengan prinsip: kenyamanan psikologis pemula diprioritaskan di atas optimalitas matematis murni, dan hal ini dapat ditunjukkan lewat *reasoning* eksplisit di output setiap agent.
4. Sistem dapat didemonstrasikan penuh tanpa biaya infrastruktur tambahan.

## 9. Batasan & Asumsi

- Seluruh komponen agentic AI wajib menggunakan **9Router** sebagai LLM gateway, dengan fallback ke Kiro AI, iFlow, atau MiMo Code Free/OpenCode Free bila 9Router tidak tersedia.
- Data historis pasar dan produk investasi bersifat indikatif untuk tujuan edukasi, bukan data real-time bersertifikasi resmi OJK/BEI.
- Sistem tidak menyimpan data finansial sensitif dalam bentuk yang dapat diidentifikasi secara personal di luar kebutuhan sesi.

## 10. Dokumen Terkait

- Software Requirements Specification (SRS) — `02_SRS_FinanceIQ.md`
- Software Architecture Document (SAD) — `03_SAD_FinanceIQ.md`
- Blueprint Refactor — `04_Blueprint_Refactor_FinanceIQ.md`
