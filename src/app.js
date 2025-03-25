require('module-alias/register');

const express = require('express');

const { registerPackages } = require('@core/register');
const { log } = require('@utils/log');

const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.setup = async () => {
  try {
    await registerPackages(app);
  } catch (error) {
    log(`Error registering packages: ${error.message}`, 'error');
  }
};

module.exports = app;
