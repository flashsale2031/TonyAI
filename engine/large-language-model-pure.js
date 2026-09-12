// TONY LargeLM Pure v3.
// Pure JavaScript generation path: no pretrained neural model is required or used.
import {createLargeLanguageModel as createBaseLarge} from './large-language-model.js';
import {atlasSearch,atlasStats} from './large-knowledge-atlas.js';

const clean=s=>String(s??'').trim();
const norm=s=>clean(s).toLowerCase();
const words=s=>new Set((norm(s).match(/[\p{L}\p{N}]+/gu)||[]).filter(x=>x.length>2));
const sim=(a,b)=>{const A=words(a),B=words(b);if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.sqrt(A.size*B.size)};
const overlap=(a,b)=>{const A=words(a),B=words(b);if(!A.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/A.size};
const route=q=>{const x=norm(q);if(/\b(code|javascript|typescript|node|npm|git|sql|html|css|api|debug|program|regex)\b/.test(x))return'code';if(/\b(research|source|citation|latest|news|web)\b/.test(x))return'research';if(/\b(plan|roadmap|strategy|project|workflow|schedule)\b/.test(x))return'plan';if(/\b(analy[sz]e|data|statistics|metric|evaluate|inspect)\b/.test(x))return'analyze';if(/\b(compare|versus|difference|tradeoff|pros|cons)\b/.test(x))return'compare';if(/\b(write|draft|essay|story|email|letter|rewrite|edit)\b/.test(x))return'write';return'reason'};

function deterministic(q){
 const x=norm(q),n=[...x.matchAll(/-?\d+(?:\.\d+)?/g)].map(m=>Number(m[0]));
 if(n.length>=2&&/(sum|add|plus|total)/.test(x))return`The result is ${n.reduce((a,b)=>a+b,0)}.`;
 if(n.length>=2&&/(multiply|times|product)/.test(x))return`The result is ${n.reduce((a,b)=>a*b,1)}.`;
 if(n.length>=2&&/(average|mean)/.test(x))return`The arithmetic mean is ${n.reduce((a,b)=>a+b,0)/n.length}.`;
 if(/\b(hello|hi|hey)\b/.test(x))return'Hello. I can answer using TONY’s local JavaScript knowledge and reasoning engine.';
 return'';
}

export class PureJavaScriptLargeLM extends (class {}){
 constructor(options={}){
  super();
  this.core=createBaseLarge({...options,pretrained:null,contextBudget:options.contextBudget||20000,memoryTurns:options.memoryTurns||1024,maxTokens:options.maxTokens||1200});
  this.version='3.1';
 }
 addMemory(...a){return this.core.addMemory(...a)}
 train(...a){return this.core.train(...a)}
 learn(...a){return this.core.learn(...a)}
 save(){return this.core.save()}
 load(s){return this.core.load(s)}
 stats(){return{...this.core.stats(),architecture:'large-pure-javascript-atlas-v3.1',version:this.version,pretrainedAttached:false,pretrainedRequired:false,neuralBackbone:'none',atlas:atlasStats()}}
 async generate(input,{maxTokens=1200,temperature=.5}={}){
  const q=clean(input);if(!q)return'';
  const d=deterministic(q);if(d)return d;
  const routeName=route(q);
  const hits=atlasSearch(q,28).filter(x=>(x.score||0)>.025);
  const local=[];
  for(const h of hits.slice(0,10))local.push({text:h.text,score:.36+(h.score||0)*1.7,route:'atlas'});
  // Ask the existing MidLM ensemble with neural fusion explicitly disabled.
  try{const text=await this.core.generate(q,{maxTokens,temperature,useNeural:false});if(text)local.push({text,score:.72,route:routeName});}catch{}
  if(!local.length)return 'I do not have enough local evidence to answer that reliably.';
  local.sort((a,b)=>{const sa=a.score+sim(q,a.text)*.55+overlap(q,a.text)*.12;const sb=b.score+sim(q,b.text)*.55+overlap(q,b.text)*.12;return sb-sa});
  const chosen=local[0].text.replace(/^.*?assistant:\s*/is,'').trim();
  // Add a second independent atlas result when it materially increases coverage.
  const second=local.find(x=>x.text!==local[0].text&&sim(local[0].text,x.text)>.12&&sim(q,x.text)>.04);
  const answer=second&&chosen.length<420?`${chosen} ${second.text}`:chosen;
  return answer.length>Math.max(2000,maxTokens*8)?answer.slice(0,Math.max(2000,maxTokens*8)).replace(/\s+\S*$/,'')+'…':answer;
 }
 async chat(input,options={}){
  const q=clean(input);const reply=await this.generate(q,options);this.addMemory('user',q);this.addMemory('assistant',reply);
  return{reply,engine:'large-pure-js-v3.1',model:'TONY-LargeLM-Pure-v3.1',local:true,openaiRequired:false,pretrainedRequired:false,neuralBackbone:'none',confidence:Math.min(.96,.42+sim(q,reply)*.38),atlasEntries:atlasStats().entries};
 }
 async stream(input,options={}){const text=await this.generate(input,options);return (text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*|[^\p{L}\p{N}\s]/gu)||[]).map((token,index)=>({token,index}));}
}
export const createPureJavaScriptLargeLanguageModel=(options={})=>new PureJavaScriptLargeLM(options);
if(typeof window!=='undefined')window.TONYPureJavaScriptLargeLM={PureJavaScriptLargeLM,createPureJavaScriptLargeLanguageModel};
