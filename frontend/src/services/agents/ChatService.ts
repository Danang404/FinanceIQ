/**
 * ChatService — Real chatbot with LLM integration and rate limiting.
 * Calls LLM with full portfolio context from AgentMemoryStore.
 */
import { callAgentLLM } from './LLMService';
import { getMemoryStore } from './AgentMemoryStore';
import { ChatMessage } from './types';

const MAX_FREE_MESSAGES = 5;
const CHAT_COUNT_KEY = 'financeiq_chat_count';

export class ChatService {
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    // Restore message count from sessionStorage (resets on tab close)
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(CHAT_COUNT_KEY);
      if (stored) {
        // We only store count, not history (privacy)
      }
    }
  }

  getMessageCount(): number {
    return this.conversationHistory.filter(m => m.role === 'user').length;
  }

  getRemainingMessages(): number {
    return Math.max(0, MAX_FREE_MESSAGES - this.getMessageCount());
  }

  canSendMessage(): boolean {
    return this.getMessageCount() < MAX_FREE_MESSAGES;
  }

  getMaxMessages(): number {
    return MAX_FREE_MESSAGES;
  }

  private saveCount(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CHAT_COUNT_KEY, String(this.getMessageCount()));
    }
  }

  async sendMessage(userMessage: string): Promise<string> {
    if (!this.canSendMessage()) {
      return "⚠️ Limit percakapan gratis Anda telah habis (5/5 pesan). Upgrade ke Pro untuk konsultasi tak terbatas dengan AI Financial Advisor.";
    }

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    });
    this.saveCount();

    // Build context from memory
    const memory = getMemoryStore();
    const portfolioContext = memory.buildContextForChatbot();

    const systemPrompt = `Kamu adalah "Literacy Agent" — AI Financial Advisor dari FinanceIQ.
Kamu memiliki akses ke data portofolio dan hasil analisis lengkap user di bawah ini.

${portfolioContext}

ATURAN KETAT:
1. SELALU jawab berdasarkan data spesifik user di atas, JANGAN jawab generik.
2. Jika user bertanya tentang saham/instrumen spesifik, berikan analisis berdasarkan profil risiko mereka.
3. Gunakan bahasa Indonesia yang ramah dan edukatif.
4. Sertakan angka spesifik dari data mereka dalam jawaban.
5. JANGAN berikan rekomendasi beli/jual langsung — ini edukasi, bukan financial advice berlisensi.
6. Jika ditanya di luar konteks keuangan, tolak dengan sopan dan arahkan kembali ke topik finansial.
7. Jawab dalam 2-4 paragraf, ringkas namun substansial.
8. Selalu akhiri dengan disclaimer singkat bahwa ini bukan nasihat keuangan resmi.`;

    // Build messages array for LLM
    const recentHistory = this.conversationHistory.slice(-6); // Last 3 exchanges
    const userPrompt = recentHistory
      .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n\n');

    try {
      const result = await callAgentLLM(systemPrompt, userPrompt, 2, false);
      
      let aiResponse: string;
      if (result && typeof result === 'object') {
        // If LLM returned JSON (some models do this)
        aiResponse = result.response || result.answer || result.content || JSON.stringify(result);
      } else if (result && typeof result === 'string') {
        aiResponse = result;
      } else {
        aiResponse = "Maaf, saya mengalami kendala teknis saat memproses pertanyaan Anda. Silakan coba lagi.";
      }

      // Add AI response to history
      this.conversationHistory.push({
        role: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      });

      return aiResponse;
    } catch (error) {
      console.error('[ChatService] Error:', error);
      const fallbackResponse = "Mohon maaf, terjadi kendala jaringan. Silakan coba kirim ulang pertanyaan Anda.";
      this.conversationHistory.push({
        role: 'ai',
        content: fallbackResponse,
        timestamp: new Date().toISOString(),
      });
      return fallbackResponse;
    }
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  reset(): void {
    this.conversationHistory = [];
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CHAT_COUNT_KEY);
    }
  }
}

// Singleton
let chatInstance: ChatService | null = null;

export function getChatService(): ChatService {
  if (!chatInstance) {
    chatInstance = new ChatService();
  }
  return chatInstance;
}
