import { MEGA_RESPONSE_TYPES } from './response-types-mega.js';

// Virtual one-million response-type layer. Objects are created only when a
// specific index is requested, so loading the chat never allocates 1M objects.
const FAMILIES=['direct','verified','official','local','regional','national','international','recent','historical','real-time'];
const MODES=['answer','source','location','comparison','ranking','schedule','process','evidence','data','technical'];
const PERIODS=['current','recent','historical','today','weekly','monthly','annual','forecast','long-term','instant'];
const CONTEXTS=Array.from({length:100},(_,i)=>{const family=FAMILIES[Math.floor(i/10)],mode=MODES[i%10],period=PERIODS[(i*7)%10];return [`${family}-${mode}-${period}-${i+1}`,`${family} ${mode} ${period}`,[family,mode,period]];});

function contextualize(base,context,index){
  const [cid,cname,terms]=context;
  const characteristics=[...new Set([...(base.characteristics||[]),...terms,cname])];
  return {...base,id:`million-${index}-${base.id}-${cid}`,name:`${base.name} — ${cname}`,keywords:[...new Set([...(base.keywords||[]),...terms])],characteristics,context:cid,searchProfile:[...new Set([...(base.searchProfile||base.characteristics||[]),...terms])]};
}

export const MILLION_RESPONSE_TYPES={
  length:1000000,
  get(index){
    if(!Number.isInteger(index)||index<0||index>=this.length)return undefined;
    const baseIndex=Math.floor(index/CONTEXTS.length);
    const context=CONTEXTS[index%CONTEXTS.length];
    const base=MEGA_RESPONSE_TYPES[baseIndex];
    return base&&context?contextualize(base,context,baseIndex):undefined;
  }
};

export const RESPONSE_TYPE_COUNT=MILLION_RESPONSE_TYPES.length;
export { CONTEXTS };
