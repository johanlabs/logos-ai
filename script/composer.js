const fs = require('fs');
const path = require('path');

const { execSync } = require('child_process');

const { log } = require('../src/utils/log');

const basePath = path.join(__dirname, '..', 'src/packages');
const mainPackagePath = path.join(__dirname, '..', 'package.json');

function analyzePackages() {
    const packageDirs = fs.readdirSync(basePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    let result = {
        dependencies: {},
        devDependencies: {},
        _moduleAliases: {}
    };

    packageDirs.forEach(packageName => {
        const packageJsonPath = path.join(basePath, packageName, 'package.json');

        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

            if (packageJson.dependencies) {
                result.dependencies = {
                    ...result.dependencies,
                    ...packageJson.dependencies
                };
            }

            if (packageJson.devDependencies) {
                result.devDependencies = {
                    ...result.devDependencies,
                    ...packageJson.devDependencies
                };
            }
        }
    });

    return result;
}

function composer() {
    const result = analyzePackages();
    const mainPackageJson = JSON.parse(fs.readFileSync(mainPackagePath, 'utf-8'));

    mainPackageJson.dependencies = {
        ...mainPackageJson.dependencies,
        ...result.dependencies
    };

    mainPackageJson.devDependencies = {
        ...mainPackageJson.devDependencies,
        ...result.devDependencies
    };

    fs.writeFileSync(mainPackagePath, JSON.stringify(mainPackageJson, null, 2));
    log('package.json is upgraded with new dependencies and aliases.', 'warning');

    _install();
}

function _install() {
    try {
        execSync('npm install', { stdio: 'inherit' });
        execSync('npm dedupe', { stdio: 'ignore' });
        
        log('npm dedupe/install success!\n', 'success');
    } catch (error) {
        console.log();
        log('npm dedupe error!\n', 'error');
    }
}

composer();
