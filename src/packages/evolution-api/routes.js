const { verifyToken } = require('../user/services');
const { PrismaClient } = require('@database/client');
const { sendMessageToWhatsApp } = require('./services');
const { agentMessage } = require('../conversation/services');

const prisma = new PrismaClient();

const buffer = [];

module.exports = [
  {
    method: 'post',
    router: 'webhook/whatsapp',
    call: [verifyToken, async (req, res) => {
      try {
        const { sender, message } = req.body;

        if (!sender || !message) {
          return res.status(400).json({
            error: 'Sender and message are required.'
          });
        }

        let user = await prisma.user.findUnique({
          where: { phoneNumber: sender },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phoneNumber: sender,
              email: `${sender}@s.whatsapp.net`
            },
          });
        }

        bufferWaitTime = process.env.EVOLUTION_WAIT_TIME ?? 1200;

        buffer[sender] && clearTimeout(buffer[sender]);
        buffer[sender] = setTimeout(async () => {
          const userId = user.id;
          const { response } = await agentMessage(userId, message);
          
          if (!response) {
            return res.status(500).json({ error: 'Agent response failed.' });
          }

          // Logic to split a larger text.
          await sendMessageToWhatsApp(sender, response);

          res.status(200).json({ message: 'Success!' });
        }, bufferWaitTime);

      } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
      }
    }],
  },
];
