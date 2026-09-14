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

test('uses detailed claims from the selected credible webpage', () => {
  const result = selectMostCredibleResponse({
    answer: 'Aggregate answer that should not be rendered.',
    pages: [
      {
        title: 'Best source page',
        url: 'https://example.gov/best',
        claims: ['The authoritative page states the first supported fact.', 'The same page provides a second supported fact.'],
        score: { total: 96 }
      }
    ],
    results: [
      { title: 'Lower source', url: 'https://example.com/lower', snippet: 'Lower response', score: { total: 58 } },
      { title: 'Best source', url: 'https://example.gov/best', snippet: 'Search snippet only', score: { total: 96 } }
    ],
    verifiedSources: []
  });

  assert.match(result.answer, /first supported fact/);
  assert.match(result.answer, /second supported fact/);
  assert.equal(result.results.length, 1);
  assert.equal(result.verifiedSources.length, 1);
  assert.equal(result.selectedSource.title, 'Best source page');
  assert.equal(result.selectedSource.score, 96);
  assert.equal(result.selectedSource.contentMode, 'detailed-source-claims');
});
