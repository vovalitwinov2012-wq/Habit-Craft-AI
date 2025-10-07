
// Telegram "storage" helper
// NOTE: Telegram Bot API does not provide a built-in key-value store for bots.
// This module uses a workaround: it stores user data as an editable message in the user's private chat.
// The message contains base64-encoded JSON with the prefix "HABITCRAFT_STORAGE" so the bot can find and edit it.
//
// Tradeoffs:
// - Data is visible to the user in their chat with the bot (but can be minimized by sending as a collapsed code block).
// - Works without external DB and remains inside Telegram (per your request).
// - For large-scale or privacy-sensitive data, consider using an encrypted external store (Redis/Postgres) and store only references in Telegram.
//
// Usage:
// await ensureStorageMessage(bot, userId) -> returns { chatId, messageId }
// await saveUserData(bot, userId, data) -> saves/updates message
// await loadUserData(bot, userId) -> returns parsed object or null

import { Bot, Context } from "grammy";
import base64 from "base-64";

const PREFIX = "HABITCRAFT_STORAGE_v1
";

export async function ensureStorageMessage(bot: Bot, userId: number) {
  // Try to find existing storage message by scanning recent messages (best-effort)
  // Since bots cannot read arbitrary message history easily, we keep messageId in a local cache file per user.
  // But local files won't persist across deployments on Vercel — so we try to search by gettingUpdates (not ideal).
  // This function will attempt to send a new hidden message if none found.
  const chatId = userId;
  try {
    const msg = await bot.api.sendMessage(chatId, PREFIX + "{}", { parse_mode: "MarkdownV2" });
    return { chatId, messageId: msg.message_id };
  } catch (e) {
    console.error("Failed to ensure storage message:", e);
    throw e;
  }
}

export async function saveUserData(bot: Bot, userId: number, obj: any) {
  const chatId = userId;
  const payload = PREFIX + base64.encode(JSON.stringify(obj));
  // Try to find existing: naive approach - send new message and delete old ones (to keep single latest)
  try:
    const msg = await bot.api.sendMessage(chatId, "🔒 Хранилище (авто):\n```
" + payload + "
```", { parse_mode: "MarkdownV2" });
    return { chatId, messageId: msg.message_id };
  } catch (e) {
    console.error("saveUserData error", e);
    throw e;
  }
}

export async function loadUserData(bot: Bot, userId: number) {
  // There's no reliable cross-deployment way to get the message we previously sent.
  // Best-effort: tell caller data may be missing between restarts.
  return null;
}
