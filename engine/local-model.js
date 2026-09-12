// TONY pretrained local neural runtime.
// Primary: Qwen3-8B via WebLLM/WebGPU. Fallback: Qwen2.5-1.5B via Transformers.js/WASM.
// These are genuine pretrained neural checkpoints; this file is only the runtime adapter.
// Model weights are downloaded and cached by the model runtime rather than fabricated in JS.
const WEBLLM_MODEL='Qwen3-8B-q4f16_1-MLC';
const TRANSFORMERS_MODEL='onnx-community/Qwen2.5-1.5B-Instruct';
const WEBLLM_URL='https://esm.run/@mlc-ai/web-llm';
const TRANSFORMERS_URL='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm';
let enginePromise=null;
let transformersPromise=null;
let mode='uninitialized';
let lastError=null;
let loadedModel=null;
const listeners=new Set();
const emit=e=>listeners.forEach(fn=>{try{fn(e)}catch{}});
const cleanMessages=messages=>messages.filter(m=>m&&['system','user','assistant'].includes(m.role)).slice(-32).map(m=>({role:m.role,content:String(m.content??'')}));
async function webllm(){
  if(!enginePromise){enginePromise=(async()=>{emit({status:'loading',mode:'webgpu',model:WEBLLM_MODEL});const mod=await import(WEBLLM_URL);if(!globalThis.navigator?.gpu)throw new Error('WebGPU is unavailable');const create=mod.CreateMLCEngine||mod.createMLCEngine;if(!create)throw new Error('WebLLM engine factory unavailable');const engine=await create(WEBLLM_MODEL,{initProgressCallback:p=>emit({status:'progress',mode:'webgpu',progress:p,model:WEBLLM_MODEL})});mode='webgpu';loadedModel=WEBLLM_MODEL;emit({status:'ready',mode,model:WEBLLM_MODEL,pretrained:true});return engine})().catch(e=>{enginePromise=null;throw e})}return enginePromise;
}
async function transformers(){
  if(!transformersPromise){transformersPromise=(async()=>{emit({status:'loading',mode:'wasm',model:TRANSFORMERS_MODEL});const mod=await import(TRANSFORMERS_URL);const pipe=await mod.pipeline('text-generation',TRANSFORMERS_MODEL,{device:'wasm',dtype:'q4'});mode='wasm';loadedModel=TRANSFORMERS_MODEL;emit({status:'ready',mode,model:TRANSFORMERS_MODEL,pretrained:true});return pipe})().catch(e=>{transformersPromise=null;throw e})}return transformersPromise;
}
async function generate(messages,{maxTokens=700,temperature=.65}={}){
  const clean=cleanMessages(messages);
  try{
    const e=await webllm();
    const r=await e.chat.completions.create({messages:clean,temperature,max_tokens:maxTokens,stream:false});
    return {reply:String(r?.choices?.[0]?.message?.content||''),mode:'webgpu',model:WEBLLM_MODEL,pretrained:true,neuralParameters:'8B-q4f16'};
  }catch(webError){
    lastError=String(webError?.message||webError);emit({status:'fallback',from:'webgpu',error:lastError});
    const pipe=await transformers();
    const prompt=clean.map(m=>m.role==='system'?`System: ${m.content}`:m.role==='user'?`User: ${m.content}`:`Assistant: ${m.content}`).join('\n')+'\nAssistant:';
    const out=await pipe(prompt,{max_new_tokens:maxTokens,temperature,do_sample:true,return_full_text:false});
    const text=Array.isArray(out)?(out[0]?.generated_text??''):String(out?.generated_text??'');
    return {reply:String(text).trim(),mode:'wasm',model:TRANSFORMERS_MODEL,pretrained:true,fallbackFrom:lastError,neuralParameters:'1.5B-q4'};
  }
}
export const localModel={
  version:'2.0.0',
  pretrained:true,
  primaryModel:WEBLLM_MODEL,
  models:{webgpu:WEBLLM_MODEL,wasm:TRANSFORMERS_MODEL},
  async chat(messages,options={}){return generate(messages,options)},
  async warmup(){try{return await webllm()}catch{return await transformers()}},
  status(){return {mode,lastError,loadedModel,pretrained:true,webgpuAvailable:!!globalThis.navigator?.gpu,webgpuModel:WEBLLM_MODEL,wasmModel:TRANSFORMERS_MODEL}},
  onStatus(fn){listeners.add(fn);return()=>listeners.delete(fn)}
};
if(typeof window!=='undefined')window.TONYLocalModel=localModel;
