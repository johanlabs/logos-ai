const app = require('./app');

const { log } = require('@utils/log');

app
  .setup()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      log(`is ready.\n`);
    });
  });
