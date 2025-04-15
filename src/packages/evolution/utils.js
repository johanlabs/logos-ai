function convertToWhatsAppMessages(text) {
  const messages = [];

  const blocks = text.split('---').map(b => b.trim()).filter(Boolean);

  for (let block of blocks) {
    block = block.replace(/\*\*/g, '*');
    block = block.replace(/\n{2,}/g, '\n');
    block = block.replace(/\#\#\#/g, '\n\n');
    messages.push(block);
  }

  return messages;
}

module.exports = { convertToWhatsAppMessages }