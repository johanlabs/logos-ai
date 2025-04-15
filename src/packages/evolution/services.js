const axios = require('axios');
const { convertToWhatsAppMessages, calculateTypingDelay } = require('./utils');

async function sendMessageToWhatsApp(to, message) {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.EVOLUTION_API_KEY,
      },
      data: {
        number: to,
        text: message,
        delay: +process.env.EVOLUTION_DELAY_TIME || 3000,
      }
    };

    await axios(`${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`, options);
  } catch (err) {
    console.error('Error sending message:', err?.response?.data || err.message);
  }
}

async function sendTextAsWhatsAppMessages(to, fullText) {
  const messages = convertToWhatsAppMessages(fullText);

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    await sendMessageToWhatsApp(to, message);
  }
}

module.exports = {
  sendMessageToWhatsApp,
  sendTextAsWhatsAppMessages,
};
