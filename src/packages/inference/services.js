async function inference(messages, {
    ignoreHistory = false,
    model = process.env.INFERENCE_DEFAULT,
    promptSystem = ``
} = {}) {
    try {
        const apiKey = process.env.AI_SERVER_API_KEY;
        const apiUrl = process.env.AI_SERVER_API_URL;

        if (!apiKey) {
            throw new Error('AI_SERVER_API_KEY not defined in .env');
        }

        const filteredMessages = ignoreHistory ? messages.slice(-2) : messages;

        const messagesWithHeader = promptSystem
            ? [
                { role: 'system', content: promptSystem },
                ...filteredMessages
            ]
            : filteredMessages;

        const data = JSON.stringify({
            model,
            messages: messagesWithHeader,
        });

        const response = await fetch(`${apiUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: data,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Inference Error:', errorData);
            throw new Error(`Error: ${response.status} - ${errorData.message || response.statusText}`);
        }

        const responseData = await response.json();
        const assistantReply = responseData.choices?.[0]?.message?.content;

        if (!assistantReply) {
            throw new Error("API response isn't valid.");
        }

        return assistantReply;
    } catch (error) {
        console.error('Inference Error:', error);
        throw error;
    }
}

module.exports = { inference };