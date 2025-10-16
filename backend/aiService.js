const axios = require('axios');
async function sendAIMessage(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY || '<YOUR_API_KEY>';
  const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
    model:"deepseek/deepseek-chat-v3.1:free",
    messages:[{role:"user",content:prompt}]
  }, { headers:{Authorization:`Bearer ${apiKey}`, "Content-Type":"application/json"} });
  return res.data.choices[0].message.content;
}
module.exports = { sendAIMessage };
