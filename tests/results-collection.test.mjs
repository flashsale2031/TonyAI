import test from 'node:test';
import assert from 'node:assert/strict';
import { ResultsCollection, buildResultRecord } from '../engine/results-collection.js';

const profile = {
  query: 'current JavaScript price',
  type: { id: 'test-type', name: 'Technology — Price', characteristics: ['javascript', 'price'] },
  characteristics: ['javascript', 'price'],
  searchTerms: ['javascript', 'price']
};

test('results collection deduplicates and orders matching pages', () => {
  const collection = new ResultsCollection('current JavaScript price', { profile, limit: 8 });
  collection.collect([
    { url: 'https://example.com/a#section', title: 'JavaScript price', description: 'A current JavaScript price is $20.' },
    { url: 'https://example.com/a', title: 'JavaScript price updated', description: 'A current JavaScript price is $20.', facts: ['Price: $20'] },
    { url: 'https://example.org/b', title: 'Unrelated page', description: 'A page about gardening.' }
  ]);
  assert.equal(collection.results.size, 2);
  assert.equal(collection.top(1)[0].url, 'https://example.com/a');
  assert.ok(collection.top(1)[0].profileMatch >= 50);
});

test('collection rebuilds and organizes by domain', () => {
  const collection = new ResultsCollection('current JavaScript price', { profile });
  collection.collect([
    { url: 'https://example.com/a', title: 'A', facts: ['JavaScript price is $20.'] },
    { url: 'https://example.org/b', title: 'B', facts: ['JavaScript price is $30.'] }
  ]);
  const before = collection.revision;
  collection.rebuildFrom([{ url: 'https://example.net/c', title: 'C', facts: ['JavaScript price is $40.'] }]);
  assert.ok(collection.revision > before);
  assert.deepEqual(collection.organize().map(group => group.domain), ['example.net']);
});

test('document escapes markdown metacharacters and safely fences webpage code', () => {
  const collection = new ResultsCollection('code', {
    profile: { ...profile, query: 'code', type: { ...profile.type, name: 'Code — Direct' } }
  });
  collection.collect([{
    url: 'https://example.com/code',
    title: 'Bad * title [test]',
    description: 'A page containing code.',
    code: 'const value = `hello`;\n```not-a-document-fence```',
    language: 'JavaScript'
  }]);
  const document = collection.document();
  assert.equal(document.format, 'markdown');
  assert.match(document.text, /\\\* title/);
  assert.match(document.text, /```javascript/);
  assert.doesNotMatch(document.text, /```not-a-document-fence```/);
  assert.match(document.text, /` ` `/);
  assert.ok(document.text.length < 240000);
});

test('buildResultRecord never renders control characters as document data', () => {
  const record = buildResultRecord({
    url: 'https://example.com',
    title: 'Hello\u0000World',
    facts: ['Line\u0001 with data']
  }, profile);
  assert.equal(record.title, 'Hello World');
  assert.equal(record.facts[0], 'Line with data');
});

test('JSON serialization includes one rebuilt document and structured records', () => {
  const collection = new ResultsCollection('current JavaScript price', { profile });
  collection.collect([{ url: 'https://example.com/a', title: 'A', facts: ['JavaScript price is $20.'] }]);
  const json = collection.toJSON();
  assert.equal(json.document.recordCount, 1);
  assert.equal(json.results.length, 1);
  assert.equal(json.organized.length, 1);
  assert.equal(typeof json.document.text, 'string');
});
