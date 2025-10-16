const { sendAIMessage } = require('./aiService');

const habits = {}; // Simple in-memory storage { userId: [habit objects] }

async function handleMessage(update) {
  const chatId = update.message.chat.id;
  const text = update.message.text;

  if (!habits[chatId]) habits[chatId] = [];

  if (text.startsWith('/new')) {
    const habitName = text.replace('/new', '').trim();
    habits[chatId].push({ name: habitName, done: false });
    console.log(`User ${chatId} added habit "${habitName}"`);
  } else if (text.startsWith('/ai')) {
    const response = await sendAIMessage(text.replace('/ai', '').trim());
    console.log(`AI response for ${chatId}: ${response}`);
  } else if (text.startsWith('/list')) {
    console.log(`User ${chatId} habits:`, habits[chatId]);
  }
}

module.exports = { handleMessage, habits };
