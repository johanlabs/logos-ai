const { getPackages, registerPackage } = require('./package');

const { registerRoutes } = require('./routes');

const log = require('@utils/log');
const { registerTemplates } = require('./templates');

const registerPackages = async (app) => {
    try {
        const packages = await getPackages();

        for (const package of packages) {
            await registerRoutes(app, package);
            await registerPackage(app, package);
            await registerTemplates(app, package);
        }
    } catch(err) {
        log( JSON.stringify(err), "red" );
    }
};

module.exports = { registerPackages };
