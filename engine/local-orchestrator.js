// TONY offline-first orchestration layer.
// Chooses deterministic/local capabilities before any hosted model.
import { localBrain } from './local-brain.js';
import { localIntents } from './local-intents.js';
import { localTools } from './local-tools.js';
import { localLanguage } from './local-language.js';
import { localCode } from './local-code.js';
import { localData } from './local-data.js';
import { replicate } from './replicated-engine.js';

const clean=x=>String(x??'').trim();
const answerLocal=(message,context={})=>{
 const text=clean(message); const intent=localIntents.detectIntent(text);
 const replica=replicate(text,{allowModel:false});
 if(!replica.requiresModel && replica.operation!=='router') return {...replica,route:'deterministic'};
 if(intent.name==='calculator') try{return {reply:String(localTools.calculator(text.replace(/^(calculate|compute|what is)\s+/i,''))),confidence:.99,route:'calculator'};}catch{}
 if(intent.name==='summarize') return {reply:localLanguage.summarize(text,5),confidence:.9,route:'local-language'};
 if(intent.name==='code') return {reply:JSON.stringify({language:localCode.detectLanguage(text),stats:localCode.stats(text),issues:localCode.lint(text,localCode.detectLanguage(text))},null,2),confidence:.85,route:'local-code'};
 if(intent.name==='general' || intent.name==='web') return {...localBrain.answer(text),route:'local-brain',context};
 return {...localBrain.answer(text),route:'local-brain',context};
};

export const localOrchestrator=Object.freeze({
 version:'1.0.0',
 answer:answerLocal,
 canRunOffline(message){const i=localIntents.detectIntent(message);return ['calculator','summarize','rewrite','code','file','image'].includes(i.name)||i.name==='general';},
 capabilities(){return {offline:true,deterministic:true,modelOptional:true,webRetrievalOptional:true,modules:['local-brain','local-language','local-code','local-data','local-tools','replicated-engine']};}
});
if(typeof window!=='undefined')window.TONYLocalOrchestrator=localOrchestrator;
