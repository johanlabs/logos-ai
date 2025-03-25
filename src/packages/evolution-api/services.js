const axios = require('axios');

async function sendMessageToWhatsApp(to, message) {
  try {
    const response = await axios.post(`${process.env.EVOLUTION_API_URL}/message/sendText/logos`, {
      number: to,
      text: message,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.EVOLUTION_API_KEY,
      }
    });

    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

module.exports = { sendMessageToWhatsApp };
