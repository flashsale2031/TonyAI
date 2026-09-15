import { RESPONSE_TYPES as BASE_TYPES } from './response-types.js';

// Exactly 10,000 generated response types: 100 domains × 100 intents.
// Keep this catalog deterministic and strict so the browser cannot load a
// mismatched 10,400-entry variant.
const DOMAIN_IDS = ['weather', 'climate', 'geography', 'population', 'demographics', 'economy', 'finance', 'banking', 'insurance', 'real_estate', 'business', 'marketing', 'retail', 'food', 'nutrition', 'science', 'physics', 'chemistry', 'biology', 'medicine', 'anatomy', 'space', 'astronomy', 'environment', 'energy', 'technology', 'software', 'programming', 'web', 'cybersecurity', 'data', 'artificial_intelligence', 'education', 'careers', 'law', 'government', 'politics', 'elections', 'history', 'culture', 'language', 'literature', 'film', 'television', 'music', 'games', 'sports', 'travel', 'transportation', 'automotive', 'aviation', 'railways', 'shipping', 'logistics', 'manufacturing', 'construction', 'agriculture', 'gardening', 'pets', 'animals', 'plants', 'geology', 'oceanography', 'meteorology', 'ecology', 'energy_policy', 'utilities', 'telecommunications', 'internet_services', 'consumer_electronics', 'hardware', 'databases', 'cloud', 'devops', 'open_source', 'mobile_apps', 'user_experience', 'design', 'security_privacy', 'cryptography', 'robotics', 'spaceflight', 'research', 'mathematics', 'statistics', 'psychology', 'sociology', 'philosophy', 'religion_studies', 'architecture', 'art', 'fashion', 'beauty', 'fitness', 'medicine_pharmacy', 'public_health', 'veterinary', 'food_safety', 'education_testing', 'workplace'];
const INTENT_IDS = ['current', 'historical', 'definition', 'comparison', 'ranking', 'count', 'price', 'availability', 'schedule', 'location', 'distance', 'duration', 'quantity', 'percentage', 'specification', 'requirements', 'cause', 'process', 'forecast', 'evidence', 'origin', 'history', 'trend', 'growth', 'decline', 'rate', 'average', 'median', 'maximum', 'minimum', 'range', 'distribution', 'frequency', 'probability', 'risk', 'benefit', 'drawback', 'pros_cons', 'feature', 'function', 'performance', 'quality', 'accuracy', 'capacity', 'compatibility', 'version', 'release', 'requirements_list', 'instructions', 'tutorial', 'example', 'use_case', 'recommendation', 'alternative', 'selection', 'review', 'rating', 'opinion', 'explanation', 'summary', 'details', 'list', 'steps', 'checklist', 'troubleshooting', 'diagnosis', 'solution', 'status', 'progress', 'deadline', 'timeline', 'cost_breakdown', 'budget', 'revenue', 'profit', 'loss', 'value', 'measurement', 'conversion', 'formula', 'calculation', 'unit', 'data_source', 'citation', 'methodology', 'study', 'sample', 'survey', 'benchmark', 'test', 'result', 'impact', 'relationship', 'cause_effect', 'prediction', 'scenario', 'policy', 'legal_requirement', 'eligibility', 'application'];

const ALIASES = {
  weather: ['weather','forecast','temperature','rain','wind','humidity'],
  climate: ['climate','warming','emissions','precipitation','drought'],
  geography: ['geography','country','continent','region','coordinates'],
  technology: ['technology','device','system','feature','compatibility'],
  programming: ['programming','code','developer','language','syntax','library'],
  web: ['website','browser','internet','page','protocol','url'],
  artificial_intelligence: ['ai','machine','learning','model','training','benchmark','inference'],
  travel: ['travel','trip','destination','vacation','itinerary'],
  sports: ['sports','team','match','player','score','stats'],
  medicine: ['medicine','disease','treatment','diagnosis','symptoms'],
  politics: ['politics','political','candidate','party','policy','poll'],
  elections: ['election','voting','ballot','candidate','turnout','result']
};

const title = value => value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const keywordsFor = id => [...new Set([id, ...id.split('_'), ...(ALIASES[id] || [])])];

function makeType(domainId, intentId) {
  const domainName = title(domainId);
  const intentName = title(intentId);
  const characteristics = [...new Set([...keywordsFor(domainId), ...keywordsFor(intentId)])];
  return {
    id: `mega-${domainId}-${intentId}`,
    name: `${domainName} — ${intentName}`,
    keywords: [...characteristics, `${domainName.toLowerCase()} ${intentName.toLowerCase()}`],
    characteristics,
    unit: intentId === 'percentage' ? '%' : '',
    domain: domainId,
    intent: intentId,
    searchProfile: characteristics
  };
}

if (DOMAIN_IDS.length !== 100) throw new Error(`Expected 100 mega domains, got ${DOMAIN_IDS.length}`);
if (INTENT_IDS.length !== 100) throw new Error(`Expected 100 mega intents, got ${INTENT_IDS.length}`);

export const MEGA_RESPONSE_TYPES = DOMAIN_IDS.flatMap(domain =>
  INTENT_IDS.map(intent => makeType(domain, intent))
);

if (MEGA_RESPONSE_TYPES.length !== 10000) {
  throw new Error(`Expected 10000 mega response types, got ${MEGA_RESPONSE_TYPES.length}`);
}

export const RESPONSE_TYPES = [...BASE_TYPES, ...MEGA_RESPONSE_TYPES];
export const RESPONSE_TYPE_COUNT = RESPONSE_TYPES.length;

export function getResponseTypeProfile(type) {
  return {
    id: type.id,
    name: type.name,
    characteristics: type.characteristics || [],
    searchTerms: type.searchProfile || type.characteristics || [],
    unit: type.unit || ''
  };
}
