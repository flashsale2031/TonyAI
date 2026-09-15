import { MEGA_RESPONSE_TYPES } from './response-types-mega.js';

// 10,000,000 additional contextual response types represented lazily.
// 10,000 domain/intent anchors x 1,000 deterministic contexts.
const FAMILIES = [
  ['direct','Direct'], ['verified','Verified'], ['official','Official'], ['local','Local'],
  ['regional','Regional'], ['national','National'], ['international','International'], ['recent','Recent'],
  ['historical','Historical'], ['real-time','Real time']
];
const MODIFIERS = [
  'exact','specific','confirmed','validated','published','authorized','nearby','regional','countrywide','global',
  'updated','newest','current','previous','upcoming','scheduled','live','reported','observed','measured',
  'estimated','calculated','projected','predicted','expected','actual','planned','typical','unusual','average',
  'median','maximum','minimum','range','high-confidence','low-confidence','evidence-based','source-based','data-driven','statistical',
  'quantitative','qualitative','technical','consumer','business','expert','beginner','advanced','plain-language','detailed',
  'concise','step-by-step','instructional','tutorial','example','recommendation','alternative','review','rating','summary',
  'detailed-facts','checklist','troubleshooting','solution','eligibility','policy','legal','research','comparison','ranking',
  'trend','growth','decline','cause','process','requirements','specification','feature','performance','quality',
  'safety','privacy','security','compatibility','availability','schedule','location','distance','duration','percentage',
  'price','cost','budget','revenue','profit','loss','value','measurement','conversion','formula',
  'calculation','unit','citation','methodology','study','sample','survey','benchmark','test','result',
  'impact','relationship','scenario','forecast','timeline','history','origin','background','overview','details'
];
const CONTEXTS = FAMILIES.flatMap(([familyId, familyName]) => MODIFIERS.map((modifier, modifierIndex) => ({
  id: `${familyId}-${modifier}`, name: `${familyName} ${modifier.replace(/-/g, ' ')}`,
  terms: [familyId, modifier.replace(/-/g, ' '), modifier, `${familyName.toLowerCase()} ${modifier.replace(/-/g, ' ')}`], index: modifierIndex
})));

export const TEN_MILLION_RESPONSE_TYPES = {
  length: 10000000,
  get(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.length) return undefined;
    const baseIndex = Math.floor(index / CONTEXTS.length);
    const context = CONTEXTS[index % CONTEXTS.length];
    const base = MEGA_RESPONSE_TYPES[baseIndex];
    if (!base) return undefined;
    const terms = context.terms;
    return {
      ...base,
      id: `10m-${baseIndex}-${context.id}-${base.id}`,
      name: `${base.name} — ${context.name}`,
      keywords: [...new Set([...(base.keywords || []), ...terms])],
      characteristics: [...new Set([...(base.characteristics || []), ...terms])],
      context: context.id,
      searchProfile: [...new Set([...(base.searchProfile || base.characteristics || []), ...terms])]
    };
  }
};
export const CONTEXTS = CONTEXTS;
export const RESPONSE_TYPE_COUNT = TEN_MILLION_RESPONSE_TYPES.length;
