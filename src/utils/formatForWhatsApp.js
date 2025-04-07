function formatForWhatsApp(text, delimiter = null) {
    const formatText = (text) => {
        text = text.replace(/\*([^\*]+)\*/g, '*$1*');
        text = text.replace(/_([^_]+)_/g, '_$1_');
        text = text.replace(/~([^~]+)~/g, '~$1~');
        
        return text;
    };

    if (delimiter) {
        const parts = text.split(delimiter);
        return parts.map(part => {
            const formattedText = formatText(part);
            return splitText(formattedText);
        }).flat();
    }

    const textWithBreaks = text.replace(/([^\n])([A-Za-z0-9\s])/g, '$1\n$2');
    return formatText(textWithBreaks);
}

module.exports = { formatForWhatsApp };