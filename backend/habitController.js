const { sendAIMessage } = require('./aiService');
const habits = {};

async function handleMessage(update) {
  const message = update && (update.message || update.edited_message);
  const chatId = message && message.chat && message.chat.id;
  const text = message && message.text ? String(message.text) : '';

  if (!chatId) {
    return { chatId: undefined, replyText: 'Unsupported update format' };
  }

  if (!habits[chatId]) habits[chatId] = [];

  const normalized = text.trim();
  if (normalized.startsWith('/new')) {
    const habitName = normalized.replace('/new', '').trim();
    if (!habitName) {
      return { chatId, replyText: 'Usage: /new <habit name>' };
    }
    habits[chatId].push({ name: habitName, done: false });
    return { chatId, replyText: `Added habit: ${habitName}` };
  }

  if (normalized.startsWith('/ai')) {
    const prompt = normalized.replace('/ai', '').trim();
    if (!prompt) {
      return { chatId, replyText: 'Usage: /ai <your question>' };
    }
    try {
      const response = await sendAIMessage(prompt);
      return { chatId, replyText: response };
    } catch (e) {
      return { chatId, replyText: 'AI service unavailable. Try again later.' };
    }
  }

  if (normalized.startsWith('/list')) {
    const list = habits[chatId];
    if (!list.length) {
      return { chatId, replyText: 'No habits yet. Add one with /new <name>' };
    }
    const lines = list.map((h, i) => `${i + 1}. ${h.name}`);
    return { chatId, replyText: lines.join('\n') };
  }

  return { chatId, replyText: 'Commands: /new <name>, /list, /ai <question>' };
}

module.exports = { handleMessage, habits };
