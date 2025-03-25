const fs = require('fs').promises;
const path = require('path');

function formatString(input) {

    let formatted = input?.replace(/^```|```$/g, '');

    formatted = formatted.replace(/\n/g, ' ');
    formatted = formatted.replace(/\s+/g, ' ').trim();

    return formatted;
}

async function loadPrompt(name) {
    try {
        const filePath = path.join(__dirname, `../../../prompts/${name}.md`);

        const agentPrompt = await fs.readFile(filePath, 'utf8');

        return agentPrompt;
    } catch (err) {
        console.error('Error:', err);
    }
}

module.exports = { formatString, loadPrompt }