import { RESPONSE_TYPES as ALL_TYPES } from './response-types.js';

export const RESPONSE_TYPES = ALL_TYPES.slice(0, 100);
export const FALLBACK_RESPONSE_TYPE = {
  id: 'generic-factual',
  name: 'General factual answer',
  keywords: [],
  characteristics: ['answer', 'fact', 'source', 'page'],
  unit: ''
};

const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (text, token) => {
  if (!token) return false;
  if (/[^a-z0-9]/i.test(token)) return text.toLowerCase().includes(token.toLowerCase());
  return new RegExp(`(^|[^a-z0-9])${escapeRegex(token)}([^a-z0-9]|$)`, 'i').test(text);
};

export function classifyResponseType(question = '') {
  const q = String(question).toLowerCase();
  let best = FALLBACK_RESPONSE_TYPE;
  let bestScore = 0;
  for (const type of RESPONSE_TYPES) {
    let score = 0;
    for (const keyword of type.keywords) if (has(q, keyword)) score += keyword.length > 5 ? 3 : 2;
    if (type.id === 'temperature' && /temperature|degrees|°f|°c|fahrenheit|celsius|°/i.test(q)) score += 12;
    if (type.id === 'time' && /what time|current time|time in/i.test(q)) score += 8;
    if (score > bestScore) { best = type; bestScore = score; }
  }
  return { ...best, score: bestScore };
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
    const characteristicHits = type.characteristics.filter(value => has(lower, value)).length;
    const questionHits = terms.filter(value => lower.includes(value)).length;
    const temperatureValues = type.id === 'temperature'
      ? (block.match(/[-+]?\d+(?:\.\d+)?\s*(?:°\s*[FCfc]|degrees?\s*(?:Fahrenheit|Celsius|F|C)?|Fahrenheit|Celsius)/g) || [])
      : [];
    return {
      block,
      index,
      score: characteristicHits * 6 + questionHits * 2 + temperatureValues.length * 14,
      characteristicHits,
      questionHits,
      valueMatches: temperatureValues
    };
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
    unit: type.unit,
    characteristics: type.characteristics.filter(value => has(source.toLowerCase(), value)),
    valueMatches: selected.flatMap(item => item.valueMatches),
    facts: selected.map(item => item.block),
    matchScore: selected[0]?.score || 0
  };
}

export function buildPageSearchProfile(question = '') {
  const type = classifyResponseType(question);
  return {
    type,
    characteristics: type.characteristics,
    signals: type.characteristics.join(' OR ')
  };
}
