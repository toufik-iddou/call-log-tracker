const jwt = require('jsonwebtoken');

const tokenAdmin = jwt.sign({ userId: '5c0e1208-81ba-43be-ae6f-eebb47f63f54', role: 'ADMIN' }, process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_prod', { expiresIn: '1h' });
const tokenAgent = jwt.sign({ userId: 'ce59dbd1-29dd-4d57-972c-f49ec59a3129', role: 'AGENT' }, process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_prod', { expiresIn: '1h' });

async function runPingTest() {
  console.log('Sending first ping for agent ce59dbd1-29dd-4d57-972c-f49ec59a3129...');
  let res = await fetch('http://localhost:3000/api/agent/ping', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenAgent}` }
  });
  console.log('Ping 1:', await res.json());

  console.log('Fetching history as admin...');
  let histRes = await fetch('http://localhost:3000/api/agents/ce59dbd1-29dd-4d57-972c-f49ec59a3129/sessions', {
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  console.log('History:', JSON.stringify(await histRes.json(), null, 2));
}

runPingTest().catch(console.error);
