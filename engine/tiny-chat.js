import {TinyLanguageModel} from './tiny-language-model.js';
const corpus=`Tony is a helpful assistant. I can explain concepts, summarize text, rewrite writing, calculate numbers, analyze data, organize tasks, write JavaScript, help plan work, and reason through problems. I work locally when possible. Complex requests can be escalated to a larger model. Clear answers should be concise and useful. JavaScript can perform many tasks without a remote service. Good answers use context from the conversation and avoid unnecessary repetition.`;
const clean=s=>String(s||'').trim();
const roleText=x=>`${x.role}: ${x.text}`;
export class TinyChatEngine{
 constructor(){this.model=new TinyLanguageModel({order:5,maxVocabulary:16000,seed:'tony'}).train(corpus);this.memory=[];this.system='You are Tony, a concise helpful local assistant.';}
 addMemory(role,text){const t=clean(text);if(t)this.memory.push({role,text:t,at:Date.now()});if(this.memory.length>16)this.memory.shift();}
 buildPrompt(message){return [this.system,...this.memory.slice(-10).map(roleText),`user: ${clean(message)}`].join('\n');}
 chat(message,{remember=true,maxTokens=128,temperature=.7,topK=10,repetitionPenalty=3}={}){const m=clean(message);if(!m)return{reply:'',engine:'tiny-js'};const prompt=this.buildPrompt(m);if(remember)this.addMemory('user',m);const generated=this.model.generate(prompt,{maxTokens,temperature,topK,repetitionPenalty});let reply=generated.replace(/^.*?user:\s*/,'').trim();if(reply.includes('\nassistant:'))reply=reply.split('\nassistant:')[0].trim();if(!reply)reply='I can handle this locally, but I need more information.';if(remember)this.addMemory('assistant',reply);return{reply,engine:'tiny-js',confidence:generated?.length>20?.42:.2,escalate:true,local:true,memoryTurns:this.memory.length};}
 *stream(message,options={}){const m=clean(message);if(!m)return;const prompt=this.buildPrompt(m);for(const item of this.model.stream(prompt,{maxTokens:options.maxTokens??128,temperature:options.temperature??.7,topK:options.topK??10,repetitionPenalty:options.repetitionPenalty??3})yield item;}
 train(text,options={}){return this.model.train(text,options).stats();}
 resetMemory(){this.memory=[];return true;}
 stats(){return{...this.model.stats(),memoryTurns:this.memory.length};}
 save(){return JSON.stringify({system:this.system,model:this.model.toJSON(),memory:this.memory});}
 load(serialized){const x=JSON.parse(serialized);this.system=x.system||this.system;this.model=TinyLanguageModel.fromJSON(x.model);this.memory=Array.isArray(x.memory)?x.memory.slice(-16):[];return this.stats();}
}
export const tinyChat=new TinyChatEngine();
if(typeof window!=='undefined')window.TONYTinyChat={tinyChat,TinyChatEngine};
