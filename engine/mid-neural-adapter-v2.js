// TONY MidLM neural adapter v2.
// Adds confidence gating, neural/local candidate fusion, prompt compaction,
// model-status reporting, and persistent conversation memory around the
// pretrained backbone exposed by engine/local-model.js.
// The pretrained weights themselves remain external model artifacts and are
// downloaded/cached by the browser runtime; this file does not fabricate weights.
import {createMidLanguageModel} from './mid-language-model.js';

const clean=s=>String(s??'').trim();
const words=s=>(clean(s).toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]);
const similarity=(a,b)=>{const A=new Set(words(a)),B=new Set(words(b));if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.sqrt(A.size*B.size)};
const unique=s=>new Set(words(s)).size;

export class MidNeuralAdapterV2{
 constructor({midOptions={},pretrained=null,maxContext=7200,minNeuralConfidence=.62}={}){
  this.mid=createMidLanguageModel({...midOptions,seed:midOptions.seed||'tony-mid-neural-v2'});
  this.pretrained=pretrained;this.maxContext=maxContext;this.minNeuralConfidence=minNeuralConfidence;
  this.version='2.0';this.calls=0;this.neuralCalls=0;this.fallbackCalls=0;this.lastError=null;this.history=[];
 }
 attachPretrained(model){this.pretrained=model;return this;}
 compact(text){const t=clean(text);if(t.length<=this.maxContext)return t;const head=Math.floor(this.maxContext*.55),tail=this.maxContext-head;return `${t.slice(0,head)}\n[…context compacted…]\n${t.slice(-tail)}`;}
 buildMessages(messages){
  const rows=Array.isArray(messages)?messages.filter(x=>x&&['system','user','assistant'].includes(x.role)).slice(-24):[];
  const latest=clean([...rows].reverse().find(x=>x.role==='user')?.content||'');
  const local=this.compact(latest?this.mid.context(latest):'');
  const system=local
   ?`You are TONY's pretrained neural language backbone. Use local context as supporting evidence. Prefer the user's actual request over irrelevant context. Do not claim that retrieved text is authoritative when it is uncertain.\nLocal context:\n${local}`
   :'You are TONY, a helpful pretrained neural assistant. Answer the user's request clearly, accurately, and concisely.';
  return [{role:'system',content:system},...rows.map(x=>({role:x.role,content:this.compact(x.content)}))];
 }
 fuse(neural,local,input){
  const n=clean(neural),l=clean(local);if(!n)return l;if(!l)return n;
  const ns=similarity(input,n),ls=similarity(input,l),nu=unique(n),lu=unique(l);
  if(ns>=ls*.9&&nu>=Math.max(6,lu*.55))return n;
  if(ls>ns*1.15&&l.length>=80)return l;
  return n;
 }
 score(reply,input){const r=clean(reply);if(!r)return 0;const rel=similarity(input,r),length=Math.min(1,r.length/180),diversity=Math.min(1,unique(r)/Math.max(1,words(r).length)*4);return Math.max(.05,Math.min(.98,.5+rel*.28+length*.12+diversity*.1));}
 async chat(messages,{maxTokens=640,temperature=.62,allowFallback=true}={}){
  this.calls++;
  const rows=Array.isArray(messages)?messages:[];const latest=clean([...rows].reverse().find(x=>x?.role==='user')?.content||'');
  if(!latest)return {reply:'',engine:'mid-neural-v2',confidence:.05,pretrainedNeural:false};
  const prompt=this.buildMessages(rows);
  if(this.pretrained?.chat){
   try{
    const r=await this.pretrained.chat(prompt,{maxTokens,temperature});
    const neural=clean(r?.reply);
    const neuralConfidence=this.score(neural,latest);
    if(neural&&neuralConfidence>=this.minNeuralConfidence){
     this.neuralCalls++;this.mid.addMemory('user',latest);this.mid.addMemory('assistant',neural);
     this.history.push({at:Date.now(),mode:'pretrained',confidence:neuralConfidence});if(this.history.length>128)this.history.shift();
     return {reply:neural,engine:'mid-neural-v2',model:r.model||'SmolLM2-360M-Instruct',mode:r.mode||'webgpu-wasm',pretrainedNeural:true,local:true,confidence:neuralConfidence,midArchitecture:this.mid.stats().architecture};
    }
   }catch(error){this.lastError=String(error?.message||error)}
  }
  if(allowFallback){
   this.fallbackCalls++;const local=this.mid.chat(latest,{maxTokens:Math.min(480,maxTokens),temperature:.52,useBeam:true,speculative:true});
   const reply=this.fuse(local?.reply,'',latest);this.history.push({at:Date.now(),mode:'mid-fallback',confidence:local?.confidence||.35});if(this.history.length>128)this.history.shift();
   return {...local,reply,engine:'mid-neural-v2-fallback',pretrainedNeural:false,fallback:true};
  }
  return {reply:'The pretrained local neural model is unavailable.',engine:'mid-neural-v2',pretrainedNeural:false,confidence:.1};
 }
 async warmup(){return this.pretrained?.warmup?this.pretrained.warmup():null}
 status(){return {version:this.version,calls:this.calls,neuralCalls:this.neuralCalls,fallbackCalls:this.fallbackCalls,pretrainedAttached:Boolean(this.pretrained),pretrainedStatus:this.pretrained?.status?.()||null,lastError:this.lastError,history:this.history.slice(-8),mid:this.mid.stats()};}
}

export const createMidNeuralAdapterV2=(options={})=>new MidNeuralAdapterV2(options);
if(typeof window!=='undefined')window.TONYMidNeuralAdapterV2={MidNeuralAdapterV2,createMidNeuralAdapterV2};
