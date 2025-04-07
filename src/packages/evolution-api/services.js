const axios = require('axios');

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

    await axios(`${process.env.EVOLUTION_API_URL}/message/sendText/logos`, options);
  } catch (err) {
    console.error('Error', err);
  }
}

module.exports = { sendMessageToWhatsApp };
