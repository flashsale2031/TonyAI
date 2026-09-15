import test from 'node:test';
import assert from 'node:assert/strict';
import { RESPONSE_TYPES, classifyResponseType, extractAnswerForType, buildPageSearchProfile } from '../engine/response-types-runtime.js';

test('TonyAI exposes 111,100 response types', () => {
  assert.equal(RESPONSE_TYPES.length, 111100);
  assert.equal(new Set(RESPONSE_TYPES.map(type => type.id)).size, 111100);
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

test('generated 1,000-type extension carries page-search characteristics', () => {
  const type = RESPONSE_TYPES.find(item => item.id === 'ext-sports-schedule');
  assert.ok(type);
  assert.match(type.name, /Sports/);
  assert.match(type.name, /Schedule/);
  assert.ok(type.characteristics.includes('schedule'));
  assert.ok(type.searchProfile.includes('date'));
});

test('generated 10,000-type expansion carries unique search characteristics', () => {
  const type = RESPONSE_TYPES.find(item => item.id === 'mega-sports-schedule');
  assert.ok(type);
  assert.match(type.name, /Sports/);
  assert.match(type.name, /Schedule/);
  assert.ok(type.characteristics.includes('sports'));
  assert.ok(type.characteristics.includes('schedule'));
  assert.ok(type.searchProfile.includes('next'));
});

test('generated 100,000-type expansion carries unique characteristics', () => {
  const type = RESPONSE_TYPES.find(item => item.id === '100k-sports-schedule-verified');
  assert.ok(type);
  assert.match(type.name, /Sports/);
  assert.match(type.name, /Schedule/);
  assert.match(type.name, /Verified/);
  assert.ok(type.characteristics.includes('verified'));
  assert.ok(type.searchProfile.includes('confirmed'));
});

test('page search profile exposes type-specific web search signals', () => {
  const profile = buildPageSearchProfile('What is the current price of a product?');
  assert.ok(profile.type);
  assert.ok(profile.searchTerms.length > 0);
  assert.ok(profile.signals.includes('price'));
});
