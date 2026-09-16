import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { chromium } from 'playwright';
const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
test('Plugins opens, connects a plugin, and inserts its chat prompt', { timeout: 30_000 }, async t => {
  const server = createServer((req, res) => { res.writeHead(200, {'content-type': req.url.endsWith('.js') ? 'text/javascript' : 'text/html'}); res.end(req.url.endsWith('.js') ? '' : indexHtml); });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const browser = await chromium.launch({headless:true}); t.after(() => { browser.close(); server.close(); });
  const page = await browser.newPage(); await page.goto(`http://127.0.0.1:${server.address().port}/`, {waitUntil:'domcontentloaded'});
  await page.locator('#menuToggle').click(); await page.locator('#pluginsButton').click(); assert.equal(await page.locator('#pluginModal.open').count(), 1);
  const card = page.locator('[data-plugin="web-search"]'); await card.locator('.plugin-connect').click();
  assert.equal(await card.locator('.plugin-use:disabled').count(), 0); assert.match(await card.locator('.plugin-status').innerText(), /Ready/);
  await card.locator('.plugin-use').click(); assert.equal(await page.locator('#pluginModal.open').count(), 0); assert.equal(await page.locator('#input').inputValue(), 'Search the web for: ');
});
