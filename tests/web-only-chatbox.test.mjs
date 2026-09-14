import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { chromium } from 'playwright';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function startStaticServer() {
  const server = createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(indexHtml);
      return;
    }
    if (req.url === '/api/search') {
      res.writeHead(503, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'test forces browser live-search fallback' }));
      return;
    }
    res.writeHead(404);
    res.end();
  });
  server.listen(0, '127.0.0.1');
  return server;
}

test('visible chatbox is web-search-only', () => {
  assert.doesNotMatch(indexHtml, /I received:/);
  assert.doesNotMatch(indexHtml, /Ask a question, request a rewrite, paste text to summarize/);
  assert.doesNotMatch(indexHtml, /function localAnswer\s*\(/);
  assert.doesNotMatch(indexHtml, /fetch\(\s*['\"]\/api\/chat['\"]/);
  assert.match(indexHtml, /fetch\(\s*['\"]\/api\/search['\"]/);
  assert.match(indexHtml, /r\.jina\.ai\/http:\/\/html\.duckduckgo\.com\/html/);
  assert.match(indexHtml, /verifiedSources/);
  assert.match(indexHtml, /No verified web answer was found\./);
});

test('chatbox submits a question and renders a live web result', { timeout: 30_000 }, async (t) => {
  const server = startStaticServer();
  await once(server, 'listening');
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  t.after(async () => {
    await browser.close();
    server.close();
  });

  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });

  const query = `TonyAI live web search smoke test ${Date.now()}`;
  await page.locator('#messageInput').fill(query);
  await page.locator('#sendButton').click();

  await page.waitForFunction(() => {
    const text = document.querySelector('#messages')?.innerText || '';
    return text.includes('Web searched') || text.includes('No verified web answer was found.');
  }, null, { timeout: 20_000 });

  const rendered = await page.locator('#messages').innerText();
  assert.match(rendered, /Web searched/);
  assert.doesNotMatch(rendered, /I received:/);
  assert.doesNotMatch(rendered, /Ask a question, request a rewrite/);
  assert.match(rendered, /TonyAI live web search smoke test/);
  assert.ok(await page.locator('#messages a[target="_blank"]').count() > 0, 'web result should include at least one source link');
});
