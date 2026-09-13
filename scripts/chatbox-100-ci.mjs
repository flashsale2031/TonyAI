import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const BASE = process.env.TONYAI_TEST_BASE || 'http://127.0.0.1:3000';
const SOURCE = fs.readFileSync(new URL('./chatbox-100-live.mjs', import.meta.url), 'utf8');
const match = SOURCE.match(/const questions\s*=\s*(\[[\s\S]*?\])\s*;\s*assert/);
if (!match) throw new Error('Could not extract the canonical 100-question suite');
const questions = Function(`return (${match[1]})`)();
if (!Array.isArray(questions) || questions.length !== 100) throw new Error(`Expected exactly 100 questions, got ${questions.length}`);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const waitForServer = async () => {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(1500) });
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('TonyAI server did not become ready within 30 seconds');
};

const words = text => String(text).toLowerCase().match(/[a-z0-9]+/g) || [];
const validateAnswer = (question, answer) => {
  const q = String(question).trim().toLowerCase();
  const a = String(answer).trim().toLowerCase();
  if (a.length < 12) return 'answer is too short';
  if (/live search unavailable|search unavailable|unable to search|no results available/.test(a)) return 'search failure text returned';
  if (/\bwhat is 2\s*\+\s*2\b/.test(q) && !/\b4\b/.test(a)) return '2+2 answer missing';
  if (/\bwhat is 10\s*\*\s*10\b/.test(q) && !/\b100\b/.test(a)) return '10*10 answer missing';
  if (/\bwhat is 15\s*[-+]\s*7\b/.test(q) && !/\b8\b/.test(a)) return '15-7 answer missing';
  if (/\bwhat is 12\s*\/\s*3\b/.test(q) && !/\b4\b/.test(a)) return '12/3 answer missing';
  const candidates = words(question).filter(w => w.length >= 4 && !new Set(['what','does','this','that','with','from','does','have','into','when','where','which','about','explain','define','difference','between','should','would','could','there','their']).has(w));
  if (candidates.length && !candidates.some(w => a.includes(w))) return 'answer does not contain a meaningful query term';
  return null;
};

const server = spawn(process.execPath, ['server.js'], { cwd: process.cwd(), stdio: 'inherit', env: { ...process.env, PORT: '3000' } });
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  context.setDefaultTimeout(10_000);
  context.setDefaultNavigationTimeout(15_000);

  // Verify the real Duck.ai destination without making CI depend on Duck.ai's
  // current frontend/network state. Context routing also covers popup pages.
  const duckPages = new Set();
  await context.route('https://duck.ai/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>Duck.ai CI</title><main>Duck.ai CI destination captured.</main>'
    });
  });
  context.on('page', page => {
    duckPages.add(page);
    page.on('framenavigated', () => duckPages.add(page));
  });

  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  const composer = page.locator('#composer');
  const send = page.getByRole('button', { name: /send message/i });
  await composer.waitFor({ state: 'visible' });
  await send.waitFor({ state: 'visible' });

  let passed = 0;
  for (let index = 0; index < questions.length; index += 1) {
    const question = String(questions[index]);
    const expectedDuck = new URL('https://duck.ai/chat');
    expectedDuck.searchParams.set('prompt', '1');
    expectedDuck.searchParams.set('q', question);

    const beforeRows = await page.locator('[data-chatresponse]').count();
    const beforePages = new Set(context.pages());
    await composer.fill(question);
    await send.click();

    await page.waitForFunction(
      ({ selector, count }) => document.querySelectorAll(selector).length > count,
      { selector: '[data-chatresponse]', count: beforeRows }
    );

    const row = page.locator('[data-chatresponse]').last();
    await row.waitFor({ state: 'visible' });
    await row.locator('[data-chatresponse-status]').waitFor({ state: 'detached', timeout: 8_000 }).catch(() => {});
    const rendered = (await row.innerText()).trim();
    const answerError = validateAnswer(question, rendered);
    if (answerError) throw new Error(`Question ${index + 1}/100 failed answer validation: ${answerError}\nQ: ${question}\nA: ${rendered}`);

    let duckUrl = null;
    const deadline = Date.now() + 3_000;
    while (Date.now() < deadline && !duckUrl) {
      for (const candidate of context.pages()) {
        if (beforePages.has(candidate)) continue;
        const url = candidate.url();
        if (url.startsWith('https://duck.ai/')) duckUrl = url;
      }
      if (!duckUrl) await sleep(50);
    }
    if (!duckUrl) throw new Error(`Question ${index + 1}/100 did not open Duck.ai`);
    const actual = new URL(duckUrl);
    if (actual.origin !== expectedDuck.origin || actual.pathname !== expectedDuck.pathname || actual.searchParams.get('q') !== question || actual.searchParams.get('prompt') !== '1') {
      throw new Error(`Question ${index + 1}/100 injected the wrong Duck.ai URL: ${duckUrl}`);
    }

    for (const candidate of context.pages()) {
      if (!beforePages.has(candidate) && candidate !== page) await candidate.close().catch(() => {});
    }
    passed += 1;
    process.stdout.write(`DUCKAI_TEST ${passed}/100 PASS\n`);
  }

  if (passed !== 100) throw new Error(`Expected 100/100, got ${passed}/100`);
  console.log('DUCKAI_TEST_RESULT 100/100 PASS');
  await context.close();
} finally {
  await browser?.close().catch(() => {});
  server.kill('SIGTERM');
  await sleep(250);
  if (!server.killed) server.kill('SIGKILL');
}
