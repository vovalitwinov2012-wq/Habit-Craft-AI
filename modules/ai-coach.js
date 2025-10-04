import { CONFIG } from "../config.js";
import StorageManager from "./storage.js";

export default class AICoach {
  constructor() {
    this.storage = new StorageManager();
    this.apiKey = window.__ENV__?.OPENROUTER_API_KEY || null;
    this.dailyRequests = this.loadRequests();
  }

  today() {
    return new Date().toISOString().split("T")[0];
  }

  loadRequests() {
    const saved = this.storage.getItem(CONFIG.STORAGE_KEYS.AI_REQUESTS) || {};
    if (saved.date !== this.today()) {
      saved.date = this.today();
      saved.count = 0;
    }
    return saved;
  }

  saveRequests() {
    this.storage.setItem(CONFIG.STORAGE_KEYS.AI_REQUESTS, this.dailyRequests);
  }

  canUseAI() {
    return this.dailyRequests.count < CONFIG.AI_REQUESTS_PER_DAY;
  }

  async getAdvice(prompt) {
    if (!prompt) return "Введите вопрос для AI-коуча.";
    if (!this.canUseAI()) return "Достигнут дневной лимит запросов.";
    if (!this.apiKey) return this.mockAdvice();

    try {
      this.dailyRequests.count++;
      this.saveRequests();

      const res = await fetch(CONFIG.AI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: CONFIG.AI_MODEL,
          messages: [
            {
              role: "system",
              content: "Ты коуч по привычкам. Отвечай на русском, вдохновляюще и кратко."
            },
            { role: "user", content: prompt }
          ]
        })
      });

      const data = await res.json();
      return data?.choices?.[0]?.message?.content || "Не удалось получить ответ.";
    } catch (e) {
      console.error("AI error:", e);
      return this.mockAdvice();
    }
  }

  mockAdvice() {
    const variants = [
      "Начни с малого — 5 минут сегодня лучше, чем ничего!",
      "Регулярность важнее перфекционизма.",
      "Празднуй каждое маленькое достижение."
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }
}