import test from 'node:test';
import assert from 'node:assert/strict';
import { selectMostCredibleResponse, selectMostCredibleSource } from '../engine/credible-source.js';

test('selects the highest-scoring source', () => {
  const sources = [
    { title: 'Low credibility', url: 'https://example.com/low', score: { total: 44 } },
    { title: 'Most credible', url: 'https://example.gov/high', score: { total: 91 } },
    { title: 'Middle credibility', url: 'https://example.org/mid', score: { total: 72 } }
  ];
  assert.equal(selectMostCredibleSource(sources).title, 'Most credible');
});

test('returns only the most credible source and uses its response text', () => {
  const result = selectMostCredibleResponse({
    answer: 'Aggregate answer that should not be rendered.',
    results: [
      { title: 'Lower source', url: 'https://example.com/lower', snippet: 'Lower response', score: { total: 58 } },
      { title: 'Best source', url: 'https://example.gov/best', snippet: 'Most credible response', score: { total: 96 } }
    ],
    verifiedSources: []
  });

  assert.equal(result.answer, 'Most credible response');
  assert.equal(result.results.length, 1);
  assert.equal(result.verifiedSources.length, 1);
  assert.equal(result.selectedSource.title, 'Best source');
  assert.equal(result.selectedSource.score, 96);
});
