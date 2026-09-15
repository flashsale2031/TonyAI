import { RESPONSE_TYPES as EXTENDED_TYPES } from './response-types-extended.js';
import { RESPONSE_TYPES as MEGA_TYPES } from './response-types-mega.js';
import { RESPONSE_TYPES as HUNDRED_K_TYPES } from './response-types-100k.js';
import { MILLION_RESPONSE_TYPES, CONTEXTS as MILLION_CONTEXTS } from './response-types-million.js';
import { TEN_MILLION_RESPONSE_TYPES, CONTEXTS as TEN_MILLION_CONTEXTS } from './response-types-10m.js';
import { TEN_MILLION_RESPONSE_TYPES as HUNDRED_MILLION_TYPES } from './response-types-100m.js';

const BASE_TYPES = [
  ...EXTENDED_TYPES,
  ...MEGA_TYPES.filter(type => !EXTENDED_TYPES.some(existing => existing.id === type.id)),
  ...HUNDRED_K_TYPES,
  ...MILLION_RESPONSE_TYPES
];
const TEN_MILLION_COUNT = TEN_MILLION_RESPONSE_TYPES.length;
const HUNDRED_MILLION_COUNT = HUNDRED_MILLION_TYPES.length;
const TOTAL_COUNT = BASE_TYPES.length + TEN_MILLION_COUNT + HUNDRED_MILLION_COUNT;

// Virtual array-like response-type collection. The 100M layer is generated on
// demand, preventing 100M objects from being allocated in the browser.
export const RESPONSE_TYPES = {
  length: TOTAL_COUNT,
  get(index) {
    if (!Number.isInteger(index) || index < 0 || index >= TOTAL_COUNT) return undefined;
    if (index < BASE_TYPES.length) return BASE_TYPES[index];
    const tenIndex = index - BASE_TYPES.length;
    if (tenIndex < TEN_MILLION_COUNT) return TEN_MILLION_RESPONSE_TYPES.get(tenIndex);
    return HUNDRED_MILLION_TYPES.get(tenIndex - TEN_MILLION_COUNT);
  },
  find(predicate) {
    for (let index = 0; index < TOTAL_COUNT; index += 1) {
      const type = this.get(index);
      if (type && predicate(type, index, this)) return type;
    }
    return undefined;
  },
  forEach(callback) {
    for (let index = 0; index < TOTAL_COUNT; index += 1) callback(this.get(index), index, this);
  }
};
export const RESPONSE_TYPE_COUNT = RESPONSE_TYPES.length;
export const FALLBACK_RESPONSE_TYPE = {
  id: 'generic-factual', name: 'General factual answer', keywords: [],
  characteristics: ['answer', 'fact', 'source', 'page'], unit: ''
};

const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (text, token) => {
  if (!token) return false;
  if (/[^a-z0-9]/i.test(token)) return text.toLowerCase().includes(token.toLowerCase());
  return new RegExp(`(^|[^a-z0-9])${escapeRegex(token)}([^a-z0-9]|$)`, 'i').test(text);
};

const ANCHOR_TYPES = [...EXTENDED_TYPES, ...MEGA_TYPES.filter(type => !EXTENDED_TYPES.some(existing => existing.id === type.id)), ...HUNDRED_K_TYPES];
const ANCHOR_INDEX = ANCHOR_TYPES.map(type => ({ type, keywords: (type.keywords || []).map(String) }));
const MEGA_ANCHOR_INDEX = new Map(MEGA_TYPES.map((type, index) => [type.id, index]));
const MILLION_CONTEXT_INDEX = MILLION_CONTEXTS.map((context, index) => ({ context, index, terms: (context.terms || context[2] || []).map(String) }));
const TEN_M_CONTEXT_INDEX = TEN_MILLION_CONTEXTS.map((context, index) => ({ context, index, terms: (context.terms || context[2] || []).map(String) }));

function classifyAnchor(question) {
  let best = FALLBACK_RESPONSE_TYPE; let bestScore = 0;
  for (const entry of ANCHOR_INDEX) {
    let score = 0;
    for (const keyword of entry.keywords) if (has(question, keyword)) score += keyword.length > 5 ? 3 : 2;
    if (entry.type.id === 'temperature' && /temperature|degrees|°f|°c|fahrenheit|celsius|°/i.test(question)) score += 12;
    if (entry.type.id === 'time' && /what time|current time|time in/i.test(question)) score += 8;
    if (score > bestScore) { best = entry.type; bestScore = score; }
  }
  return { type: best, score: bestScore };
}
function chooseContext(question) {
  let best = { index: 0, score: 0 };
  for (const entry of [...MILLION_CONTEXT_INDEX, ...TEN_M_CONTEXT_INDEX]) {
    let score = 0;
    for (const term of entry.terms) if (has(question, term)) score += term.length > 5 ? 3 : 2;
    if (score > best.score) best = { index: entry.index, score };
  }
  return best;
}
function generatedVariant(anchor, context) {
  const megaIndex = MEGA_ANCHOR_INDEX.get(anchor.id);
  if (megaIndex == null) return null;
  const tenMillionContexts = TEN_M_CONTEXT_INDEX.length;
  const tenIndex = megaIndex * tenMillionContexts + (context.index % tenMillionContexts);
  return TEN_MILLION_RESPONSE_TYPES.get(tenIndex) || HUNDRED_MILLION_TYPES.get(megaIndex * 10000 + (context.index % 10000));
}

export function classifyResponseType(question = '') {
  const q = String(question).toLowerCase();
  const anchor = classifyAnchor(q);
  const context = chooseContext(q);
  const variant = generatedVariant(anchor.type, context);
  if (variant) return { ...variant, score: anchor.score + context.score, anchorType: anchor.type.id };
  return { ...anchor.type, score: anchor.score, anchorType: anchor.type.id };
}

function blocks(text) {
  return String(text || '').replace(/\r/g, '').split(/(?<=[.!?])\s+|\n+/).map(value => value.replace(/\s+/g, ' ').trim()).filter(value => value.length >= 20 && value.length <= 900);
}
export function extractAnswerForType(text, question, type = classifyResponseType(question)) {
  const terms = String(question || '').toLowerCase().split(/[^a-z0-9°]+/).filter(value => value.length > 2);
  const source = String(text || '');
  const ranked = blocks(source).map((block, index) => {
    const lower = block.toLowerCase();
    const characteristicHits = (type.characteristics || []).filter(value => has(lower, value)).length;
    const questionHits = terms.filter(value => lower.includes(value)).length;
    const valueMatches = type.id === 'temperature' ? (block.match(/[-+]?\d+(?:\.\d+)?\s*(?:°\s*[FCfc]|degrees?\s*(?:Fahrenheit|Celsius|F|C)?|Fahrenheit|Celsius)/g) || []) : [];
    return { block, index, score: characteristicHits * 6 + questionHits * 2 + valueMatches.length * 14, valueMatches };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.index - b.index);
  const selected = []; const seen = new Set();
  for (const item of ranked) { if (seen.has(item.block)) continue; seen.add(item.block); selected.push(item); if (selected.length === 8) break; }
  return { typeId: type.id, responseType: type.name, unit: type.unit || '', characteristics: (type.characteristics || []).filter(value => has(source.toLowerCase(), value)), valueMatches: selected.flatMap(item => item.valueMatches), facts: selected.map(item => item.block), matchScore: selected[0]?.score || 0 };
}
export function buildPageSearchProfile(question = '') {
  const type = classifyResponseType(question);
  const characteristics = [...new Set(type.characteristics || [])];
  const searchTerms = [...new Set(type.searchProfile || characteristics)].slice(0, 24);
  return { type, characteristics, searchTerms, signals: searchTerms.join(' OR ') };
}
