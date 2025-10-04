import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { habit, context } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OPENROUTER_API_KEY not configured. Please check your Vercel environment variables.' 
      });
    }

    if (!habit || !context) {
      return res.status(400).json({ 
        error: 'Missing required parameters: habit and context are required.' 
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://habit-craft.vercel.app',
        'X-Title': 'Habit Craft'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI habit coach specializing in behavior change and personal development. 
                     Provide practical, actionable advice that is:
                     - Encouraging and motivational
                     - Scientifically grounded
                     - Specific to the user's situation
                     - Broken down into manageable steps
                     - Focused on sustainable habit formation
                     
                     Keep responses concise but comprehensive (150-300 words).`
          },
          {
            role: 'user',
            content: `I'm working on developing this habit: "${habit}". 
                     Here's my current situation: "${context}".
                     
                     Please provide me with:
                     1. Practical advice for starting/maintaining this habit
                     2. Common pitfalls to avoid
                     3. Strategies for overcoming obstacles
                     4. Ways to track progress effectively
                     5. Motivation tips for staying consistent`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from AI service');
    }

    const advice = data.choices[0].message.content;
    
    res.json({
      success: true,
      advice: advice,
      usage: data.usage || null
    });

  } catch (error) {
    console.error('AI API Error:', error);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate advice. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
});

export default router;