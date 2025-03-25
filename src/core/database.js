const { PrismaClient } = require('@database/client');

async function getDatabase() {
  return new PrismaClient();
}

module.exports = { getDatabase };