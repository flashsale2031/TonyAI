import { RESPONSE_TYPES as BASE_CATALOG } from './response-types.js';
import { RESPONSE_TYPES as MEGA_TYPES } from './response-types-mega.js';
import { RESPONSE_TYPES as HUNDRED_K_TYPES } from './response-types-100k.js';
import { MILLION_RESPONSE_TYPES } from './response-types-million.js';
import { TEN_MILLION_RESPONSE_TYPES } from './response-types-10m.js';
import * as HUNDRED_M_TYPES_MODULE from './response-types-100m.js';
import { HUNDRED_BILLION_RESPONSE_TYPES } from './response-types-100b.js';

// Keep the live browser runtime independent of the stale legacy assertion.
const HUNDRED_MILLION_RESPONSE_TYPES = HUNDRED_M_TYPES_MODULE.HUNDRED_MILLION_RESPONSE_TYPES
  || HUNDRED_M_TYPES_MODULE.TEN_MILLION_RESPONSE_TYPES
  || { length: 0, get: () => undefined };

// The curated catalog must participate in classification. The generated mega
// catalog contains broad context terms such as "current" and can otherwise
// win over specific terms such as "president", "recipe", or "programming".
const BASE_TYPES = [...BASE_CATALOG, ...MEGA_TYPES, ...HUNDRED_K_TYPES];
const MILLION_COUNT = MILLION_RESPONSE_TYPES.length;
const BASE_COUNT = BASE_TYPES.length;
const TOTAL_COUNT = BASE_COUNT + MILLION_COUNT + TEN_MILLION_RESPONSE_TYPES.length
  + HUNDRED_MILLION_RESPONSE_TYPES.length + HUNDRED_BILLION_RESPONSE_TYPES.length;

export const RESPONSE_TYPES = {
  length: TOTAL_COUNT,
  get(index) {
    if (!Number.isInteger(index) || index < 0 || index >= TOTAL_COUNT) return undefined;
    if (index < BASE_COUNT) return BASE_TYPES[index];
    let i = index - BASE_COUNT;
    if (i < MILLION_COUNT) return MILLION_RESPONSE_TYPES.get(i);
    i -= MILLION_COUNT;
    if (i < TEN_MILLION_RESPONSE_TYPES.length) return TEN_MILLION_RESPONSE_TYPES.get(i);
    i -= TEN_MILLION_RESPONSE_TYPES.length;
    if (i < HUNDRED_MILLION_RESPONSE_TYPES.length) return HUNDRED_MILLION_RESPONSE_TYPES.get(i);
    return HUNDRED_BILLION_RESPONSE_TYPES.get(i);
  },
  find(predicate) {
    const limit = BASE_COUNT + MILLION_COUNT;
    for (let i = 0; i < limit; i++) {
      const type = this.get(i);
      if (type && predicate(type, i, this)) return type;
    }
    return undefined;
  },
  forEach(callback) {
    for (let i = 0; i < BASE_COUNT; i++) callback(this.get(i), i, this);
  }
};

export const RESPONSE_TYPE_COUNT = RESPONSE_TYPES.length;
export const FALLBACK_RESPONSE_TYPE = {
  id: 'generic-factual',
  name: 'General factual answer',
  keywords: [],
  characteristics: ['answer', 'fact', 'source', 'page'],
  unit: ''
};

const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
const has = (text, token) => {
  if (!token) return false;
  if (/[^a-z0-9]/i.test(token)) return text.toLowerCase().includes(token.toLowerCase());
  return new RegExp(`(^|[^a-z0-9])${escapeRegex(token)}([^a-z0-9]|$)`, 'i').test(text);
};

const ANCHOR_TYPES = BASE_TYPES;
const ANCHOR_INDEX = ANCHOR_TYPES.map(type => ({ type, keywords: (type.keywords || []).map(String) }));
const MEGA_ANCHOR_INDEX = new Map(MEGA_TYPES.map((type, index) => [type.id, index]));
const CONTEXT_SIGNALS = [
  ['current', ['current', 'now', 'today', 'latest']],
  ['official', ['official', 'authorized', 'published']],
  ['verified', ['verified', 'confirmed', 'validated']],
  ['local', ['local', 'nearby', 'regional']],
  ['historical', ['historical', 'history', 'background']],
  ['quantitative', ['number', 'count', 'price', 'rate', 'percentage', 'average', 'median']],
  ['comparison', ['compare', 'difference', 'versus', 'vs']],
  ['ranking', ['best', 'top', 'ranking']],
  ['schedule', ['schedule', 'date', 'time', 'when']],
  ['location', ['where', 'location', 'near']],
  ['process', ['how', 'steps', 'process']],
  ['evidence', ['evidence', 'source', 'citation', 'proof']]
];

function classifyAnchor(question) {
  let best = FALLBACK_RESPONSE_TYPE;
  let bestScore = 0;
  for (const entry of ANCHOR_INDEX) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (has(question, keyword)) score += keyword.length > 5 ? 3 : 2;
    }
    if (entry.type.id === 'temperature' && /temperature|degrees|°f|°c|fahrenheit|celsius|°/i.test(question)) score += 12;
    if (entry.type.id === 'time' && /what time|current time|time in/i.test(question)) score += 8;
    if (score > bestScore) {
      best = entry.type;
      bestScore = score;
    }
  }
  return { type: best, score: bestScore };
}

function chooseContext(question) {
  let best = { index: 0, score: 0 };
  for (let index = 0; index < CONTEXT_SIGNALS.length; index++) {
    const [, terms] = CONTEXT_SIGNALS[index];
    let score = 0;
    for (const term of terms) if (has(question, term)) score += term.length > 5 ? 3 : 2;
    if (score > best.score) best = { index, score };
  }
  return best;
}

function queryVariant(question) {
  let hash = 2166136261;
  for (const char of String(question)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0) % 10000000;
}

function generatedVariant(anchor, context, question) {
  const megaIndex = MEGA_ANCHOR_INDEX.get(anchor.id);
  if (megaIndex == null) return null;
  const contextIndex = (context.index * 7919 + queryVariant(question)) % 10000000;
  return HUNDRED_BILLION_RESPONSE_TYPES.get(megaIndex * 10000000 + contextIndex)
    || TEN_MILLION_RESPONSE_TYPES.get(megaIndex * (TEN_MILLION_RESPONSE_TYPES.length / MEGA_TYPES.length) + (contextIndex % 1000))
    || HUNDRED_MILLION_RESPONSE_TYPES.get(megaIndex * 10000 + (contextIndex % 10000));
}

export function classifyResponseType(question = '') {
  const q = String(question).toLowerCase();
  const anchor = classifyAnchor(q);
  const context = chooseContext(q);
  const variant = generatedVariant(anchor.type, context, q);
  return variant
    ? { ...variant, score: anchor.score + context.score, anchorType: anchor.type.id }
    : { ...anchor.type, score: anchor.score, anchorType: anchor.type.id };
}

function blocks(text) {
  return String(text || '').replace(/\r/g, '').split(/(?<=[.!?])\s+|\n+/)
    .map(value => value.replace(/\s+/g, ' ').trim())
    .filter(value => value.length >= 20 && value.length <= 900);
}

export function extractAnswerForType(text, question, type = classifyResponseType(question)) {
  const terms = String(question || '').toLowerCase().split(/[^a-z0-9°]+/).filter(value => value.length > 2);
  const source = String(text || '');
  const ranked = blocks(source).map((block, index) => {
    const lower = block.toLowerCase();
    const characteristicHits = (type.characteristics || []).filter(value => has(lower, value)).length;
    const questionHits = terms.filter(value => lower.includes(value)).length;
    const valueMatches = type.domain === 'weather' || type.id === 'temperature'
      ? (block.match(/[-+]?\d+(?:\.\d+)?\s*(?:°\s*[FCfc]|degrees?\s*(?:Fahrenheit|Celsius|F|C)?|Fahrenheit|Celsius)/g) || [])
      : [];
    return { block, index, score: characteristicHits * 6 + questionHits * 2 + valueMatches.length * 14, valueMatches };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.index - b.index);
  const selected = [];
  const seen = new Set();
  for (const item of ranked) {
    if (seen.has(item.block)) continue;
    seen.add(item.block);
    selected.push(item);
    if (selected.length === 8) break;
  }
  return {
    typeId: type.id,
    responseType: type.name,
    unit: type.unit || '',
    characteristics: (type.characteristics || []).filter(value => has(source.toLowerCase(), value)),
    valueMatches: selected.flatMap(item => item.valueMatches),
    facts: selected.map(item => item.block),
    matchScore: selected[0]?.score || 0
  };
}

export function buildPageSearchProfile(question = '') {
  const type = classifyResponseType(question);
  const characteristics = [...new Set(type.characteristics || [])];
  const searchTerms = [...new Set(type.searchProfile || characteristics)].slice(0, 24);
  return { query: String(question), type, characteristics, searchTerms, signals: searchTerms.join(' OR ') };
}
