import { MEGA_RESPONSE_TYPES } from './response-types-mega.js';

// Exactly 10,000,000 lazy response types: 10 context families × 100 modifiers × 10,000 mega anchors.
const FAMILIES = [
  ['direct','Direct'], ['verified','Verified'], ['official','Official'], ['local','Local'],
  ['regional','Regional'], ['national','National'], ['international','International'], ['recent','Recent'],
  ['historical','Historical'], ['real-time','Real time']
];
const MODIFIERS = ['current','historical','definition','comparison','ranking','count','price','availability','schedule','location','distance','duration','quantity','percentage','specification','requirements','cause','process','forecast','evidence','origin','history','trend','growth','decline','rate','average','median','maximum','minimum','range','distribution','frequency','probability','risk','benefit','drawback','pros_cons','feature','function','performance','quality','accuracy','capacity','compatibility','version','release','requirements_list','instructions','tutorial','example','use_case','recommendation','alternative','selection','review','rating','opinion','explanation','summary','details','list','steps','checklist','troubleshooting','diagnosis','solution','status','progress','deadline','timeline','cost_breakdown','budget','revenue','profit','loss','value','measurement','conversion','formula','calculation','unit','data_source','citation','methodology','study','sample','survey','benchmark','test','result','impact','relationship','cause_effect','prediction','scenario','policy','legal_requirement','eligibility','application'];

const CONTEXTS = FAMILIES.flatMap(([familyId,familyName]) => MODIFIERS.map(modifier => ({
  id: `${familyId}-${modifier}`,
  name: `${familyName} ${modifier.replace(/_/g,' ')}`,
  terms: [familyId, modifier.replace(/_/g,' '), modifier]
})));

if (CONTEXTS.length !== 1000) throw new Error(`Expected 1000 contexts, got ${CONTEXTS.length}`);

export { CONTEXTS };
export const TEN_MILLION_RESPONSE_TYPES = {
  length: 10000000,
  get(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.length) return undefined;
    const baseIndex = Math.floor(index / CONTEXTS.length);
    const context = CONTEXTS[index % CONTEXTS.length];
    const base = MEGA_RESPONSE_TYPES[baseIndex];
    if (!base) return undefined;
    return {
      ...base,
      id: `10m-${baseIndex}-${context.id}-${base.id}`,
      name: `${base.name} — ${context.name}`,
      keywords: [...new Set([...(base.keywords || []), ...context.terms])],
      characteristics: [...new Set([...(base.characteristics || []), ...context.terms])],
      context: context.id,
      searchProfile: [...new Set([...(base.searchProfile || base.characteristics || []), ...context.terms])]
    };
  }
};
export const RESPONSE_TYPE_COUNT = TEN_MILLION_RESPONSE_TYPES.length;
