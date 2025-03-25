const path = require('path');
const fs = require('fs');

const { log } = require('@utils/log');

const getRoutes = () => {
    const routes = [];
    const baseDir = path.join(__dirname, '..', 'packages');

    try {
        fs.readdirSync(baseDir).forEach(packageDir => {
            const routesPath = path.join(baseDir, packageDir, 'routes.js');

            if (fs.existsSync(routesPath)) {
                const routeModule = require(routesPath);
                routeModule.map(router => router.dir = packageDir);

                routes.push(...routeModule);
            }
        });
    } catch (error) {
        console.error("Error with Routes:", error);
        return [];
    }

    return routes;
};

const registerRoutes = async (app, package) => {
    const packageDir = path.join(__dirname, '..', 'packages', package.folder);
    const routesRegex = /^routes\.(js|tsx)$/;
    const files = fs.readdirSync(packageDir);
    const routesFile = files.find((file) => routesRegex.test(file));

    try {
        if (routesFile) {
            const routesPath = path.join(packageDir, routesFile);
            const _routes = require(routesPath);

            if (!_routes || !Array.isArray(_routes)) {
                log(`Error: Routes are not an array in ${routesPath}`, 'error');
                return;
            }

            _routes.forEach((route) => {
                if (route.method && route.router && route.call) {
                    app[route.method](`/${package.folder}/${route.router}`, route.call);

                    log(`${package.name} registered router at [${route.method.toUpperCase()}] /${package.folder}/${route.router}`, 'gray');
                } else {
                    log(`Invalid route configuration for ${package.name} [${route.method}] /${package.folder}/${route.router}`, 'error');
                }
            });
        }
    } catch (error) {
        log(`Error`, 'error', 3);
        log(`Error registering routes for ${package.name}: ${error.message}`, 'error');
    }
};

module.exports = { getRoutes, registerRoutes }