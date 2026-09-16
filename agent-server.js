import http from 'node:http';
import { executeAgent } from './engine/agent-execution.js';

const port = Number(process.env.AGENT_PORT || 8787);
function send(res, status, body) {
  const data = Buffer.from(JSON.stringify(body));
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': data.length, 'cache-control': 'no-store' });
  res.end(data);
}
async function parseBody(req) {
  let text = '';
  for await (const chunk of req) text += chunk;
  if (text.length > 200_000) throw new Error('Request too large');
  return text ? JSON.parse(text) : {};
}
const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== 'POST' || req.url !== '/execute') return send(res, 404, { error: 'Not found' });
    const result = await executeAgent(await parseBody(req), req.headers.authorization || '');
    return send(res, result.status, result.body);
  } catch (error) {
    return send(res, 400, { error: String(error?.message || error) });
  }
});
server.listen(port, () => console.log(`TonyAI agent server listening on port ${port}`));
