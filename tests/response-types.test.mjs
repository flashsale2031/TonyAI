import test from 'node:test';
import assert from 'node:assert/strict';
import { RESPONSE_TYPES, classifyResponseType, extractAnswerForType } from '../engine/response-types-runtime.js';

test('exposes exactly 100 active response types', () => {
  assert.equal(RESPONSE_TYPES.length, 100);
  assert.equal(new Set(RESPONSE_TYPES.map(type => type.id)).size, 100);
});

test('classifies temperature questions as degrees response type', () => {
  const type = classifyResponseType("What's the temperature in Miami now?");
  assert.equal(type.id, 'temperature');
  assert.equal(type.unit, '°');
  assert.ok(type.characteristics.includes('degrees'));
});

test('searches temperature page text for degree values', () => {
  const type = classifyResponseType('What is the temperature in Miami?');
  const result = extractAnswerForType(
    'Miami Current Weather. Current temperature is 84°F. Feels like 88°F. High 86°F and low 78°F.',
    'What is the temperature in Miami?',
    type
  );
  assert.equal(result.responseType, 'Temperature');
  assert.ok(result.valueMatches.includes('84°F'));
  assert.ok(result.valueMatches.includes('88°F'));
  assert.ok(result.facts.some(fact => fact.includes('84°F')));
});

test('uses response characteristics instead of returning search-result metadata', () => {
  const type = classifyResponseType('What is the price of this product?');
  const result = extractAnswerForType(
    'Product page. Regular price $129.99. Sale price $99.99. Shipping is free.',
    'What is the price of this product?',
    type
  );
  assert.equal(type.id, 'price');
  assert.ok(result.facts.some(fact => /price|sale/i.test(fact)));
  assert.ok(result.facts.some(fact => /\$99\.99|\$129\.99/.test(fact)));
});
