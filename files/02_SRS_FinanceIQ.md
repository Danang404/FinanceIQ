# Software Requirements Specification (SRS)
# FinanceIQ — Sistem Multi-Agent AI untuk Asisten Keuangan Personal

**Versi:** 2.0 (Refactor)
**Referensi:** PRD FinanceIQ v2.0
**Disusun oleh:** Danang Yudo Prakosa (23.11.5841)

---

## 1. Pendahuluan

### 1.1 Tujuan
Dokumen ini merinci kebutuhan fungsional dan non-fungsional sistem FinanceIQ hasil refactor, dengan penambahan Financial Literacy Agent dan penyesuaian seluruh agent agar dapat melayani pengguna dengan literasi keuangan rendah hingga tinggi dalam satu sistem yang sama.

### 1.2 Lingkup
Sistem berbentuk aplikasi web (Next.js) dengan backend agentic (FastAPI + LangGraph) yang mengorkestrasi 6 agent AI, disimpan di Supabase (data pengguna & sesi) dan Redis Upstash (state sementara/cache), seluruhnya berjalan pada tingkat gratis dengan 9Router sebagai LLM gateway.

### 1.3 Definisi & Istilah

| Istilah | Definisi |
|---|---|
| Agent | Unit pemrosesan AI dengan tanggung jawab sempit dan spesifik dalam graph LangGraph |
| Node | Representasi satu agent atau satu langkah mediasi di dalam state graph |
| State | Objek data terstruktur (JSON) yang mengalir dan diperbarui antar node |
| Literacy level | Klasifikasi tingkat pemahaman keuangan pengguna yang menentukan gaya bahasa seluruh sesi |
| Cross-validation | Proses mediasi otomatis saat rekomendasi antar-agent saling bertentangan |

## 2. Kebutuhan Fungsional

### FR-1 — Financial Literacy Agent
- **FR-1.1** Sistem harus menyajikan pertanyaan pembuka untuk mendeteksi pengalaman investasi pengguna sebelum agent lain dijalankan.
- **FR-1.2** Sistem harus mengklasifikasikan pengguna ke salah satu `literacy_level` (mis. `beginner_first_time`, `intermediate`, `experienced`) berdasarkan jawaban bebas (free text), bukan pilihan ganda tertutup.
- **FR-1.3** Konfigurasi `literacy_level` dan `communication_style` yang dihasilkan harus tersedia sebagai bagian dari *shared state* yang dapat diakses oleh seluruh node berikutnya.
- **FR-1.4** Jika level tidak dapat disimpulkan dengan yakin dari jawaban pengguna, sistem harus mengajukan satu pertanyaan klarifikasi tambahan, bukan menebak.

### FR-2 — Pengumpulan Data Dasar
- **FR-2.1** Sistem harus mengumpulkan data pendapatan bulanan, estimasi pengeluaran bulanan, tabungan saat ini, dan tujuan investasi pengguna.
- **FR-2.2** Sistem harus dapat melanjutkan proses meskipun target nominal atau horizon waktu investasi belum diisi/belum diketahui pengguna.
- **FR-2.3** Input data dasar tidak boleh disajikan sebagai form panjang sekaligus; dikumpulkan secara bertahap dalam alur percakapan.

### FR-3 — Wealth Management Agent
- **FR-3.1** Sistem harus menghitung rasio tabungan saat ini terhadap pengeluaran bulanan untuk menentukan status dana darurat (`Belum ada` / `Sebagian` / `Terpenuhi`).
- **FR-3.2** Jika `literacy_level = beginner_first_time`, sistem harus menyertakan penjelasan istilah "dana darurat" saat pertama kali muncul di sesi.
- **FR-3.3** Sistem harus memberikan rekomendasi persentase alokasi tabungan ke dana darurat sebelum ke investasi, jika status dana darurat belum terpenuhi.

### FR-4 — Risk Profiling Agent
- **FR-4.1** Untuk `literacy_level = beginner_first_time`, sistem harus menggunakan pertanyaan berbasis analogi konkret (contoh: skenario nilai investasi turun-naik), bukan istilah teknis seperti "volatilitas".
- **FR-4.2** Sistem harus menghasilkan `kategori` risiko, `skor` numerik, dan `reasoning` naratif yang menjelaskan alasan kategori tersebut.
- **FR-4.3** Sistem harus menyertakan `catatan_untuk_agent_lain` yang secara eksplisit menyatakan prioritas antara kenyamanan psikologis dan optimalitas return, untuk dikonsumsi Investment Strategist Agent.
- **FR-4.4** Skor risiko harus dihitung berdasarkan rubrik objektif yang konsisten, bukan dipengaruhi oleh nada/kata-kata subjektif pengguna semata.

### FR-5 — Market Intelligence Agent
- **FR-5.1** Sistem harus mengambil data kondisi pasar terkini (instrumen reksadana/saham yang relevan) sebagai konteks tambahan.
- **FR-5.2** Output teknis dari agent ini wajib diterjemahkan ke bahasa sehari-hari sebelum digunakan oleh agent lain, sesuai `communication_style` yang aktif.

### FR-6 — Cross-Validation (Node Mediasi)
- **FR-6.1** Sistem harus mendeteksi konflik antar rekomendasi agent (misalnya kebutuhan dana darurat vs keinginan mulai investasi besar).
- **FR-6.2** Sistem harus menghasilkan `investable_amount_final` dan `mediation_reasoning` yang menjelaskan cara konflik diselesaikan, dalam bahasa yang sesuai `communication_style`.
- **FR-6.3** Mediasi tidak boleh sepenuhnya menahan pengguna untuk mulai berinvestasi; jika sesuai prinsip produk, tetap mengizinkan nominal kecil sambil membangun dana darurat.

### FR-7 — Investment Strategist Agent
- **FR-7.1** Sistem harus menyusun alokasi portofolio berdasarkan kategori risiko, dana yang tersedia untuk investasi, dan level literasi pengguna.
- **FR-7.2** Setiap instrumen dalam alokasi harus disertai `analogi` dan `kenapa_cocok` bila `literacy_level = beginner_first_time`.
- **FR-7.3** Untuk pengguna pemula, sistem tidak boleh merekomendasikan instrumen berisiko tinggi (mis. saham individu) pada tahap pertama, meskipun skor risiko matematis mengizinkan, kecuali pengguna secara eksplisit meminta.

### FR-8 — Communication & Education Agent
- **FR-8.1** Sistem harus menghasilkan narasi ringkasan keputusan akhir yang merangkum seluruh hasil agent sebelumnya.
- **FR-8.2** Sistem harus menghasilkan `roadmap_belajar` bertahap (minimal 3 fase) yang menunjukkan progres jangka pendek-menengah-panjang.
- **FR-8.3** Sistem harus mengumpulkan seluruh istilah yang telah dijelaskan sepanjang sesi ke dalam `istilah_yang_baru_dipelajari` sebagai glosarium.
- **FR-8.4** Setiap output final wajib menyertakan disclaimer risiko investasi dan status non-lisensi.

### FR-9 — Orkestrasi & State
- **FR-9.1** Seluruh agent harus dijalankan melalui LangGraph sebagai state graph, dengan setiap node membaca dan memperbarui shared state, bukan riwayat percakapan mentah.
- **FR-9.2** Sistem harus mampu menangani percabangan (branching) — misalnya melewati node tertentu bila data yang relevan sudah cukup jelas dari sesi sebelumnya.

## 3. Kebutuhan Non-Fungsional

| ID | Kategori | Deskripsi |
|---|---|---|
| NFR-1 | Biaya | Seluruh layanan (Vercel, Render, Supabase, Redis Upstash, 9Router & fallback) wajib tetap dalam batas tingkat gratis masing-masing penyedia. |
| NFR-2 | Kinerja | Waktu respons per node agent ditargetkan tidak lebih dari beberapa detik pada kondisi normal, mengingat keterbatasan compute tier gratis. |
| NFR-3 | Keandalan | Sistem harus memiliki mekanisme fallback LLM gateway (9Router → Kiro AI → iFlow → MiMo Code Free/OpenCode Free) agar demo tidak gagal total saat satu penyedia rate-limit. |
| NFR-4 | Keamanan | Data keuangan pengguna disimpan dengan RLS (Row Level Security) di Supabase; tidak ada kredensial rahasia yang terekspos di sisi klien. |
| NFR-5 | Kegunaan (usability) | Antarmuka harus dapat dipahami pengguna tanpa latar belakang keuangan, divalidasi lewat alur bahasa berbasis analogi. |
| NFR-6 | Portabilitas bahasa | Seluruh teks antarmuka dan output agent berbahasa Indonesia, dengan istilah asing dijelaskan saat pertama muncul. |
| NFR-7 | Observabilitas | Setiap transisi antar node harus dapat dilacak (logging state) untuk kebutuhan debugging dan evaluasi akademis. |

## 4. Kebutuhan Data

| Entitas | Atribut kunci | Sumber |
|---|---|---|
| Sesi pengguna | `literacy_level`, `communication_style`, riwayat state per node | Dihasilkan sistem, disimpan Supabase |
| Data dasar keuangan | pendapatan, pengeluaran, tabungan, tujuan | Input pengguna |
| Profil risiko | kategori, skor, reasoning | Dihasilkan Risk Profiling Agent |
| Alokasi portofolio | daftar instrumen, persentase, nominal, analogi | Dihasilkan Investment Strategist Agent |
| Glosarium sesi | daftar istilah + penjelasan singkat | Diakumulasi sepanjang sesi |

## 5. Kebutuhan Antarmuka

- **Antarmuka pengguna:** aplikasi web responsif (mobile-first), berbasis alur percakapan (chat) dengan kartu hasil terstruktur untuk output tiap agent (bukan teks JSON mentah).
- **Antarmuka API internal:** endpoint FastAPI yang menerima input sesi dan mengembalikan state terbaru dari LangGraph per langkah.
- **Antarmuka LLM gateway:** seluruh pemanggilan model melalui 9Router dengan skema fallback yang dikonfigurasi di sisi backend, transparan bagi frontend.

## 6. Kebutuhan Validasi Akademis

- Setiap agent harus dapat menunjukkan *reasoning* eksplisit (field `reasoning` di output), bukan hanya hasil akhir, agar dapat dievaluasi sebagai kontribusi ilmiah terkait *explainable multi-agent decision making*.
- Dokumentasi trade-off non-matematis (prioritas psikologis vs return) harus dapat ditelusuri di log state untuk keperluan pembahasan bab hasil dan analisis skripsi.
