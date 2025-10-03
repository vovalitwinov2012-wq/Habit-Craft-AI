import { t } from "./i18n.js";
import { loadData, saveData } from "./utils.js";

export async function getAICoachAdvice(content) {
  const prompt = `
Ты — дружелюбный AI-коуч по привычкам. Пользователь написал: "${content}".
Дай краткий, тёплый и мотивирующий совет на ${localStorage.getItem("lang") === "ru" ? "русском" : "английском"}.
Если пользователь описал привычку, предложи, как её отследить: например, "Выпивай 2 стакана воды в день" → "Трекер: 2 раза в день отметь выполнение".
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
        model: "qwen/qwen3-coder:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (e) {
    console.error("AI Error:", e);
    return "Ошибка получения совета. Попробуйте позже.";
  }
}

export async function generateHabitTrackerFromAI(description) {
  const prompt = `
Пользователь описал привычку: "${description}".
Сгенерируй JSON с параметрами для трекера привычки:
{
  "name": "название",
  "motivation": "мотивация",
  "repeat": "daily/weekly/custom",
  "customFrequency": {"times": 1, "days": 7} // если custom
}
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL,
        "X-Title": process.env.SITE_NAME
      },
      body: JSON.stringify({
        model: "qwen/qwen3-coder:free",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    console.error("AI Tracker Gen Error:", e);
    return null;
  }
}