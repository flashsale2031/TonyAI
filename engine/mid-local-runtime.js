// TONY MidLM local runtime v1.
// Extends the existing MidLM with local-first routing, persistent answer memory,
// lightweight tool execution, retrieval-aware caching, and confidence gating.
// It deliberately uses no remote API for its local paths.
import {createMidLanguageModel} from './mid-language-model.js';

const clean=s=>String(s??'').trim();
const norm=s=>clean(s).toLowerCase().replace(/\s+/g,' ');
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const math=/^\s*[\d\s()+\-*/%.^]+\s*$/;
const calc=q=>{if(!math.test(q))return null;try{const expr=q.replace(/\^/g,'**');if(!/^[\d\s()+\-*/%.]+(?:\*\*)?[\d\s()+\-*/%.]*$/.test(expr))return null;const value=Function(`"use strict";return (${expr})`)();return Number.isFinite(value)?String(value):null;}catch{return null;}};

export class MidLocalRuntime{
 constructor({midOptions={},storageKey='tony-mid-local-v1',minConfidence=.46}={}){
  this.mid=createMidLanguageModel({order:10,maxVocabulary:160000,beamWidth:10,answerCacheSize:2048,memoryTurns:192,retrievalLimit:16,contextBudget:8000,seed:'tony-mid-local-v1',...midOptions});
  this.storageKey=storageKey;this.minConfidence=minConfidence;this.calls=0;this.localCalls=0;this.toolCalls=0;this.cacheHits=0;this.lastRoute='';this.lastConfidence=0;
  this.restore();
 }
 restore(){try{const raw=typeof localStorage!=='undefined'?localStorage.getItem(this.storageKey):null;if(raw)this.mid.load(raw);}catch{}}
 persist(){try{if(typeof localStorage!=='undefined')localStorage.setItem(this.storageKey,this.mid.save());}catch{}}
 train(text,options={}){const result=this.mid.train(text,options);this.persist();return result;}
 answer(input,options={}){
  const q=clean(input);if(!q)return{reply:'',confidence:.05,local:true};this.calls++;
  const arithmetic=calc(q);
  if(arithmetic!==null){this.toolCalls++;this.localCalls++;this.lastRoute='calculator';this.lastConfidence=.99;return{reply:arithmetic,confidence:.99,local:true,localMidModel:true,route:'calculator',openaiRequired:false};}
  const key=norm(q);
  try{
   const exact=this.mid.tiny.recallAnswer(q,.95);if(exact?.output){this.cacheHits++;this.localCalls++;this.lastRoute='answer-memory';this.lastConfidence=.96;return{reply:exact.output,confidence:.96,local:true,localMidModel:true,route:'answer-memory',openaiRequired:false};}
  }catch{}
  const r=this.mid.chat(q,{maxTokens:options.maxTokens||520,temperature:options.temperature??.5,useBeam:true,speculative:true});
  const confidence=Number(r?.confidence)||0;
  this.lastRoute=r?.route||'midlm';this.lastConfidence=confidence;
  if(r?.reply&&confidence>=this.minConfidence){this.localCalls++;this.persist();return{...r,local:true,localMidModel:true,openaiRequired:false};}
  if(r?.reply){this.localCalls++;this.persist();return{...r,local:true,localMidModel:true,openaiRequired:false,needsEscalation:true};}
  return null;
 }
 stats(){return{version:'1.0',engine:'TONY-MidLM-LocalRuntime',openaiRequired:false,offlineFirst:true,calls:this.calls,localCalls:this.localCalls,toolCalls:this.toolCalls,cacheHits:this.cacheHits,lastRoute:this.lastRoute,lastConfidence:this.lastConfidence,mid:this.mid.stats()};}
}

export const createMidLocalRuntime=(options={})=>new MidLocalRuntime(options);
if(typeof window!=='undefined')window.TONYMidLocalRuntime={MidLocalRuntime,createMidLocalRuntime};
