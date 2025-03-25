const fs = require('fs');
const path = require('path');

const simpleGit = require('simple-git');

const { log } = require('../utils/log');

async function getPackage(folderName) {
  try {
    const pluginsPath = path.join(__dirname, '..', 'packages');
    const manifestPath = path.join(pluginsPath, folderName, 'package.json');
    
    let manifest = {};
    
    try {
      if (fs.existsSync(manifestPath)) {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      }
    } catch (error) {
      console.error(`Manifest not found in ${folderName}:`, error);
      throw new Error(`Manifest not found in folder ${folderName}`);
    }

    return {
      ...manifest,
      folder: folderName,
    };
  } catch (error) {
    throw error;
  }
}

async function getPackages() {
  try {
    const pluginsPath = path.join(__dirname, '..', 'packages');
    const pluginFolders = fs.readdirSync(pluginsPath).filter(f => fs.statSync(path.join(pluginsPath, f)).isDirectory());

    const folderPackages = await Promise.all(pluginFolders.map(async folderName => {
      return await getPackage(folderName);
    }));

    return folderPackages;
  } catch (error) {
    throw error;
  }
}

const extractManifest = (packagePath) => {
  const manifestPath = path.join(packagePath, 'package.json');

  if (!fs.existsSync(manifestPath)) {
    fs.rmdirSync(packagePath, { recursive: true });

    throw new Error('O arquivo package.json não foi encontrado no package.');
  }

  const manifestContent = fs.readFileSync(manifestPath, 'utf8');

  return JSON.parse(manifestContent);
};

const createPackage = async (repoUrl) => {
  try {
    const repoName = repoUrl.split('/').pop().replace(/\.git$/, '');

    const packagePath = path.join(__dirname, '..', 'packages', repoName);

    await simpleGit()
      .clone(repoUrl, packagePath);

    const manifest = extractManifest(packagePath);

    if (!manifest.name) {
      throw new Error('O manifesto deve conter os campos "name" e "description".');
    }

    return manifest;
  } catch (error) {
    throw error;
  }
};

const registerPackage = async (app, package) => {
  const packageDir = path.join(__dirname, '..', 'packages', package.folder);
  const manifestPath = path.join(packageDir, 'package.json');
  package.dir = packageDir;

  try {
      if (!fs.existsSync(manifestPath)) {
          log(`${package.folder} missing package.json\n`, 'error');
          return;
      }

      if (!fs.existsSync(path.join(packageDir, 'routes.js'))) {
          log(`${package.name} missing routes.js\n`, 'error');
          return;
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const usePackage = manifest.entry ? require(path.join(packageDir, manifest.entry)) : () => { };

      if (typeof usePackage !== 'function') {
          log(`${package.name} invalid entry point. Expected a function.`, 'error');
          return;
      }

      const packg = usePackage(app) ?? usePackage;
      packg?.setup && packg.setup();

      log(`${package.name} ${package.version ? `version ${package.version}` : ''} is running.\n`, 'blue');
  } catch (error) {
      log(`Error with package ${package.name}: ${error.message}`, 'error');
      log(`${package.name} ${package.version ? `version ${package.version}` : ''} isn't running.\n`, 'error');
  }
};

module.exports = { createPackage, getPackage, getPackages, registerPackage };