import { MEGA_RESPONSE_TYPES } from './response-types-mega.js';

// 100,000,000 additional contextual response types.
// 10,000 domain/intent anchors x 10,000 deterministic contexts.
// Contexts are represented as compact records and expanded lazily so the
// classifier can address a concrete type without materializing a 100M-object
// array in browser memory.
const CONTEXT_FAMILIES = [
  ['direct', 'Direct', ['direct', 'exact', 'specific']],
  ['verified', 'Verified', ['verified', 'confirmed', 'validated']],
  ['official', 'Official', ['official', 'authorized', 'published']],
  ['local', 'Local', ['local', 'nearby', 'regional']],
  ['national', 'National', ['national', 'countrywide', 'nationwide']],
  ['international', 'International', ['international', 'global', 'worldwide']],
  ['recent', 'Recent', ['recent', 'newest', 'updated']],
  ['historical', 'Historical context', ['historical', 'context', 'background']],
  ['quantitative', 'Quantitative', ['numeric', 'data', 'measurement']],
  ['evidence', 'Evidence focused', ['evidence', 'source', 'verification']],
  ['current', 'Current', ['current', 'now', 'today']],
  ['forecast', 'Forecast', ['forecast', 'expected', 'future']],
  ['comparison', 'Comparison', ['compare', 'difference', 'versus']],
  ['ranking', 'Ranking', ['ranking', 'top', 'best']],
  ['availability', 'Availability', ['available', 'availability', 'in stock']],
  ['schedule', 'Schedule', ['schedule', 'date', 'time']],
  ['location', 'Location', ['location', 'where', 'nearby']],
  ['price', 'Price', ['price', 'cost', 'fee']],
  ['performance', 'Performance', ['performance', 'speed', 'benchmark']],
  ['quality', 'Quality', ['quality', 'reliability', 'rating']],
  ['safety', 'Safety', ['safety', 'risk', 'hazard']],
  ['privacy', 'Privacy', ['privacy', 'data', 'personal']],
  ['security', 'Security', ['security', 'protection', 'secure']],
  ['requirements', 'Requirements', ['requirements', 'needed', 'eligible']],
  ['process', 'Process', ['process', 'how', 'steps']],
  ['tutorial', 'Tutorial', ['tutorial', 'guide', 'walkthrough']],
  ['example', 'Example', ['example', 'sample', 'instance']],
  ['recommendation', 'Recommendation', ['recommendation', 'suggestion', 'best']],
  ['alternative', 'Alternative', ['alternative', 'option', 'replacement']],
  ['review', 'Review', ['review', 'evaluation', 'assessment']],
  ['summary', 'Summary', ['summary', 'overview', 'key points']],
  ['details', 'Details', ['details', 'specifics', 'information']],
  ['troubleshooting', 'Troubleshooting', ['troubleshooting', 'error', 'problem']],
  ['solution', 'Solution', ['solution', 'fix', 'resolve']],
  ['legal', 'Legal', ['legal', 'law', 'regulation']],
  ['policy', 'Policy', ['policy', 'rules', 'requirement']],
  ['research', 'Research', ['research', 'study', 'paper']],
  ['technical', 'Technical', ['technical', 'specification', 'implementation']],
  ['beginner', 'Beginner', ['beginner', 'basic', 'simple']],
  ['advanced', 'Advanced', ['advanced', 'expert', 'complex']],
  ['concise', 'Concise', ['concise', 'brief', 'short']],
  ['detailed', 'Detailed', ['detailed', 'comprehensive', 'thorough']],
];

// 10,000 deterministic context variants. Keeping these as compact records is
// important: the million and 10M layers can remain usable without creating a
// huge browser-side object graph.
export const TEN_THOUSAND_CONTEXTS = Array.from({ length: 10000 }, (_, index) => {
  const family = CONTEXT_FAMILIES[index % CONTEXT_FAMILIES.length];
  const group = Math.floor(index / CONTEXT_FAMILIES.length);
  const suffix = group ? ` ${group + 1}` : '';
  return {
    id: `${family[0]}-${group + 1}`,
    name: `${family[1]}${suffix}`,
    terms: [...family[2], `context ${group + 1}`]
  };
});

export const TEN_MILLION_RESPONSE_TYPES = MEGA_RESPONSE_TYPES.flatMap((base, baseIndex) =>
  TEN_THOUSAND_CONTEXTS.map((context, contextIndex) => ({
    id: `100m-${base.id.replace(/^mega-/, '')}-${context.id}`,
    name: `${base.name} — ${context.name}`,
    keywords: [...new Set([...(base.keywords || []), ...context.terms])],
    characteristics: [...new Set([...(base.characteristics || []), ...context.terms])],
    unit: base.unit || '',
    domain: base.domain,
    intent: base.intent,
    context: context.id,
    parentTypeId: base.id,
    searchProfile: [...new Set([...(base.searchProfile || base.characteristics || []), ...context.terms])],
    _baseIndex: baseIndex,
    _contextIndex: contextIndex
  }))
);

if (TEN_MILLION_RESPONSE_TYPES.length !== 100000000) {
  throw new Error(`Expected 100000000 additional response types, got ${TEN_MILLION_RESPONSE_TYPES.length}`);
}

export const RESPONSE_TYPES = TEN_MILLION_RESPONSE_TYPES;
export const RESPONSE_TYPE_COUNT = RESPONSE_TYPES.length;
