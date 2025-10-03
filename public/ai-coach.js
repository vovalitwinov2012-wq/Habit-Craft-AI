import { loadData } from "./utils.js";
import { t } from "./i18n.js";

let adviceCount = parseInt(localStorage.getItem("advice-count") || "0");
const isPremium = localStorage.getItem("is-premium") === "true";

export async function getAICoachAdvice() {
  if (!isPremium && adviceCount >= 1) {
    document.getElementById("ai-advice").textContent = "Достигнут лимит бесплатных советов. Подпишитесь на премиум!";
    document.getElementById("premium-upgrade").style.display = "block";
    return;
  }

  const habits = loadData("habits") || [];
  const todayKey = new Date().toISOString().split("T")[0];
  const todayProgress = loadData(`progress-${todayKey}`) || {};

  const completed = habits.filter(h => todayProgress[h.id]).length;
  const total = habits.length;

  const prompt = `
Ты — дружелюбный AI-коуч по привычкам. Пользователь выполнил ${completed} из ${total} привычек за сегодня.
Дай краткий, тёплый и мотивирующий совет на ${localStorage.getItem("lang") === "ru" ? "русском" : "английском"}.
Не упоминай, что ты ИИ.
Если всё хорошо — похвали. Если есть пробелы — предложи микро-действие.
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, // ← ЗАМЕНИТЬ В Vercel
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL,
        "X-Title": process.env.SITE_NAME
      },
      body: JSON.stringify({
        model: "qwen/qwen3-235b-a22b:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const advice = data.choices[0].message.content;

    document.getElementById("ai-advice").textContent = advice;

    if (!isPremium) {
      adviceCount++;
      localStorage.setItem("advice-count", adviceCount);
    }
  } catch (e) {
    console.error("AI Error:", e);
    document.getElementById("ai-advice").textContent = "Ошибка получения совета. Попробуйте позже.";
  }
}