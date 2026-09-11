// TinyLM v8 enhancement layer.
// Extends TinyLanguageModel without replacing its v7 statistical core.
// Adds subword/character retrieval, sentence-aware context, adaptive decoding,
// feedback learning, and lightweight evaluation helpers. Still not a pretrained LLM.
import { TinyLanguageModel } from './tiny-language-model.js';

const normalize=s=>String(s??'').toLowerCase().replace(/\s+/g,' ').trim();
const words=s=>normalize(s).match(/[\p{L}\p{N}]+/gu)||[];
const fragments=(word,min=3,max=6)=>{const w=normalize(word),out=[];for(let n=min;n<=Math.min(max,w.length);n++)for(let i=0;i+n<=w.length;i++)out.push(w.slice(i,i+n));return out;};
const similarity=(a,b)=>{const A=new Set(words(a)),B=new Set(words(b));if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.sqrt(A.size*B.size);};

const originalTrain=TinyLanguageModel.prototype.train;
const originalRetrieve=TinyLanguageModel.prototype.retrieve;
const originalGenerate=TinyLanguageModel.prototype.generate;

if(!TinyLanguageModel.prototype.__tonyV8){
 TinyLanguageModel.prototype.__tonyV8=true;
 const originalTrainV8=originalTrain;
 TinyLanguageModel.prototype.train=function(text,options={}){
   const raw=String(text??'');
   originalTrainV8.call(this,raw,options);
   if(!this.subwordIndex)this.subwordIndex=new Map();
   for(const word of words(raw)){
     for(const frag of fragments(word)){
       let bucket=this.subwordIndex.get(frag);
       if(!bucket)this.subwordIndex.set(frag,bucket=[]);
       if(!bucket.includes(word))bucket.push(word);
     }
   }
   this.v8Documents=(this.v8Documents||0)+1;
   return this;
 };

 TinyLanguageModel.prototype.retrieve=function(query,limit=6){
   const base=originalRetrieve.call(this,query,limit);
   if(!this.subwordIndex||!this.documents?.length)return base;
   const q=words(query),candidateWords=new Set();
   for(const word of q)for(const f of fragments(word))for(const hit of this.subwordIndex.get(f)||[])candidateWords.add(hit);
   if(!candidateWords.size)return base;
   const extra=[];
   for(let i=0;i<this.documents.length;i++){
     const d=this.documents[i];
     const text=String(d.text||'');
     let score=similarity(query,text)*.65;
     for(const w of candidateWords)if(text.toLowerCase().includes(w))score+=.035;
     if(score>.18)extra.push({d,score});
   }
   const merged=new Map();
   for(const d of base)merged.set(d.text,d);
   for(const x of extra.sort((a,b)=>b.score-a.score).slice(0,limit*2))merged.set(x.d.text,x.d);
   return [...merged.values()].slice(0,limit);
 };

 TinyLanguageModel.prototype.adaptiveOptions=function(prompt,options={}){
   const p=normalize(prompt), hard=/\b(explain|compare|analy[sz]e|reason|why|how|debug|review|design|plan|derive|prove)\b/i.test(p);
   const short=words(p).length<8;
   const retrieval=this.retrieve(p,3).length;
   const confidence=typeof this.confidence==='function'?this.confidence(p):.5;
   const temperature=options.temperature??(hard?.52:short?.7:.62);
   return {...options,temperature:confidence<.48?Math.min(.82,temperature+.12):temperature,topK:options.topK??(hard?24:36),repetitionPenalty:options.repetitionPenalty??(hard?3.5:3.1),useBeam:options.useBeam??(hard&&confidence>.55),retrievalCount:retrieval};
 };

 TinyLanguageModel.prototype.generate=function(prompt,options={}){
   const tuned=this.adaptiveOptions(prompt,options);
   const result=originalGenerate.call(this,prompt,tuned);
   this.lastGeneration={prompt:String(prompt||''),result:String(result||''),options:tuned,time:Date.now()};
   return result;
 };

 TinyLanguageModel.prototype.learnFeedback=function(prompt,response,reward=1){
   const score=Math.max(-1,Math.min(1,Number(reward)||0));
   if(score>0)this.rememberAnswer(prompt,response,score);
   this.remember(`${prompt} ${response}`,Math.max(.1,score+1));
   if(!this.feedback)this.feedback={accepted:0,rejected:0,total:0,reward:0};
   this.feedback.total++;this.feedback.reward+=score;
   if(score>0)this.feedback.accepted++;else if(score<0)this.feedback.rejected++;
   this.scoreCache?.clear();
   return this.feedback;
 };

 TinyLanguageModel.prototype.evaluate=function(cases=[]){
   let exact=0,relevant=0,total=0;
   for(const item of cases){const prompt=item?.prompt??'';const expected=item?.expected??'';const generated=this.generate(prompt,{maxTokens:item?.maxTokens??64});total++;if(normalize(generated)===normalize(expected))exact++;relevant+=similarity(generated,expected);}
   return {total,exactMatch:total?exact/total:0,semanticOverlap:total?relevant/total:0,feedback:this.feedback||{accepted:0,rejected:0,total:0,reward:0}};
 };

 const oldJSON=TinyLanguageModel.prototype.toJSON;
 TinyLanguageModel.prototype.toJSON=function(){const x=oldJSON.call(this);return {...x,feedback:this.feedback||null,v8Documents:this.v8Documents||0,subwordIndex:[...(this.subwordIndex||new Map())]};};
 const oldFromJSON=TinyLanguageModel.fromJSON;
 TinyLanguageModel.fromJSON=function(x){const m=oldFromJSON.call(this,x);m.feedback=x?.feedback||null;m.v8Documents=x?.v8Documents||0;m.subwordIndex=new Map(x?.subwordIndex||[]);return m;};
}

export const createTinyLanguageModelV8=(corpus='',options={})=>new TinyLanguageModel(options).train(corpus);
export { TinyLanguageModel };
if(typeof window!=='undefined')window.TONYTinyLanguageModelV8={TinyLanguageModel,createTinyLanguageModelV8};
