const { PrismaClient } = require("@database/client");

const { formatString, loadPrompt } = require("./utils");
const { inference } = require("../inference/services");

const prisma = new PrismaClient();

async function createChat(userId) {
  try {
    const chat = await prisma.chat.create({
      data: {
        userId,
      },
    });
    return chat;
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
}

async function getChat(userId) {
  try {
    const chat = await prisma.chat.findUnique({
      where: { userId },
      include: { messages: true },
    });

    if (!chat) {
      return await createChat(userId);
    }

    return chat;
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
}

async function agentMessage(userId, message) {
  let activities;

  try {
    const chat = await getChat(userId);

    if (!chat) {
      await createChat(userId);

      activities = [];
    } else {
      activities = chat.messages;
    }

    const historicMessages = activities?.slice(-20).map(m => ({
      role: m.role === 'agent' ? 'system' : m.role,
      content: m.content,
    })) ?? [];

    const promptSystem = await loadPrompt("default");

    if (typeof promptSystem !== 'string') {
      throw new Error('Prompt is not valid.');
    }

    const data = {
      messages: [
        ...historicMessages,
        { role: 'system', content: promptSystem },
        { role: 'user', content: message },
      ],
    };

    const response = await inference(data.messages);
    const reply = formatString(response);

    if (chat && chat.id) {
      await prisma.chatMessage.createMany({
        data: [
          { chatId: chat.id, role: 'user', content: message },
          { chatId: chat.id, role: 'assistant', content: reply },
        ],
      });
    } else {
      console.error('Chat not found.');
    }

    return { response: reply };
  } catch (err) {
    console.error("Message Error:", err);
  }
}

module.exports = { createChat, getChat, agentMessage };