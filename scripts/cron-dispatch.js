const http = require('http');

const cronSecret = process.env.CRON_SECRET || 'dev_cron_secret';
const host = process.env.API_HOST || 'localhost';
const port = process.env.API_PORT || 3000;

console.log(`[Cron Dispatcher] Triggering call dispatch at http://${host}:${port}/api/cron/dispatch-calls...`);

const options = {
  hostname: host,
  port: port,
  path: '/api/cron/dispatch-calls',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${cronSecret}`
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`[Cron Dispatcher] Response status: ${res.statusCode}`);
    console.log(`[Cron Dispatcher] Body: ${body}`);
  });
});

req.on('error', (err) => {
  console.error(`[Cron Dispatcher] Error: ${err.message}`);
});

req.end();
