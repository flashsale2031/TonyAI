// TONY MidLM local-first orchestration v1.
// Reduces dependence on hosted APIs by using deterministic tools, MidLM retrieval,
// browser-cached pretrained weights, and persistent local learning before any server fallback.
// No pretrained weights are embedded here; local-model.js supplies the genuine model artifacts.
import {createMidLanguageModel} from './mid-language-model.js';

const clean=s=>String(s??'').trim();
const intent=q=>{const x=clean(q).toLowerCase();if(/\b(code|javascript|typescript|node|npm|sql|html|css|debug|api|git)\b/.test(x))return'code';if(/\b(summarize|summary|tl;dr|condense)\b/.test(x))return'summarize';if(/\b(plan|roadmap|steps|strategy|workflow)\b/.test(x))return'plan';if(/\b(compare|versus|difference|tradeoff|pros|cons)\b/.test(x))return'compare';if(/\b(explain|what is|why|how does|define|teach)\b/.test(x))return'explain';return'general';};
const score=(q,a)=>{const A=new Set((clean(q).toLowerCase().match(/[\p{L}\p{N}]+/gu)||[])),B=new Set((clean(a).toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]));if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.sqrt(A.size*B.size);};

export class MidLocalFirst{
 constructor({corpusText='',modelFactory=createMidLanguageModel}={}){
  this.model=modelFactory({corpusText,order:10,maxVocabulary:160000,beamWidth:10,answerCacheSize:2048,memoryTurns:192,retrievalLimit:18,contextBudget:9000,epochs:3,seed:'tony-mid-local-first-v1'});
  this.version='1.0';this.statsData={total:0,localMid:0,pretrained:0,serverFallback:0};
 }
 async answer(messages,{pretrained=null,maxTokens=640,temperature=.62}={}){
  const rows=Array.isArray(messages)?messages:[];const q=clean([...rows].reverse().find(x=>x?.role==='user')?.content||'');if(!q)return{reply:'',source:'empty',confidence:0};this.statsData.total++;
  const route=intent(q);
  // Exact local answer/cache first. This is intentionally synchronous and works offline.
  const local=this.model.chat(q,{maxTokens:Math.min(520,maxTokens),temperature:.5,useBeam:true,speculative:true});
  if(local?.reply&&local.confidence>=.72){this.statsData.localMid++;return{...local,source:'mid-local',route,openaiRequired:false};}
  // Pretrained neural model is local once its weights have been cached in the browser.
  if(pretrained?.chat){try{const r=await pretrained.chat(rows,{maxTokens,temperature});const s=score(q,r?.reply);if(r?.reply&&s>=.2){this.statsData.pretrained++;this.model.addMemory('user',q);this.model.addMemory('assistant',r.reply);return{reply:clean(r.reply),source:'pretrained-local',model:r.model,mode:r.mode,confidence:Math.max(.72,s),route,openaiRequired:false};}}catch(e){this.lastError=String(e?.message||e)}}
  return{...local,source:'mid-local-low-confidence',route,openaiRequired:false,mayEscalate:true};
 }
 train(examples){const rows=Array.isArray(examples)?examples:[];for(const x of rows){const text=typeof x==='string'?x:[x?.input,x?.output].filter(Boolean).join('\n');if(text)this.model.train(text,{epochs:1});}return this.status();}
 feedback(input,output,rating=1){this.model.learn(input,output,rating);return this.status();}
 status(){return{version:this.version,...this.statsData,openaiRequiredForLocalInference:false,mid:this.model.stats(),lastError:this.lastError||null};}
}

export const createMidLocalFirst=(options={})=>new MidLocalFirst(options);
if(typeof window!=='undefined')window.TONYMidLocalFirst={MidLocalFirst,createMidLocalFirst};
