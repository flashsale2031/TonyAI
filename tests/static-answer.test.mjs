import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../static-answer.js', import.meta.url), 'utf8');
const context = { URL, window: {} };
vm.runInNewContext(source, context);
const answers = context.window.TonyStaticAnswer;

const bing = `1.  ## [**Wikipedia — President of the United States**](https://en.wikipedia.org/wiki/President_of_the_United_States)\nThe president is the head of state.\n\n2.  ## [**The White House**](https://www.whitehouse.gov/)\nPresident Donald J. Trump is the 47th President of the United States.`;

test('parses fallback search results and prefers authoritative current sources', () => {
  const rows = answers.parse(bing);
  assert.equal(rows.length, 2);
  const ranked = answers.rankResults(rows, 'Who is the current president of the United States?');
  assert.equal(ranked[0].url, 'https://www.whitehouse.gov/');
});

test('extracts a direct answer instead of echoing an unrelated first snippet', () => {
  const rows = answers.parse(bing);
  const answer = answers.directAnswer('Who is the current president of the United States?', rows);
  assert.equal(answer.text, 'The current president is Donald J. Trump.');
  assert.equal(answer.source.url, 'https://www.whitehouse.gov/');
});

test('does not fabricate a direct answer when evidence is absent', () => {
  const rows = answers.parse('1.  ## [**Example**](https://example.com/)\nA general result.');
  assert.equal(answers.directAnswer('Who is the current president?', rows), null);
});
