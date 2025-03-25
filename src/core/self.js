const path = require('path');
const fs = require('fs');

const getAppPackage = (startDir = __dirname) => {
  let currentDir = startDir;

  if (currentDir.startsWith('file://')) {
    currentDir = new URL(currentDir).pathname;
  }

  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    }
    
    currentDir = path.resolve(currentDir, '..');
  }

  return null;
};

module.exports = { getAppPackage }