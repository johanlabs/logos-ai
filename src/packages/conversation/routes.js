
const { getChat, agentMessage, createChat } = require('./services');
const { verifyToken } = require('../user/services');

module.exports = [
    {
        method: 'get',
        router: 'messages',
        call: [ verifyToken, async (req, res) => {
            try {
                const chat = await getChat(req.user.id);

                res.json(chat);
            } catch (error) {
                res?.status(500).json({ error });
            }
        }]
    },
    {
        method: 'post',
        router: 'message',
        call: [ verifyToken, async (req, res) => {
            try {
                const userId = req.user.id;
                const { message } = req.body;
                
                const response = await agentMessage(userId, message);

                res.json({ ...response });
            } catch (error) {
                res.status(500).json({ error });
            }
        }]
    },


    {
        method: 'post',
        router: 'create',
        call: [ verifyToken, async (req, res) => {
            try {
                const response = await createChat(req.user.id);

                res.json(response);
            } catch (error) {
                res.status(500).json({ error });
            }
        }]
    },
    {
        method: 'get',
        router: 'list',
        call: [ verifyToken, async (req, res) => {
            try {
                const chat = await getChat(req.user.id);

                res.json(chat);
            } catch (error) {
                res?.status(500).json({ error: error.message });
            }
        }]
    },
];