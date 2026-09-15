import { MEGA_RESPONSE_TYPES } from './response-types-mega.js';

// 100,000,000 additional response types represented as an indexed/lazy array-like
// collection. Materializing 100M JavaScript objects would make the browser slow
// and consume excessive memory, so each type is generated only when requested.
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
  ['detailed', 'Detailed', ['detailed', 'comprehensive', 'thorough']]
];

const CONTEXTS = Array.from({ length: 10000 }, (_, index) => {
  const family = CONTEXT_FAMILIES[index % CONTEXT_FAMILIES.length];
  const group = Math.floor(index / CONTEXT_FAMILIES.length);
  return { id: `${family[0]}-${group + 1}`, name: `${family[1]}${group ? ` ${group + 1}` : ''}`, terms: family[2] };
});

export const TEN_MILLION_RESPONSE_TYPES = {
  length: 100000000,
  get(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.length) return undefined;
    const base = MEGA_RESPONSE_TYPES[Math.floor(index / CONTEXTS.length)];
    const context = CONTEXTS[index % CONTEXTS.length];
    if (!base) return undefined;
    const characteristics = [...new Set([...(base.characteristics || []), ...context.terms])];
    return {
      id: `100m-${base.id.replace(/^mega-/, '')}-${context.id}`,
      name: `${base.name} — ${context.name}`,
      keywords: [...new Set([...(base.keywords || []), ...context.terms])],
      characteristics,
      unit: base.unit || '', domain: base.domain, intent: base.intent,
      context: context.id, parentTypeId: base.id,
      searchProfile: [...new Set([...(base.searchProfile || base.characteristics || []), ...context.terms])]
    };
  }
};

export const TEN_MILLION_RESPONSE_TYPE_COUNT = TEN_MILLION_RESPONSE_TYPES.length;
