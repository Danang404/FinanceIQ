"use client";

import { motion, useScroll, useTransform, Variants } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// --- Framer Motion Variants ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", bounce: 0.2 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

// --- Custom Glow Card Component ---
function GlowCard({ children, title, icon, color }: { children: React.ReactNode, title: string, icon: string, color: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div 
      variants={fadeUp}
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className="relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/10 p-8 cursor-pointer transition-colors hover:border-white/20 group"
    >
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${color}20, transparent 40%)`
        }}
      />
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${color === '#4B9FE3' ? 'bg-blue-500/10 text-blue-400' : color === '#60ECA8' ? 'bg-primary/20 text-primary shadow-[0_0_20px_rgba(96,236,168,0.2)]' : 'bg-purple-500/10 text-purple-400'}`}>
          <span className="material-symbols-outlined text-[28px]">{icon}</span>
        </div>
        <h3 className="text-white font-bold text-2xl mb-4 font-display group-hover:text-white transition-colors">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#030303] text-white selection:bg-primary/30 overflow-hidden font-inter">
      
      {/* Background Animated Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div style={{ y }} className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[150px] mix-blend-screen opacity-50 animate-[pulse_8s_ease-in-out_infinite]"></motion.div>
        <motion.div style={{ y: useTransform(scrollY, [0, 1000], [0, -200]) }} className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-teal-500/10 blur-[150px] mix-blend-screen opacity-50"></motion.div>
      </div>
      
      {/* 1. Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#030303]/90 backdrop-blur-xl border-b border-white/5 py-4 shadow-2xl" : "bg-transparent py-6"}`}>
        <div className="max-w-[1200px] mx-auto w-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(96,236,168,0.2)] group-hover:shadow-[0_0_30px_rgba(96,236,168,0.4)] transition-all">
              <span className="material-symbols-outlined text-[#052e16] text-[22px] font-bold">account_balance</span>
            </div>
            <span className="font-display text-2xl font-extrabold tracking-tight text-white">FinanceIQ</span>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <a href="#arsitektur" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors tracking-wide">Arsitektur</a>
            <a href="#workflow" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors tracking-wide">Workflow</a>
            <a href="#faq" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors tracking-wide">FAQ</a>
          </div>
          <Link href="/login">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white text-black hover:bg-primary hover:text-[#052e16] px-6 py-2.5 rounded-full text-sm font-bold transition-colors shadow-lg">
              Masuk Sistem
            </motion.button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 w-full pt-32">
        
        {/* 2. Interactive Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[85vh] px-6 max-w-[1000px] mx-auto text-center relative">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col items-center z-10">
            
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold mb-10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Prototipe Multi-Agent AI v1.0
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-[56px] sm:text-[72px] md:text-[96px] font-extrabold tracking-tighter leading-[1.02] mb-8 font-display">
              Masa Depan <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-teal-400 drop-shadow-sm">
                Analisis Finansial
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              Sistem pendukung keputusan yang mendistribusikan beban kognitif finansial ke dalam <span className="text-white font-medium border-b border-primary/50 pb-0.5">jaringan Agen AI terdesentralisasi</span> untuk rekomendasi investasi absolut.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link href="/login">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-xl bg-white text-black font-semibold text-lg hover:bg-gray-100 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] flex items-center justify-center mx-auto group gap-2"
                >
                  Mulai Eksplorasi
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </motion.button>
              </Link>
              <a href="#arsitektur" className="w-full sm:w-auto">
                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 text-white px-10 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2">
                  Lihat Arsitektur
                </motion.button>
              </a>
            </motion.div>
          </motion.div>
          
        </section>

        {/* 3. Tech Stack Marquee */}
        <section className="py-12 border-y border-white/5 bg-[#0a0a0a]/50 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-[#030303] to-transparent z-10"></div>
          <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-[#030303] to-transparent z-10"></div>
          <div className="flex w-[200vw] animate-[marquee_20s_linear_infinite] items-center opacity-60">
            {/* Double the content for smooth infinite scroll */}
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-around items-center w-[100vw]">
                <span className="text-xl font-bold font-display flex items-center gap-3 whitespace-nowrap"><span className="material-symbols-outlined text-3xl">code</span> Next.js 14</span>
                <span className="text-xl font-bold font-display flex items-center gap-3 whitespace-nowrap"><span className="material-symbols-outlined text-3xl">api</span> FastAPI</span>
                <span className="text-xl font-bold font-display flex items-center gap-3 whitespace-nowrap"><span className="material-symbols-outlined text-3xl">memory</span> OpenAI LLM</span>
                <span className="text-xl font-bold font-display flex items-center gap-3 whitespace-nowrap"><span className="material-symbols-outlined text-3xl">lan</span> LangChain</span>
                <span className="text-xl font-bold font-display flex items-center gap-3 whitespace-nowrap"><span className="material-symbols-outlined text-3xl">brush</span> TailwindCSS</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Agent Architecture (Features with Spotlight) */}
        <section id="arsitektur" className="py-32 px-6 max-w-[1200px] mx-auto">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <motion.div variants={fadeUp} className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 font-display">Arsitektur Agen AI</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">Tiga pilar kecerdasan spesifik yang berkolaborasi dalam satu lingkungan terorkestrasi untuk menghilangkan halusinasi dan memastikan akurasi matematis.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlowCard title="Risk Profiler Agent" icon="health_and_safety" color="#4B9FE3">
                Secara algoritmik menganalisis rasio utang (Debt-to-Income) dan arus kas bebas untuk memetakan skor toleransi risiko secara objektif, tanpa campur tangan emosi manusia.
              </GlowCard>
              <GlowCard title="Wealth Manager Agent" icon="account_balance" color="#60ECA8">
                Bertindak sebagai penentu kebijakan. Mendistribusikan instrumen (Pasar Uang, Obligasi, Saham) berdasarkan output matematis yang ketat dari Risk Profiler.
              </GlowCard>
              <GlowCard title="Literacy Agent" icon="forum" color="#A855F7">
                Menerjemahkan bahasa mesin menjadi narasi kualitatif. Bertanggung jawab atas sesi tanya-jawab interaktif dan memberikan pemahaman logis atas setiap keputusan.
              </GlowCard>
            </div>
          </motion.div>
        </section>

        {/* 5. System Workflow */}
        <section id="workflow" className="py-32 px-6 max-w-[1200px] mx-auto text-center border-t border-white/5 relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold mb-24 font-display">Simulasi Eksekusi Berantai</motion.h2>
            
            <div className="flex flex-col md:flex-row justify-center gap-12 relative max-w-5xl mx-auto">
              <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-[2px] bg-white/10 z-0">
                <motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }} className="h-full bg-gradient-to-r from-primary to-teal-500 shadow-[0_0_20px_rgba(96,236,168,0.8)]"></motion.div>
              </div>

              {[
                { step: "01", title: "Ekstraksi Parameter", desc: "Data masuk dari form diproses menjadi vektor konteks mentah." },
                { step: "02", title: "Orkestrasi Sekuensial", desc: "Data mengalir dari Agen Risiko ke Agen Wealth melalui pipeline LangChain." },
                { step: "03", title: "Human Interface", desc: "Agen Literasi mencetak output dan membuka sesi webhook tanya-jawab." }
              ].map((item, idx) => (
                <motion.div key={idx} variants={fadeUp} className="flex-1 flex flex-col items-center relative z-10">
                  <div className="w-24 h-24 rounded-3xl bg-[#030303] border-2 border-primary flex items-center justify-center font-display font-black text-3xl text-primary mb-8 shadow-[0_0_30px_rgba(96,236,168,0.2)]">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-display">{item.title}</h3>
                  <p className="text-base text-gray-400 leading-relaxed max-w-[250px] mx-auto">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 6. Technical FAQ */}
        <section id="faq" className="py-32 px-6 max-w-[800px] mx-auto border-t border-white/5 relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 font-display">FAQ Implementasi</h2>
              <p className="text-gray-400 text-lg">Parameter desain dan batasan teknis dari prototipe.</p>
            </motion.div>
            
            <div className="space-y-4">
              {[
                { q: "Mengapa menggunakan pendekatan tekstual alih-alih dasbor grafik (Chart)?", a: "Fokus utama riset ini adalah mendemonstrasikan kapabilitas Multi-Agent dalam memberikan penalaran analitis (reasoning) dan edukasi dua arah, dibandingkan sekadar visualisasi data numerik statis yang tidak mampu menjelaskan 'mengapa'." },
                { q: "Bagaimana cara antar-agen ini saling mentransfer konteks?", a: "Sistem ini memanfaatkan framework orkestrasi di backend. Output terstruktur dari agen pertama ditangkap, dirangkum, dan disuntikkan (injected) sebagai variabel konteks (prompt) utama ke agen berikutnya, mencegah hilangnya state." },
                { q: "Apakah saran dari AI ini dapat dijadikan rujukan investasi riil?", a: "TIDAK. Sistem ini murni ditujukan sebagai purwarupa (prototype) eksperimental untuk tesis/proyek akademik. Algoritma didasarkan pada logika konservatif dasar, dan TIDAK disetujui oleh lembaga keuangan mana pun." }
              ].map((faq, idx) => (
                <motion.div key={idx} variants={fadeUp} className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                  <button onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} className="w-full text-left px-8 py-6 font-bold flex justify-between items-center outline-none">
                    <span className="text-lg tracking-wide">{faq.q}</span>
                    <span className="material-symbols-outlined text-primary/50 text-2xl">{activeFaq === idx ? 'remove' : 'add'}</span>
                  </button>
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: activeFaq === idx ? "auto" : 0, opacity: activeFaq === idx ? 1 : 0 }} className="overflow-hidden">
                    <div className="px-8 pb-6 pt-2 text-gray-400 text-base leading-relaxed border-t border-white/5 mt-2">
                      {faq.a}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 7. Footer */}
        <footer className="border-t border-white/10 bg-[#020202] pt-24 pb-12">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
              
              <div className="md:col-span-4">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#052e16] text-[20px] font-bold">account_balance</span>
                  </div>
                  <span className="font-display text-2xl font-extrabold text-white">FinanceIQ</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
                  Implementasi konseptual arsitektur agen terdistribusi untuk otomasi analisis kelayakan dan peningkatan literasi keuangan personal.
                </p>
                <Link href="/login">
                  <button className="bg-white text-black hover:bg-primary hover:text-[#052e16] px-6 py-3 rounded-full text-sm font-bold transition-all">
                    Buka Aplikasi
                  </button>
                </Link>
              </div>

              <div className="md:col-span-2 md:col-start-6">
                <h4 className="text-white font-bold mb-6 tracking-widest text-xs uppercase opacity-70">Arsitektur</h4>
                <ul className="space-y-4">
                  <li><a href="#arsitektur" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Risk Profiler</a></li>
                  <li><a href="#arsitektur" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Wealth Manager</a></li>
                  <li><a href="#arsitektur" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Literacy Interface</a></li>
                </ul>
              </div>

              <div className="md:col-span-2">
                <h4 className="text-white font-bold mb-6 tracking-widest text-xs uppercase opacity-70">Teknologi</h4>
                <ul className="space-y-4">
                  <li><span className="text-gray-400 text-sm font-medium">Next.js 14</span></li>
                  <li><span className="text-gray-400 text-sm font-medium">FastAPI</span></li>
                  <li><span className="text-gray-400 text-sm font-medium">LangChain & OpenAI</span></li>
                  <li><span className="text-gray-400 text-sm font-medium">Framer Motion</span></li>
                </ul>
              </div>

              <div className="md:col-span-3">
                <h4 className="text-white font-bold mb-6 tracking-widest text-xs uppercase opacity-70">Penafian</h4>
                <p className="text-gray-400 text-sm leading-relaxed text-justify p-5 bg-white/5 rounded-2xl border border-white/10">
                  Platform ini dibangun murni sebagai purwarupa (prototype) akademis. Bukan merupakan aplikasi komersial, dan seluruh analisis didasarkan pada logika eksperimental yang tidak dijamin kebenarannya secara hukum.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-gray-500 text-sm font-medium">
                &copy; {new Date().getFullYear()} FinanceIQ Project. Didesain untuk eksplorasi AI.
              </p>
              <div className="flex gap-6 items-center">
                <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">code</span> Repositori GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
