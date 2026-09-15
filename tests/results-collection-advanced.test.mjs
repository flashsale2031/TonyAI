import test from 'node:test';
import assert from 'node:assert/strict';
import { ResultsCollection, buildResultRecord } from '../engine/results-collection.js';

const profile = {
  query: 'current price product',
  type: { id: 'test-price', name: 'Retail — Price', characteristics: ['price', 'availability'] },
  characteristics: ['price', 'availability'],
  searchTerms: ['current price', 'availability']
};

const pages = [
  {
    url: 'https://shop.example.test/item/',
    title: 'Product | $49.99',
    description: 'Current price and availability.',
    facts: ['Current price is $49.99.', 'The product is available.'],
    code: '<script>alert(1)</script>\n```javascript\nunsafe();\n```',
    language: 'javascript',
    published: '2026-09-10'
  },
  {
    url: 'https://www.example.gov/product',
    title: 'Official product pricing',
    description: 'Official current price information.',
    facts: ['The current price is $49.99.', 'Availability is confirmed.'],
    published: '2026-09-12'
  },
  {
    url: 'https://other.example.test/product',
    title: 'Unrelated page',
    description: 'Background information.',
    facts: ['This page contains general background information.']
  }
];

test('collection creates one deterministic document from webpage data', () => {
  const collection = new ResultsCollection('current price product', { profile, limit: 8 });
  collection.collect(pages);
  const document = collection.document();
  assert.equal(document.format, 'markdown');
  assert.equal(document.recordCount, 3);
  assert.match(document.text, /^# TonyAI Web Results Collection/);
  assert.match(document.text, /Current price is \$49\.99/);
});

test('collection deduplicates normalized URLs and keeps the richer record', () => {
  const collection = new ResultsCollection('current price product', { profile });
  collection.collect([
    pages[0],
    { ...pages[0], url: 'https://shop.example.test/item/#tracking', facts: [...pages[0].facts, 'Extra verified fact.'] }
  ]);
  assert.equal(collection.results.size, 1);
  assert.ok(collection.top()[0].facts.includes('Extra verified fact.'));
});

test('collection orders strong profile matches and authoritative sources', () => {
  const collection = new ResultsCollection('current price product', { profile });
  collection.collect(pages);
  const ordered = collection.ordered();
  assert.equal(ordered[0].domain, 'example.gov');
  assert.ok(ordered[0].relevance >= ordered[1].relevance);
});

test('collection organizes and rebuilds without losing normalization', () => {
  const collection = new ResultsCollection('current price product', { profile });
  collection.collect(pages);
  const groups = collection.organize();
  assert.ok(groups.some(group => group.domain === 'example.gov'));
  collection.rebuildFrom([pages[1]]);
  assert.equal(collection.results.size, 1);
  assert.equal(collection.top()[0].domain, 'example.gov');
});

test('rendered collected code cannot terminate the document code fence', () => {
  const collection = new ResultsCollection('current price product', { profile });
  collection.collect([pages[0]]);
  const text = collection.document().text;
  assert.match(text, /Code \(javascript\):/);
  assert.doesNotMatch(text, /```javascript\nunsafe\(\);\n```/);
  assert.match(text, /` ` `javascript/);
});

test('control characters and replacement characters are removed from collected data', () => {
  const record = buildResultRecord({
    url: 'https://example.test/x',
    title: 'Bad\u0000 title\uFFFD',
    description: 'Safe\u0007 description',
    facts: ['Fact\u001b with control']
  }, profile);
  assert.doesNotMatch(record.title, /[\u0000-\u001F\u007F\uFFFD]/);
  assert.doesNotMatch(record.description, /[\u0000-\u001F\u007F\uFFFD]/);
});

test('document serialization remains data-only for HTML and script-like source text', () => {
  const collection = new ResultsCollection('current price product', { profile });
  collection.collect([{
    url: 'https://example.test/unsafe',
    title: '<script>throw new Error(\"x\")</script>',
    description: '<img src=x onerror=alert(1)>',
    facts: ['</div><script>alert(1)</script>', 'javascript:alert(2)']
  }]);
  const text = collection.document().text;
  assert.match(text, /\\<script\\>/);
  assert.match(text, /\\<img/);
  assert.match(text, /javascript:alert/);
});

test('JSON output contains document, ordered results, and organized groups', () => {
  const collection = new ResultsCollection('current price product', { profile });
  collection.collect(pages);
  const output = collection.toJSON();
  assert.ok(Array.isArray(output.results));
  assert.ok(Array.isArray(output.organized));
  assert.equal(output.document.format, 'markdown');
  assert.equal(output.document.recordCount, output.results.length);
});
