import {TinyLanguageModel} from './tiny-language-model.js';
const corpus=`Tony is a helpful assistant. I can explain concepts, summarize text, rewrite writing, calculate numbers, analyze data, organize tasks, write JavaScript, help plan work, and reason through problems. I work locally when possible. Complex requests can be escalated to a larger model. Clear answers should be concise and useful. JavaScript can perform many tasks without a remote service. A good answer should stay relevant to the user's request and avoid repeating itself.`;
const clean=s=>String(s||'').trim();
const terms=s=>[...new Set((String(s||'').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).filter(x=>x.length>2))];
const similarity=(a,b)=>{const A=new Set(terms(a)),B=new Set(terms(b));if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.sqrt(A.size*B.size);};
export class TinyChatEngine{
 constructor(){this.model=new TinyLanguageModel({order:6,maxVocabulary:30000,seed:'tony',beamWidth:3}).train(corpus);this.memory=[];this.system='You are Tony, a concise helpful local assistant. Stay on topic, answer directly, and do not invent facts when the local model lacks evidence.';this.learned=[];}
 addMemory(role,text){const t=clean(text);if(t)this.memory.push({role,text:t,at:Date.now()});if(this.memory.length>24)this.memory.shift();}
 recall(message,limit=5){return this.memory.map((m,i)=>({m,score:similarity(message,m.text)*(1+i*.01)})).filter(x=>x.score>.08).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.m);}
 buildPrompt(message){const recalled=this.recall(message),recent=this.memory.slice(-8),seen=new Set(),merged=[];for(const x of [...recalled,...recent]){const id=`${x.role}:${x.text}`;if(!seen.has(id)){seen.add(id);merged.push(x);}}return[this.system,...merged.map(x=>`${x.role}: ${x.text}`),`user: ${clean(message)}`].join('\n');}
 quality(reply,input){const t=terms(reply),unique=new Set(t).size;const relevance=similarity(reply,input);const diversity=t.length?unique/t.length:0;const repetition=/\b(\w+)(?:\s+\1){2,}$/i.test(reply)?0:.12;return Math.max(.08,Math.min(.9,.2+.42*relevance+.25*diversity+repetition));}
 chat(message,{remember=true,maxTokens=160,temperature=.7,topK=16,repetitionPenalty=2.4}={}){const m=clean(message);if(!m)return{reply:'',engine:'tiny-js'};const prompt=this.buildPrompt(m);if(remember)this.addMemory('user',m);let generated=this.model.generate(prompt,{maxTokens,temperature,topK,repetitionPenalty});let reply=generated.replace(/^.*?user:\s*/,'').trim();if(reply.includes('\nassistant:'))reply=reply.split('\nassistant:')[0].trim();if(!reply)reply='I can handle this locally, but I need more information.';const confidence=this.quality(reply,m);if(remember){this.addMemory('assistant',reply);this.learned.push({input:m,output:reply,confidence});if(this.learned.length>64)this.learned.shift();}return{reply,engine:'tiny-js',confidence,escalate:confidence<.62,local:true,memoryTurns:this.memory.length,recalled:this.recall(m).length};}
 *stream(message,options={}){const m=clean(message);if(!m)return;const prompt=this.buildPrompt(m);for(const item of this.model.stream(prompt,{maxTokens:options.maxTokens??160,temperature:options.temperature??.7,topK:options.topK??16,repetitionPenalty:options.repetitionPenalty??2.4})yield item;}
 train(text,options={}){return this.model.train(text,options).stats();}
 learnFromPair(input,output){const i=clean(input),o=clean(output);this.model.train(`${i} ${o}`,{documentWeight:2});this.learned.push({input:i,output:o,confidence:this.quality(o,i)});if(this.learned.length>64)this.learned.shift();return this.stats();}
 resetMemory(){this.memory=[];return true;}
 stats(){return{...this.model.stats(),memoryTurns:this.memory.length,learnedPairs:this.learned.length};}
 save(){return JSON.stringify({system:this.system,model:this.model.toJSON(),memory:this.memory,learned:this.learned});}
 load(serialized){const x=JSON.parse(serialized);this.system=x.system||this.system;this.model=TinyLanguageModel.fromJSON(x.model);this.memory=Array.isArray(x.memory)?x.memory.slice(-24):[];this.learned=Array.isArray(x.learned)?x.learned.slice(-64):[];return this.stats();}
}
export const tinyChat=new TinyChatEngine();
if(typeof window!=='undefined')window.TONYTinyChat={tinyChat,TinyChatEngine};
