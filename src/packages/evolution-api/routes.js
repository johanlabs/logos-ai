const { verifyToken } = require('../user/services');
const { PrismaClient } = require('@database/client');
const { sendMessageToWhatsApp } = require('./services');
const { agentMessage } = require('../conversation/services');
const { formatForWhatsApp } = require('../../utils/formatForWhatsApp');
const { updateUserDailyReflection } = require('../reflector/services');

const prisma = new PrismaClient();

const buffer = [];

module.exports = [
  {
    method: 'post',
    router: 'webhook/whatsapp',
    call: [async (req, res) => {
      try {
        const { data } = req.body;

        const number = data.key.remoteJid.split("@")[0];
        const message = data?.message?.conversation;

        if (message.includes("/parar")) {
          await updateUserDailyReflection(number, false);

          await sendMessageToWhatsApp(number, "Você não receberá mais mensagens de reflexões diárias.");
          await sendMessageToWhatsApp(number, "Para voltar a receber use o comando /pão-diário");

          return res.status(200).json({ message: 'Success!' });
        }

        if (message.includes(["/pão-diário"])) {
          await updateUserDailyReflection(number, true);

          await sendMessageToWhatsApp(number, "Você receberá mensagens de reflexões diárias.");
          await sendMessageToWhatsApp(number, "Para parar use o comando /parar");
          
          return res.status(200).json({ message: 'Success!' });
        }

        if (req.body.event !== 'messages.upsert') {
          return res.status(400).json({
            error: 'Event not supported.'
          });
        }

        if (!number || !message) {
          return res.status(400).json({
            error: 'Sender and message are required.'
          });
        }

        let user = await prisma.user.findUnique({
          where: { phoneNumber: number },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phoneNumber: number,
              email: data.key.remoteJid
            },
          });
        }

        bufferWaitTime = process.env.EVOLUTION_WAIT_TIME ?? 12000;

        buffer[number] && clearTimeout(buffer[number]);
        buffer[number] = setTimeout(async () => {
          const userId = user.id;
          const { response } = await agentMessage(userId, message);

          if (!response) {
            return res.status(500).json({ error: 'Agent response failed.' });
          }

          // const responseFormatted = formatForWhatsApp(response);
          await sendMessageToWhatsApp(number, response);

          res.status(200).json({ message: 'Success!' });
        }, bufferWaitTime);

      } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
      }
    }],
  },
];
