const { getAppPackage } = require('../core/self');
const packageApp = getAppPackage();

const log = (text, type = 'info') => {
    const message = `[${packageApp.name}] ${text}`;

    let output;

    switch (type) {
        case 'gray':
            output = `\x1b[90m${message}\x1b[0m`;
            break;
        case 'error':
        case 'red':
            output = `\x1b[31m${message}\x1b[0m`;
            break;
        case 'success':
        case 'green':
            output = `\x1b[32m${message}\x1b[0m`;
            break;
        case 'warning':
        case 'yellow':
            output = `\x1b[33m${message}\x1b[0m`;
            break;
        case 'blue':
            output = `\x1b[34m${message}\x1b[0m`;
            break;
        case 'white':
            output = `\x1b[37m${message}\x1b[0m`;
            break;
        default:
            output = `${message}`;
            break;
    }

    console.log(output);
};

module.exports = { default: log, log };

