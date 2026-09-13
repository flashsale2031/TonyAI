// TONY Large JavaScript LM
// Pure JavaScript: no pretrained neural model, no external generation API.
//
// IMPORTANT: parameterCapacity is a virtual/sparse parameter capacity, not
// 450B physically stored learned weights. JavaScript cannot make a trained
// 450B model by adding source text. Materialized values are deterministic
// and can be learned from local corpora at runtime.

export const LARGE_JS_LM_PARAMETER_CAPACITY = 450_000_000_000;
export const LARGE_JS_LM_BACKBONE = 'pure-javascript-sparse-neural-symbolic';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const hash=(s)=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const tokens=(s)=>String(s??'').toLowerCase().match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*|[^\s]/gu)||[];

class SparseParameterStore{
  constructor({capacity=LARGE_JS_LM_PARAMETER_CAPACITY,seed=0x544f4e59,cacheSize=200000}={}){
    this.capacity=capacity;this.seed=seed>>>0;this.cache=new Map();this.cacheSize=cacheSize;this.learnedUpdates=0;
  }
  index(key){return hash(`${this.seed}:${key}`)%this.capacity}
  value(key){const k=String(key),hit=this.cache.get(k);if(hit!==undefined)return hit;let x=hash(`${this.seed}:${k}`);x=Math.imul(x^0x9e3779b9,0x85ebca6b)>>>0;const v=(x/4294967295)*2-1;if(this.cache.size>=this.cacheSize)this.cache.delete(this.cache.keys().next().value);this.cache.set(k,v);return v}
  learn(key,delta){const k=String(key),v=this.value(k)+Number(delta||0);this.cache.set(k,clamp(v,-4,4));this.learnedUpdates++;return v}
  stats(){return{parameterCapacity:this.capacity,materializedParameters:this.cache.size,learnedUpdates:this.learnedUpdates,storage:'sparse-deterministic-runtime-cache'}}
}

export class LargeJavaScriptLM{
  constructor(options={}){this.params=new SparseParameterStore(options);this.context=[];this.knowledge=new Map();this.documents=[];this.maxContext=options.maxContext||8192;this.temperature=options.temperature??0.65;this.topK=options.topK||24;}
  addKnowledge(entries=[]){for(const e of entries){const text=typeof e==='string'?e:String(e?.text||'');if(!text.trim())continue;const id=e?.id||`k${this.knowledge.size}`;this.knowledge.set(id,{id,text,tokens:tokens(text),source:e?.source||'local'});}return this.knowledge.size;}
  learn(text,{passes=1,rate=.002}={}){const ts=tokens(text);for(let p=0;p<passes;p++)for(let i=1;i<ts.length;i++){const a=ts[i-1],b=ts[i];this.params.learn(`bigram:${a}:${b}`,rate);if(i>1)this.params.learn(`trigram:${ts[i-2]}:${a}:${b}`,rate*.5)}return this.stats()}
  scoreNext(history,candidate){const h=history.slice(-8);let s=this.params.value(`bias:${candidate}`);if(h.length)s+=this.params.value(`bigram:${h.at(-1)}:${candidate}`)*2;if(h.length>1)s+=this.params.value(`trigram:${h.at(-2)}:${h.at(-1)}:${candidate}`)*3;const recent=h.includes(candidate);if(recent)s-=1.4;return s}
  retrieve(query,limit=8){const q=new Set(tokens(query).filter(x=>x.length>2));return [...this.knowledge.values()].map(d=>{let n=0;for(const t of d.tokens)if(q.has(t))n++;return{...d,score:q.size?n/q.size:0}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit)}
  candidates(history){const pool=new Set([...this.knowledge.values()].flatMap(x=>x.tokens).filter(x=>x.length>0));return [...pool].map(token=>({token,score:this.scoreNext(history,token)})).sort((a,b)=>b.score-a.score).slice(0,this.topK)}
  next(context){const h=tokens(context);const cs=this.candidates(h);if(!cs.length)return null;const temp=Math.max(.1,this.temperature),mx=cs[0].score;let total=0;const ws=cs.map(x=>{const w=Math.exp(clamp((x.score-mx)/temp,-18,6));total+=w;return w});let r=Math.random()*total;for(let i=0;i<cs.length;i++){r-=ws[i];if(r<=0)return cs[i].token}return cs[0].token}
  generate(prompt,{maxTokens=128,temperature=this.temperature}={}){const old=this.temperature;this.temperature=temperature;let out=String(prompt||'').trim();for(let i=0;i<maxTokens;i++){const n=this.next(out);if(!n)break;out+=/^[.,!?;:%)]$/.test(n)?n:` ${n}`;if(/[.!?]$/.test(n)&&i>12)break}this.temperature=old;return out}
  answer(query){const hits=this.retrieve(query);if(hits.length){const evidence=hits.map(x=>x.text).join(' ');return{reply:evidence,source:'large-js-knowledge',confidence:Math.min(.95,.5+hits[0].score*.4),evidence:hits.map(x=>({id:x.id,source:x.source,score:x.score}))}}return{reply:this.generate(query),source:'large-js-generation',confidence:.25}}
  stats(){return{architecture:LARGE_JS_LM_BACKBONE,parameterCapacity:LARGE_JS_LM_PARAMETER_CAPACITY,...this.params.stats(),knowledgeEntries:this.knowledge.size,contextTokens:this.context.length,maxContext:this.maxContext,pretrainedModel:false,externalNeuralModel:false,externalGenerationAPI:false,trainableAtRuntime:true}}
}

export const largeJavaScriptLM=new LargeJavaScriptLM();
if(typeof globalThis!=='undefined')globalThis.TONYLargeJavaScriptLM=largeJavaScriptLM;
