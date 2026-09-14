import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('visible chatbox is web-search-only', () => {
  assert.doesNotMatch(indexHtml, /I received:/);
  assert.doesNotMatch(indexHtml, /Ask a question, request a rewrite, paste text to summarize/);
  assert.doesNotMatch(indexHtml, /function localAnswer\s*\(/);
  assert.doesNotMatch(indexHtml, /fetch\(['\"]\/api\/chat['\"]\)/);
  assert.match(indexHtml, /fetch\(['\"]\/api\/search['\"]\)/);
  assert.match(indexHtml, /r\.jina\.ai\/http:\/\/html\.duckduckgo\.com\/html/);
  assert.match(indexHtml, /verifiedSources/);
  assert.match(indexHtml, /No verified web answer was found\./);
});
