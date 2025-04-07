const cron = require('node-cron');

const { inference } = require('../inference/services');
const { loadPrompt } = require('../conversation/utils');
const { getUsers } = require('../user/services');

module.exports = () => {
    return {
        setup: () => {
            cron.schedule('0 8 * * *', async () => {
                const promptSystem = await loadPrompt("default");
                const dailyReflection = await loadPrompt("reflection");

                const data = {
                    messages: [
                        { role: 'system', content: promptSystem },
                        { role: 'user', content: dailyReflection },
                    ],
                };

                const response = await inference(data.messages);
                const reflection = formatForWhatsApp(response);

                const users = getUsers({
                    dailyReflection: true
                });

                users.forEach(async (user) => {
                    const number = user.phoneNumber;
                    await sendMessageToWhatsApp(number, reflection);
                });
            });
        },

        remove: () => { }
    }
}