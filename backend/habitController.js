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
      return { chatId, replyText: '📝 No habits yet. Add one with /new <name>' };
    }
    const lines = list.map((h, i) => `${h.done ? '✅' : '⏳'} ${i + 1}. ${h.name}`);
    return { chatId, replyText: `📋 Your habits:\n${lines.join('\n')}` };
  }

  if (normalized.startsWith('/done')) {
    const habitIndex = parseInt(normalized.replace('/done', '').trim()) - 1;
    const list = habits[chatId];
    if (isNaN(habitIndex) || habitIndex < 0 || habitIndex >= list.length) {
      return { chatId, replyText: 'Usage: /done <number> (use /list to see numbers)' };
    }
    list[habitIndex].done = !list[habitIndex].done;
    const status = list[habitIndex].done ? 'completed' : 'pending';
    return { chatId, replyText: `✅ Habit "${list[habitIndex].name}" marked as ${status}` };
  }

  if (normalized.startsWith('/delete')) {
    const habitIndex = parseInt(normalized.replace('/delete', '').trim()) - 1;
    const list = habits[chatId];
    if (isNaN(habitIndex) || habitIndex < 0 || habitIndex >= list.length) {
      return { chatId, replyText: 'Usage: /delete <number> (use /list to see numbers)' };
    }
    const deletedHabit = list.splice(habitIndex, 1)[0];
    return { chatId, replyText: `🗑️ Deleted habit: ${deletedHabit.name}` };
  }

  if (normalized.startsWith('/help') || normalized.startsWith('/start')) {
    return { 
      chatId, 
      replyText: `🤖 <b>Habit Craft AI Bot</b>\n\n` +
                `Commands:\n` +
                `• /new <name> - Add new habit\n` +
                `• /list - Show all habits\n` +
                `• /done <number> - Mark habit as done/pending\n` +
                `• /delete <number> - Delete habit\n` +
                `• /ai <question> - Ask AI advisor\n` +
                `• /help - Show this help\n\n` +
                `Start building better habits today! 💪`
    };
  }

  return { chatId, replyText: 'Unknown command. Use /help to see available commands.' };
}

module.exports = { handleMessage, habits };
