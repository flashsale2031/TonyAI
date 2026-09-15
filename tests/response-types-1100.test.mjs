import test from 'node:test';
import assert from 'node:assert/strict';
import { RESPONSE_TYPES, classifyResponseType, extractAnswerForType, buildPageSearchProfile } from '../engine/response-types-runtime.js';
import { HUNDRED_BILLION_RESPONSE_TYPES } from '../engine/response-types-100b.js';

test('TonyAI exposes 100,111,111,100 virtual response types', () => {
  assert.equal(RESPONSE_TYPES.length, 100111111100);
  assert.equal(HUNDRED_BILLION_RESPONSE_TYPES.length, 100000000000);
});

test('100B response types are uniquely addressable without materializing the collection', () => {
  const a = HUNDRED_BILLION_RESPONSE_TYPES.get(0);
  const b = HUNDRED_BILLION_RESPONSE_TYPES.get(99999999999);
  const c = HUNDRED_BILLION_RESPONSE_TYPES.get(50000001234);
  assert.ok(a && b && c);
  assert.notEqual(a.id, b.id);
  assert.notEqual(a.id, c.id);
  assert.notEqual(b.id, c.id);
  assert.match(a.id, /^100b-/);
  assert.ok(a.characteristics.length > 0);
  assert.ok(a.searchProfile.length > 0);
});

test('temperature remains a Degrees response type', () => {
  const type = classifyResponseType("What's the temperature in Miami now?");
  assert.equal(type.unit, '°');
  assert.match(type.name, /Weather|Temperature/i);
});

test('100B contextual classification returns a concrete type with web-search characteristics', () => {
  const type = classifyResponseType('What is the latest official price of this product?');
  assert.match(type.id, /^100b-/);
  assert.ok(type.characteristics.includes('price'));
  assert.ok(type.searchProfile.length > 0);
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

test('generated 1,000,000-type expansion carries contextual search characteristics', () => {
  const type = RESPONSE_TYPES.find(item => /^million-/.test(item.id) && /Sports/.test(item.name) && /Schedule/.test(item.name) && /Verified/.test(item.name));
  assert.ok(type);
  assert.match(type.id, /^million-/);
  assert.ok(type.characteristics.includes('verified'));
  assert.ok(type.searchProfile.includes('confirmed'));
});

test('page search profile exposes type-specific web search signals', () => {
  const profile = buildPageSearchProfile('What is the current price of a product?');
  assert.ok(profile.type);
  assert.match(profile.type.id, /^100b-/);
  assert.ok(profile.searchTerms.length > 0);
  assert.ok(profile.signals.includes('price'));
});
