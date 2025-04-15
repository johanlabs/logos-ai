const https = require('https');
const fs = require('fs');

const app = require('./app');

const { log } = require('@utils/log');

const privateKeyPath = '/etc/letsencrypt/archive/johanself.cloud/privkey1.pem';
const certificatePath = '/etc/letsencrypt/archive/johanself.cloud/cert1.pem';
const caPath = '/etc/letsencrypt/archive/johanself.cloud/chain1.pem';

const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const certificate = fs.readFileSync(certificatePath, 'utf8');
const ca = fs.readFileSync(caPath, 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };
const port = process.env.PORT || 5040;

app
  .setup()
  .then(() => {
    https.createServer(credentials, app).listen(port, () => {
      log(`is ready in :${port}.\n`);
    });
  });
