import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const BASE = process.env.TONYAI_TEST_BASE || 'http://127.0.0.1:3000';
const source = fs.readFileSync(new URL('./chatbox-100-live.mjs', import.meta.url), 'utf8');
const declaration = source.indexOf('const questions');
if (declaration < 0) throw new Error('Canonical question declaration was not found');
const arrayStart = source.indexOf('[', declaration);
if (arrayStart < 0) throw new Error('Canonical question array was not found');
function matchingArrayEnd(text, start) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '/' && next === '/') { const end = text.indexOf('\n', i + 2); i = end < 0 ? text.length : end; continue; }
    if (ch === '/' && next === '*') { const end = text.indexOf('*/', i + 2); i = end < 0 ? text.length : end + 1; continue; }
    if (ch === '[') depth += 1;
    if (ch === ']') { depth -= 1; if (depth === 0) return i; }
  }
  return -1;
}
const arrayEnd = matchingArrayEnd(source, arrayStart);
if (arrayEnd < 0) throw new Error('Canonical question array did not terminate');
const questions = Function(`return (${source.slice(arrayStart, arrayEnd + 1)})`)();
if (!Array.isArray(questions) || questions.length !== 100) throw new Error(`Expected exactly 100 canonical questions, got ${questions.length}`);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(1200) });
      if (response.ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error('TonyAI server did not become ready within 30 seconds');
}

const ignored = new Set(['what','does','this','that','with','from','into','when','where','which','about','explain','define','difference','between','should','would','could','there','their','than','then','have','your','will','most','some','used','using','make','more','less']);
const words = text => String(text).toLowerCase().match(/[a-z0-9]+/g) || [];
function validateAnswer(question, answer) {
  const q = String(question).trim().toLowerCase();
  const a = String(answer).trim().toLowerCase();
  if (a.length < 12) return 'answer is too short';
  if (/live search unavailable|search unavailable|unable to search|no results available/.test(a)) return 'search failure text returned';
  const arithmetic = [[/\bwhat is 2\s*\+\s*2\b/, /\b4\b/, '2+2'],[/\bwhat is 10\s*\*\s*10\b/, /\b100\b/, '10*10'],[/\bwhat is 15\s*[-+]\s*7\b/, /\b8\b/, '15-7'],[/\bwhat is 12\s*\/\s*3\b/, /\b4\b/, '12/3']];
  for (const [pattern, expected, label] of arithmetic) if (pattern.test(q) && !expected.test(a)) return `${label} answer missing`;
  const candidates = [...new Set(words(question).filter(w => w.length >= 4 && !ignored.has(w)))];
  if (candidates.length && !candidates.some(w => a.includes(w))) return 'answer has no meaningful overlap with the question';
  return null;
}

const server = spawn(process.execPath, ['server.js'], { cwd: process.cwd(), stdio: 'inherit', env: { ...process.env, PORT: '3000' } });
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  context.setDefaultTimeout(12_000);
  context.setDefaultNavigationTimeout(15_000);
  await context.route('https://duck.ai/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Duck.ai CI</title><main>Duck.ai CI destination captured.</main>' }));

  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  const composer = page.locator('#composer');
  const send = page.getByRole('button', { name: /send message/i });
  await composer.waitFor({ state: 'visible' });
  await send.waitFor({ state: 'visible' });

  let passed = 0;
  for (let index = 0; index < questions.length; index += 1) {
    const question = String(questions[index]);
    const beforePages = new Set(context.pages());
    const beforeRows = await page.locator('[data-chatresponse]').count();
    await composer.fill(question);
    await send.click();
    await page.waitForFunction(({ count }) => document.querySelectorAll('[data-chatresponse]').length > count, { count: beforeRows });
    const row = page.locator('[data-chatresponse]').last();
    await row.waitFor({ state: 'visible' });
    await row.locator('[data-chatresponse-status]').waitFor({ state: 'detached', timeout: 8_000 }).catch(() => {});
    const answer = (await row.innerText()).trim();
    const error = validateAnswer(question, answer);
    if (error) throw new Error(`Question ${index + 1}/100 answer validation failed: ${error}\nQ: ${question}\nA: ${answer}`);

    let duckUrl = null;
    const deadline = Date.now() + 3_500;
    while (Date.now() < deadline && !duckUrl) {
      for (const candidate of context.pages()) {
        if (beforePages.has(candidate)) continue;
        const url = candidate.url();
        if (url.startsWith('https://duck.ai/')) duckUrl = url;
      }
      if (!duckUrl) await sleep(50);
    }
    if (!duckUrl) throw new Error(`Question ${index + 1}/100 did not navigate to Duck.ai`);
    const actual = new URL(duckUrl);
    const injected = actual.searchParams.get('q');
    const prompt = actual.searchParams.get('prompt');
    if (actual.origin !== 'https://duck.ai' || !['/','/chat'].includes(actual.pathname) || injected !== question || (prompt !== null && prompt !== '1')) throw new Error(`Question ${index + 1}/100 has incorrect Duck.ai injection: ${duckUrl}`);

    for (const candidate of context.pages()) if (!beforePages.has(candidate) && candidate !== page) await candidate.close().catch(() => {});
    passed += 1;
    console.log(`DUCKAI_TEST ${passed}/100 PASS`);
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
