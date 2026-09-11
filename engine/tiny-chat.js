import {TinyLanguageModel} from './tiny-language-model.js';
const corpus=`Tony is a helpful assistant. I can explain concepts, summarize text, rewrite writing, calculate numbers, analyze data, organize tasks, write JavaScript, help plan work, and reason through problems. I work locally when possible. Complex requests can be escalated to a larger model. Clear answers should be concise and useful. JavaScript can perform many tasks without a remote service.`;
const clean=s=>String(s||'').trim();
const terms=s=>[...new Set((String(s||'').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).filter(x=>x.length>2))];
export class TinyChatEngine{
 constructor(){this.model=new TinyLanguageModel({order:6,maxVocabulary:24000,seed:'tony'}).train(corpus);this.memory=[];this.system='You are Tony, a concise helpful local assistant.';this.learned=[];}
 addMemory(role,text){const t=clean(text);if(t)this.memory.push({role,text:t,at:Date.now()});if(this.memory.length>20)this.memory.shift();}
 recall(message,limit=4){const q=new Set(terms(message));return this.memory.map((m,i)=>({m,score:terms(m.text).filter(x=>q.has(x)).length/(1+i*.015)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.m);}
 buildPrompt(message){const recalled=this.recall(message);const recent=this.memory.slice(-8);const merged=[...recalled,...recent].filter((x,i,a)=>a.findIndex(y=>y===x)<i?false:true);return[this.system,...merged.map(x=>`${x.role}: ${x.text}`),`user: ${clean(message)}`].join('\n');}
 chat(message,{remember=true,maxTokens=160,temperature=.65,topK=12,repetitionPenalty=3}={}){const m=clean(message);if(!m)return{reply:'',engine:'tiny-js'};const prompt=this.buildPrompt(m);if(remember)this.addMemory('user',m);const generated=this.model.generate(prompt,{maxTokens,temperature,topK,repetitionPenalty});let reply=generated.replace(/^.*?user:\s*/,'').trim();if(reply.includes('\nassistant:'))reply=reply.split('\nassistant:')[0].trim();if(!reply)reply='I can handle this locally, but I need more information.';if(remember){this.addMemory('assistant',reply);this.learned.push({input:m,output:reply});if(this.learned.length>32)this.learned.shift();}return{reply,engine:'tiny-js',confidence:generated?.length>20?.46:.2,escalate:true,local:true,memoryTurns:this.memory.length,recalled:this.recall(m).length};}
 *stream(message,options={}){const m=clean(message);if(!m)return;for(const item of this.model.stream(this.buildPrompt(m),{maxTokens:options.maxTokens??160,temperature:options.temperature??.65,topK:options.topK??12,repetitionPenalty:options.repetitionPenalty??3})yield item;}
 train(text,options={}){return this.model.train(text,options).stats();}
 learnFromPair(input,output){this.model.train(`${clean(input)} ${clean(output)}`);this.learned.push({input:clean(input),output:clean(output)});if(this.learned.length>32)this.learned.shift();return this.stats();}
 resetMemory(){this.memory=[];return true;}
 stats(){return{...this.model.stats(),memoryTurns:this.memory.length,learnedPairs:this.learned.length};}
 save(){return JSON.stringify({system:this.system,model:this.model.toJSON(),memory:this.memory,learned:this.learned});}
 load(serialized){const x=JSON.parse(serialized);this.system=x.system||this.system;this.model=TinyLanguageModel.fromJSON(x.model);this.memory=Array.isArray(x.memory)?x.memory.slice(-20):[];this.learned=Array.isArray(x.learned)?x.learned.slice(-32):[];return this.stats();}
}
export const tinyChat=new TinyChatEngine();
if(typeof window!=='undefined')window.TONYTinyChat={tinyChat,TinyChatEngine};
