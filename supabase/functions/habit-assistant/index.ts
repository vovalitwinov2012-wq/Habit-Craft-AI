import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type = "chat" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompts = {
      chat: `Вы - опытный коуч по формированию привычек. Помогайте пользователям:
- Давать советы по достижению целей и привычек
- Мотивировать и поддерживать
- Объяснять научные принципы формирования привычек
- Предлагать стратегии преодоления трудностей
- Анализировать прогресс и давать рекомендации

Будьте мотивирующим, позитивным и конструктивным. Давайте практические советы.`,
      
      suggest: `Вы - эксперт по формированию привычек. Ваша задача - предложить 3-5 конкретных привычек на основе запроса пользователя.
Для каждой привычки укажите:
- Название (краткое, мотивирующее)
- Мотивационную цитату
- Категорию (Спорт, Здоровье, Обучение, Продуктивность, Творчество, Финансы)
- Рекомендуемую цель в днях
- Советы по выполнению

Предлагайте реалистичные, измеримые привычки с учетом контекста пользователя.`,
      
      analyze: `Вы - аналитик привычек. Анализируйте данные о привычках пользователя и предоставляйте:
- Инсайты о паттернах выполнения
- Выявление сильных и слабых сторон
- Рекомендации по улучшению
- Идентификацию факторов успеха
- Персонализированные стратегии

Используйте данные для конструктивной обратной связи.`
    };

    const body: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompts[type as keyof typeof systemPrompts] || systemPrompts.chat },
        ...messages
      ],
    };

    // For habit suggestions, use structured output via tool calling
    if (type === "suggest") {
      body.tools = [
        {
          type: "function",
          function: {
            name: "suggest_habits",
            description: "Return 3-5 actionable habit suggestions based on user request.",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Краткое название привычки" },
                      quote: { type: "string", description: "Мотивационная цитата" },
                      category: { 
                        type: "string",
                        enum: ["Спорт", "Здоровье", "Обучение", "Продуктивность", "Творчество", "Финансы"],
                        description: "Категория привычки"
                      },
                      goal: { type: "number", description: "Рекомендуемая цель в днях (21, 30, 60, 90)" },
                      color: { 
                        type: "string",
                        enum: ["5 100% 70%", "48 100% 62%", "250 65% 65%", "280 80% 70%", "25 95% 65%", "340 75% 68%"],
                        description: "Цвет в формате HSL"
                      },
                      tips: { type: "string", description: "Советы по выполнению привычки" }
                    },
                    required: ["title", "quote", "category", "goal", "color", "tips"],
                    additionalProperties: false
                  }
                }
              },
              required: ["suggestions"],
              additionalProperties: false
            }
          }
        }
      ];
      body.tool_choice = { type: "function", function: { name: "suggest_habits" } };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Превышен лимит запросов. Попробуйте позже." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Необходимо пополнить баланс." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Ошибка AI сервиса" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Handle tool calls for structured output
    if (type === "suggest" && data.choices[0]?.message?.tool_calls) {
      const toolCall = data.choices[0].message.tool_calls[0];
      const suggestions = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify({ suggestions: suggestions.suggestions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: data.choices[0].message.content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in habit-assistant:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Неизвестная ошибка" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
