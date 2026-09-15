import test from 'node:test';
import assert from 'node:assert/strict';
import { RESPONSE_TYPES, classifyResponseType, extractAnswerForType } from '../engine/response-types-runtime.js';

test('TonyAI exposes 1100 response types', () => {
  assert.equal(RESPONSE_TYPES.length, 1100);
  assert.equal(new Set(RESPONSE_TYPES.map(type => type.id)).size, 1100);
});

test('temperature remains a Degrees response type', () => {
  const type = classifyResponseType("What's the temperature in Miami now?");
  assert.equal(type.id, 'temperature');
  assert.equal(type.unit, '°');
});

test('page extraction prioritizes characteristics for a specialized type', () => {
  const type = classifyResponseType('What is the current price of a product?');
  const result = extractAnswerForType(
    'Product overview. The current price is $49.99. The item is available in stock. It has a two-year warranty.',
    'What is the current price of a product?',
    type
  );
  assert.ok(result.facts.some(fact => /\$49\.99/.test(fact)));
  assert.ok(result.characteristics.length > 0);
});

test('generated domain-intent types carry page-search characteristics', () => {
  const type = RESPONSE_TYPES.find(item => item.id === 'ext-sports-schedule');
  assert.ok(type);
  assert.match(type.name, /Sports/);
  assert.match(type.name, /Schedule/);
  assert.ok(type.characteristics.includes('schedule'));
  assert.ok(type.searchProfile.includes('date'));
});
