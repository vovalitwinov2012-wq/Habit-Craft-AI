const fetch = require('node-fetch');

async function setupWebhook() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL || process.env.VERCEL_URL + '/api/webhook';
  
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN is required');
    process.exit(1);
  }
  
  if (!webhookUrl) {
    console.error('TELEGRAM_WEBHOOK_URL or VERCEL_URL is required');
    process.exit(1);
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'edited_message']
      })
    });
    
    const result = await response.json();
    console.log('Webhook setup result:', result);
    
    if (result.ok) {
      console.log('✅ Webhook set successfully!');
      console.log(`Webhook URL: ${webhookUrl}`);
    } else {
      console.error('❌ Failed to set webhook:', result.description);
    }
  } catch (error) {
    console.error('❌ Error setting webhook:', error.message);
  }
}

if (require.main === module) {
  setupWebhook();
}

module.exports = { setupWebhook };