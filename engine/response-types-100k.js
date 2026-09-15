import { MEGA_RESPONSE_TYPES } from './response-types-mega.js';

// Ten distinct question-context variants for every existing mega domain/intent
// combination. This adds exactly 100,000 unique response types while keeping
// each type tied to page characteristics and type-specific search signals.
const VARIANTS = [
  ['direct', 'Direct', ['direct', 'exact', 'specific']],
  ['verified', 'Verified', ['verified', 'confirmed', 'validated']],
  ['official', 'Official', ['official', 'authorized', 'published']],
  ['local', 'Local', ['local', 'nearby', 'regional']],
  ['national', 'National', ['national', 'countrywide', 'nationwide']],
  ['international', 'International', ['international', 'global', 'worldwide']],
  ['recent', 'Recent', ['recent', 'newest', 'updated']],
  ['historical_context', 'Historical context', ['historical', 'context', 'background']],
  ['quantitative', 'Quantitative', ['numeric', 'data', 'measurement']],
  ['evidence_focused', 'Evidence focused', ['evidence', 'source', 'verification']],
];

export const HUNDRED_K_RESPONSE_TYPES = MEGA_RESPONSE_TYPES.flatMap(base => VARIANTS.map(([vid, vname, vkeywords]) => ({
  ...base,
  id: `100k-${base.id.replace(/^mega-/, '')}-${vid}`,
  name: `${base.name} — ${vname}`,
  keywords: [...new Set([...(base.keywords || []), ...vkeywords, vname.toLowerCase()])],
  characteristics: [...new Set([...(base.characteristics || []), ...vkeywords])],
  searchProfile: [...new Set([...(base.searchProfile || base.characteristics || []), ...vkeywords])],
  variant: vid,
  parentTypeId: base.id
})));

if (HUNDRED_K_RESPONSE_TYPES.length !== 100000) {
  throw new Error(`Expected 100000 additional response types, got ${HUNDRED_K_RESPONSE_TYPES.length}`);
}

export const RESPONSE_TYPES = HUNDRED_K_RESPONSE_TYPES;
export const RESPONSE_TYPE_COUNT = RESPONSE_TYPES.length;
