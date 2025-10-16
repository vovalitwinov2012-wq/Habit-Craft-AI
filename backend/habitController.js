const { sendAIMessage } = require('./aiService');
const habits = {};
async function handleMessage(update) {
  const chatId = update.message.chat.id;
  const text = update.message.text;
  if (!habits[chatId]) habits[chatId] = [];
  if (text.startsWith('/new')) {
    const habitName = text.replace('/new','').trim();
    habits[chatId].push({ name: habitName, done:false });
  } else if (text.startsWith('/ai')) {
    const response = await sendAIMessage(text.replace('/ai','').trim());
    console.log(response);
  } else if (text.startsWith('/list')) {
    console.log(habits[chatId]);
  }
}
module.exports = { handleMessage, habits };
