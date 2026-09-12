// TONY MidLM pretrained neural adapter.
// Combines the local MidLM retrieval/expert stack with an actual pretrained
// instruction model supplied by engine/local-model.js (WebLLM/WebGPU with
// Transformers.js ONNX/WASM fallback). The model weights are fetched and cached
// by the browser runtime rather than fabricated or stored as source text.
import {createMidLanguageModel} from './mid-language-model.js';

const clean=s=>String(s??'').trim();

export class MidPretrainedNeuralEngine{
  constructor({midOptions={},pretrained=null}={}){
    this.mid=createMidLanguageModel({...midOptions,seed:midOptions.seed||'tony-mid-pretrained-v1'});
    this.pretrained=pretrained;
    this.version='1.0';
  }
  attachPretrained(model){this.pretrained=model;return this;}
  contextPrompt(messages){
    const rows=Array.isArray(messages)?messages.filter(Boolean).slice(-20):[];
    const latest=clean([...rows].reverse().find(x=>x?.role==='user')?.content||'');
    const ctx=latest?this.mid.context(latest):'';
    const system=ctx?`You are TONY's pretrained neural language backbone. Use the supplied local retrieval context when relevant. Do not invent facts that are absent from the context.\nLocal context:\n${ctx}`:'You are TONY, a helpful local assistant. Answer clearly and accurately.';
    return [{role:'system',content:system},...rows.map(x=>({role:x.role,content:clean(x.content)}))];
  }
  async chat(messages,{maxTokens=640,temperature=.62,allowFallback=true}={}){
    const cleanMessages=this.contextPrompt(messages);
    const latest=clean([...cleanMessages].reverse().find(x=>x.role==='user')?.content||'');
    if(this.pretrained?.chat){
      try{
        const r=await this.pretrained.chat(cleanMessages,{maxTokens,temperature});
        if(r?.reply&&clean(r.reply).length>3){
          const reply=clean(r.reply);
          this.mid.addMemory('user',latest);
          this.mid.addMemory('assistant',reply);
          return {reply,engine:'mid-pretrained-neural-v1',model:r.model||'SmolLM2-360M-Instruct',mode:r.mode||'webgpu-wasm',pretrainedNeural:true,local:true,confidence:.86,midArchitecture:this.mid.stats().architecture};
        }
      }catch(error){this.lastError=String(error?.message||error)}
    }
    if(allowFallback){
      const r=this.mid.chat(latest,{maxTokens:Math.min(420,maxTokens),temperature:.54,useBeam:true,speculative:true});
      return {...r,engine:'mid-pretrained-neural-v1-fallback',pretrainedNeural:false,fallback:true};
    }
    return {reply:'The pretrained local neural model is not available yet.',engine:'mid-pretrained-neural-v1',pretrainedNeural:false,confidence:.1};
  }
  async warmup(){return this.pretrained?.warmup?this.pretrained.warmup():null}
  status(){return {version:this.version,pretrainedAttached:Boolean(this.pretrained),pretrainedStatus:this.pretrained?.status?.()||null,mid:this.mid.stats(),lastError:this.lastError||null}}
}

export const createMidPretrainedNeuralEngine=(options={})=>new MidPretrainedNeuralEngine(options);
if(typeof window!=='undefined')window.TONYMidPretrainedNeural={MidPretrainedNeuralEngine,createMidPretrainedNeuralEngine};
