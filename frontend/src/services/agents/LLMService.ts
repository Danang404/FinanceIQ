const API_URL = process.env.NEXT_PUBLIC_LLM_API_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const API_KEY = process.env.NEXT_PUBLIC_LLM_API_KEY || "dummy_key"; 

const MODELS = [
  "Qwen3.7-Flash",
  "Qwen3.6-Plus",
  "Qwen3.5-Flash",
  "Qwen3.5-Plus",
  "DeepSeek-V4-Flash",
  "DeepSeek-V4-Pro",
  "Qwen3-Max",
  "Qwen3.6-Flash"
];

function getRandomModel(): string {
  return MODELS[Math.floor(Math.random() * MODELS.length)];
}

/**
 * Panggil 9Router API — returns parsed JSON or raw text.
 */
async function callLLM(model: string, systemPrompt: string, userPrompt: string, parseJson: boolean = true) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const rawText = await response.text();
    let content = "";
    
    try {
        const data = JSON.parse(rawText);
        if (data.choices && data.choices[0]) {
            content = data.choices[0].message.content;
        }
    } catch (e) {
        // SSE parsing fallback (9Router sometimes streams forcefully)
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
                    // ignore
                }
            }
        }
    }

    if (!content) throw new Error("No content generated");

    // If we don't need JSON parsing, return raw text
    if (!parseJson) {
      return content.trim();
    }

    // Extract JSON block
    let cleanJson = content.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/```/g, '').trim();
    }
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error(`[LLMService] Error with model ${model}:`, error);
    return null;
  }
}

/**
 * Memanggil LLM dengan mekanisme fallback/retry ke model lain jika gagal.
 * @param parseJson - Set to false for chatbot (returns raw text)
 */
export async function callAgentLLM(
  systemPrompt: string, 
  userPrompt: string, 
  numModelsToTry: number = 2,
  parseJson: boolean = true
) {
    for (let i = 0; i < numModelsToTry; i++) {
        const model = getRandomModel();
        console.log(`[LLMService] Mencoba model: ${model}...`);
        const result = await callLLM(model, systemPrompt, userPrompt, parseJson);
        if (result) {
            console.log(`[LLMService] Berhasil menggunakan model: ${model}`);
            return result;
        }
    }
    console.error("[LLMService] Semua model gagal merespon.");
    return null;
}
