import { MEGA_RESPONSE_TYPES } from './response-types-mega.js';
import { CONTEXTS as TEN_M_CONTEXTS } from './response-types-10m.js';

// 100,000,000,000 additional response types: 10,000 domain/intent anchors
// multiplied by 10,000,000 deterministic question contexts.
// This is a virtual indexed collection. No 100B object array is materialized.
const CONTEXT_VARIATIONS = 10000;
export const CONTEXT_COUNT = TEN_M_CONTEXTS.length * CONTEXT_VARIATIONS;

function contextAt(index) {
  const seedIndex = index % TEN_M_CONTEXTS.length;
  const variation = Math.floor(index / TEN_M_CONTEXTS.length);
  const seed = TEN_M_CONTEXTS[seedIndex];
  const family = seed?.id || `context-${seedIndex}`;
  const suffix = variation ? ` v${variation + 1}` : '';
  const baseTerms = seed?.terms || [];
  const variationTerms = [`variant ${variation + 1}`, `context ${seedIndex + 1}`, `query variant ${variation + 1}`];
  return {
    id: `${family}-${variation + 1}`,
    name: `${seed?.name || family}${suffix}`,
    terms: [...new Set([...baseTerms, ...variationTerms])]
  };
}

function getType(index) {
  if (!Number.isInteger(index) || index < 0 || index >= MEGA_RESPONSE_TYPES.length * CONTEXT_COUNT) return undefined;
  const baseIndex = Math.floor(index / CONTEXT_COUNT);
  const contextIndex = index % CONTEXT_COUNT;
  const base = MEGA_RESPONSE_TYPES[baseIndex];
  if (!base) return undefined;
  const context = contextAt(contextIndex);
  const characteristics = [...new Set([...(base.characteristics || []), ...context.terms])];
  return {
    id: `100b-${base.id.replace(/^mega-/, '')}-${context.id}`,
    name: `${base.name} — ${context.name}`,
    keywords: [...new Set([...(base.keywords || []), ...context.terms])],
    characteristics,
    unit: base.unit || '',
    domain: base.domain,
    intent: base.intent,
    context: context.id,
    parentTypeId: base.id,
    searchProfile: [...new Set([...(base.searchProfile || base.characteristics || []), ...context.terms])]
  };
}

export const HUNDRED_BILLION_RESPONSE_TYPES = {
  length: 100000000000,
  get: getType
};

export const RESPONSE_TYPE_COUNT = HUNDRED_BILLION_RESPONSE_TYPES.length;
export const RESPONSE_TYPES = HUNDRED_BILLION_RESPONSE_TYPES;

if (MEGA_RESPONSE_TYPES.length * CONTEXT_COUNT !== 100000000000) {
  throw new Error(`Expected 100000000000 additional response types, got ${MEGA_RESPONSE_TYPES.length * CONTEXT_COUNT}`);
}
