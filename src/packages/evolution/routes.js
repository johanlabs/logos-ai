const { PrismaClient } = require('@database/client');
const { sendTextAsWhatsAppMessages } = require('./services');
const { agentMessage } = require('../conversation/services');
const { json } = require('express');

const prisma = new PrismaClient();

const timeoutBuffer = {};
const messageBuffer = {};

module.exports = [
  {
    method: 'post',
    router: 'webhook/whatsapp',
    call: [async (req, res) => {
      try {
        const { data } = req.body;

        if (req.body?.event !== 'messages.upsert') {
          return res.status(400).json({ error: 'Event not supported.' });
        }

        if (req.body?.apikey !== process.env.EVOLUTION_INTANCE_APIKEY) {
          return res.status(401).json({ error: 'Unauthorized.' });
        }

        const number = data.key.remoteJid?.split("@")[0];
        const message = data?.message?.conversation;

        if (!number || !message) {
          return res.status(400).json({ error: 'Sender and message are required.' });
        }

        res.status(200).json({ message: 'Received' });

        if (!messageBuffer[number]) {
          messageBuffer[number] = [];
        }
        messageBuffer[number].push(message);

        if (timeoutBuffer[number]) {
          clearTimeout(timeoutBuffer[number]);
        }

        timeoutBuffer[number] = setTimeout(async () => {
          try {
            const fullMessage = messageBuffer[number].join('\n').trim();

            let user = await prisma.user.findUnique({
              where: { phoneNumber: number },
            });

            if (!user) {
              user = await prisma.user.create({
                data: {
                  phoneNumber: number,
                  email: `${number}@wa.me`
                },
              });
            }

            const { response } = await agentMessage(user.id, fullMessage);

            if (response) {
              await sendTextAsWhatsAppMessages(number, response);
            } else {
              console.error(`No agent response for ${number}`);
            }

          } catch (err) {
            console.error(`Error processing buffered message for ${number}:`, err);
          } finally {
            delete messageBuffer[number];
            delete timeoutBuffer[number];
          }
        }, +process.env.EVOLUTION_WAIT_TIME || 12000);

      } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
      }
    }]
  }
];
