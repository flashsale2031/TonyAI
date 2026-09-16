import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { chromium } from 'playwright';
const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
test('GitHub plugin connects through the authenticated agent connector', { timeout: 30_000 }, async t => {
  const server = createServer((req, res) => {
    if (req.url === '/api/capabilities') { res.writeHead(200, {'content-type':'application/json'}); res.end(JSON.stringify({githubConnector:true, githubConfigured:true})); return; }
    if (req.url === '/api/agent') { res.writeHead(200, {'content-type':'application/json'}); res.end(JSON.stringify({ok:true, content:'README connector verification'})); return; }
    res.writeHead(200, {'content-type': req.url.endsWith('.js') ? 'text/javascript' : 'text/html'}); res.end(req.url.endsWith('.js') ? '' : indexHtml);
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const browser = await chromium.launch({headless:true}); t.after(() => { browser.close(); server.close(); });
  const page = await browser.newPage(); await page.goto(`http://127.0.0.1:${server.address().port}/`, {waitUntil:'domcontentloaded'});
  await page.locator('#menuToggle').click(); await page.locator('#pluginsButton').click();
  const card = page.locator('[data-plugin="github"]'); await card.locator('.plugin-connect').click();
  await page.waitForFunction(() => document.querySelector('[data-plugin="github"] .plugin-status')?.textContent.includes('Connected through GitHub connector'));
  assert.equal(await card.locator('.plugin-use:disabled').count(), 0);
  assert.match(await card.locator('.plugin-connect').innerText(), /Connected/);
});
