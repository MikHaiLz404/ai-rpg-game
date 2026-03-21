const { OpenClawGameClient } = require('./src/lib/openclaw/client');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const url = process.env.OPENCLAW_GATEWAY_URL;
  const token = process.env.OPENCLAW_GATEWAY_TOKEN;
  console.log('Testing connection to:', url);
  const client = new OpenClawGameClient(url, token);
  try {
    await client.connect();
    console.log('SUCCESS: Connected and Authenticated');
    process.exit(0);
  } catch (err) {
    console.error('FAILED:', err.message);
    process.exit(1);
  }
}
test();
