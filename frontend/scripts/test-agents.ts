import type { RiskProfileResult, WealthAllocationResult, StressTestResult, RawFinancialData } from '../src/services/agents/types';

const API_URL = "http://localhost:20128/v1/chat/completions";
const MODELS = [
  "kr/claude-sonnet-4.5",
  "kr/claude-haiku-4.5",
  "kr/deepseek-3.2"
];

// Helper to pick a random model
function getRandomModel(): string {
  return MODELS[Math.floor(Math.random() * MODELS.length)];
}

// Helper to call 9Router / OpenAI format
async function callLLM(model: string, systemPrompt: string, userPrompt: string, isJson: boolean = true) {
  console.log(`\n[API CALL] Menggunakan model: ${model}...`);
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-d87a7e5a911c8a06-66bfmx-94b840ec"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        // response_format: isJson ? { type: "json_object" } : undefined, // Beberapa endpoint proxy error jika ini dikirim mentah, jadi kita tegaskan di prompt saja
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
    }
    const rawText = await response.text();
    let content = "";
    try {
        const data = JSON.parse(rawText);
        if (!data.choices || !data.choices[0]) {
           throw new Error("Invalid response format: " + JSON.stringify(data));
        }
        content = data.choices[0].message.content;
    } catch (e) {
        // If it fails to parse as JSON, it might be Server-Sent Events (SSE)
        if (rawText.includes("data: ")) {
            const chunks = rawText.split("data: ");
            for (const chunk of chunks) {
                if (chunk.trim() === "" || chunk.trim() === "[DONE]") continue;
                try {
                    const parsed = JSON.parse(chunk.trim());
                    if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                        content += parsed.choices[0].delta.content;
                    }
                } catch(err) {
                    // ignore chunk errors
                }
            }
        } else {
            throw new Error("Failed to parse response: " + rawText);
        }
    }
    
    // Attempt to extract JSON from markdown if wrapped in ```json ... ```
    let cleanJson = content.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/```/g, '').trim();
    }
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error(`[API ERROR] Gagal memanggil model ${model}:`, (error as any).message);
    return null;
  }
}

async function callLLMWithRetry(systemPrompt: string, userPrompt: string) {
    // Try up to 3 random models in case one provider is not configured
    for (let i = 0; i < 3; i++) {
        const model = getRandomModel();
        const result = await callLLM(model, systemPrompt, userPrompt);
        if (result) return { result, model };
    }
    return { result: null, model: null };
}

async function runTest() {
  console.log("==========================================");
  console.log("MEMULAI BACKGROUND TEST MULTI-AGENT FINANCIAQ");
  console.log("==========================================");

  // 1. Setup Mock Raw Data
  const rawData: RawFinancialData = {
    income: "15000000",
    expense: "10000000",
    debt: "4000000",
    savings: "5000000",
    existingInvestment: "0",
    sideIncome: "0",
    age: "28",
    employmentStatus: "karyawan_tetap",
    dependents: "0",
    investmentExperience: "kurang_1_tahun",
    knownInstruments: ["Deposito"],
    investmentHorizon: "3_5_tahun",
    risk: "AGRESIF",
    goal: "pensiun",
    drawdownReaction: "tahan",
    additionalNotes: ""
  };
  
  console.log("\nData Mentah User:", rawData);

  // 2. We will now assign models dynamically with retries
  console.log(`\n[ASSIGNMENT] Menunggu respon API untuk menentukan model yang berhasil...`);

  // ---------------------------------------------------------
  // AGENT 1: RISK PROFILER
  // ---------------------------------------------------------
  const a1SystemPrompt = `Kamu adalah pakar aktuaria dan financial risk profiler. Tugasmu menganalisis profil risiko user.
Kembalikan respon HANYA dalam format JSON valid dengan skema berikut, JANGAN tambahkan teks lain di luar JSON:
{
  "surplus": number, // income - expense - debt
  "dtiRatio": number, // (debt / income) * 100
  "savingsRate": number, // (surplus / income) * 100
  "emergencyTarget": number, // expense * 6
  "emergencyProgress": number, // (savings / emergencyTarget) * 100, max 100
  "isHealthy": boolean, // true jika dti < 30 dan emergencyProgress >= 100
  "originalRisk": string, // ambil dari input
  "correctedRisk": string, // ubah jadi KONSERVATIF jika isHealthy false, atau naikkan ke AGRESIF jika sangat sehat.
  "explanation": string // Penjelasan 2-3 paragraf MENDALAM mengapa kamu mengoreksi/mempertahankan profil risikonya.
}`;
  const a1UserPrompt = JSON.stringify(rawData);

  const { result: riskProfile, model: modelRiskProfiler } = await callLLMWithRetry(a1SystemPrompt, a1UserPrompt);
  if (!riskProfile) return console.log("Test gagal di Agent 1 (Semua model error)");
  console.log(`\n[HASIL AGENT 1 (Risk Profiler) - ${modelRiskProfiler}]:`);
  console.log(riskProfile);

  // ---------------------------------------------------------
  // AGENT 2: WEALTH MANAGER
  // ---------------------------------------------------------
  const a2SystemPrompt = `Kamu adalah Wealth Manager cerdas. Berdasarkan Risk Profile user (terutama field correctedRisk), alokasikan persentase investasi.
Kembalikan respon HANYA dalam format JSON valid dengan skema berikut:
{
  "yearlyInvestment": number, // surplus * 12
  "allocations": {
    "rdpu": number, // persentase 0-100
    "sbn": number, // persentase 0-100
    "indexFund": number, // persentase 0-100
    "crypto": number // persentase 0-100 (total ke-4 ini harus 100)
  },
  "projections": [number, number, number], // array 3 angka proyeksi nilai kekayaan dalam 1, 5, 10 tahun
  "maxProjection": number, // nilai max dari array projections
  "totalOriginalCapital": number, // modal asli terkumpul 10 tahun (yearlyInvestment * 10)
  "pureInterest": number, // maxProjection - totalOriginalCapital
  "message": string // Pesan rekomendasi alokasi yang detail dan rasional, sekitar 2 paragraf.
}`;
  const a2UserPrompt = JSON.stringify(riskProfile);

  const { result: wealthAllocation, model: modelWealthManager } = await callLLMWithRetry(a2SystemPrompt, a2UserPrompt);
  if (!wealthAllocation) return console.log("Test gagal di Agent 2");
  console.log(`\n[HASIL AGENT 2 (Wealth Manager) - ${modelWealthManager}]:`);
  console.log(wealthAllocation);

  // ---------------------------------------------------------
  // AGENT 3: MARKET ANALYST
  // ---------------------------------------------------------
  const a3SystemPrompt = `Kamu adalah Market Analyst pesimis yang melakukan Stress Test terhadap portfolio user jika terjadi krisis ekonomi.
Gunakan profil risiko dan surplus user.
Kembalikan respon HANYA dalam format JSON valid dengan skema berikut:
{
  "survivalMonths": number, // berapa bulan user bisa hidup dengan savings jika income 0 (savings / expense yang diinput pertama)
  "isSurvivalDanger": boolean, // true jika survivalMonths < 6
  "floatingDebtImpact": number, // estimasi porsi debt yang bunganya naik jika inflasi tinggi
  "marketCrashImpact": string, // Penjelasan detail apa yang terjadi pada investasi user jika market crash
  "hyperinflationImpact": string, // Penjelasan detail efek inflasi terhadap daya beli
  "jobLossImpact": string, // Penjelasan detail mengenai ketahanan dana darurat user
  "conclusion": string // Kesimpulan tegas 1-2 kalimat.
}`;
  const a3UserPrompt = JSON.stringify({
    ...riskProfile,
    expense: 10000000,
    savings: 5000000
  }); // inject extra details needed by A3

  const { result: stressTest, model: modelMarketAnalyst } = await callLLMWithRetry(a3SystemPrompt, a3UserPrompt);
  if (!stressTest) return console.log("Test gagal di Agent 3");
  console.log(`\n[HASIL AGENT 3 (Market Analyst) - ${modelMarketAnalyst}]:`);
  console.log(stressTest);

  console.log("\n==========================================");
  console.log("TEST SELESAI!");
  console.log("Seperti yang terlihat, struktur outputnya komplit (statis seperti di web), namun isi teks dan perhitungannya dinamis dari LLM!");
  console.log("==========================================");
}

runTest();
