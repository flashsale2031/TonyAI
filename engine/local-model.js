// TONY local language model runtime.
// Primary: WebLLM + WebGPU. Fallback: Transformers.js + ONNX/WASM.
// Model weights are downloaded once from Hugging Face and cached by the runtime/browser.
const WEBLLM_MODEL='SmolLM2-360M-Instruct-q4f16_1-MLC';
const TRANSFORMERS_MODEL='onnx-community/SmolLM2-360M-Instruct-ONNX';
const WEBLLM_URL='https://esm.run/@mlc-ai/web-llm';
const TRANSFORMERS_URL='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm';
let enginePromise=null;
let transformersPromise=null;
let mode='uninitialized';
let lastError=null;
const listeners=new Set();
const emit=e=>listeners.forEach(fn=>{try{fn(e)}catch{}});
const cleanMessages=messages=>messages.filter(m=>m&&['system','user','assistant'].includes(m.role)).slice(-20).map(m=>({role:m.role,content:String(m.content??'')}));
async function webllm(){
  if(!enginePromise){enginePromise=(async()=>{emit({status:'loading',mode:'webgpu',model:WEBLLM_MODEL});const mod=await import(WEBLLM_URL);if(!globalThis.navigator?.gpu)throw new Error('WebGPU is unavailable');const create=mod.CreateMLCEngine||mod.createMLCEngine;if(!create)throw new Error('WebLLM engine factory unavailable');const engine=await create(WEBLLM_MODEL,{initProgressCallback:p=>emit({status:'progress',mode:'webgpu',progress:p})});mode='webgpu';emit({status:'ready',mode,model:WEBLLM_MODEL});return engine})().catch(e=>{enginePromise=null;throw e})}return enginePromise;
}
async function transformers(){
  if(!transformersPromise){transformersPromise=(async()=>{emit({status:'loading',mode:'wasm',model:TRANSFORMERS_MODEL});const mod=await import(TRANSFORMERS_URL);const pipe=await mod.pipeline('text-generation',TRANSFORMERS_MODEL,{device:'wasm',dtype:'q4'});mode='wasm';emit({status:'ready',mode,model:TRANSFORMERS_MODEL});return pipe})().catch(e=>{transformersPromise=null;throw e})}return transformersPromise;
}
async function generate(messages,{maxTokens=256,temperature=.7}={}){
  const clean=cleanMessages(messages);
  try{
    const e=await webllm();
    const r=await e.chat.completions.create({messages:clean,temperature,max_tokens:maxTokens,stream:false});
    return {reply:String(r?.choices?.[0]?.message?.content||''),mode:'webgpu',model:WEBLLM_MODEL};
  }catch(webError){
    lastError=String(webError?.message||webError);emit({status:'fallback',from:'webgpu',error:lastError});
    const pipe=await transformers();
    const prompt=clean.map(m=>m.role==='system'?`System: ${m.content}`:m.role==='user'?`User: ${m.content}`:`Assistant: ${m.content}`).join('\n')+'\nAssistant:';
    const out=await pipe(prompt,{max_new_tokens:maxTokens,temperature,do_sample:true,return_full_text:false});
    const text=Array.isArray(out)?(out[0]?.generated_text??''):String(out?.generated_text??'');
    return {reply:String(text).trim(),mode:'wasm',model:TRANSFORMERS_MODEL,fallbackFrom:lastError};
  }
}
export const localModel={
  version:'1.0.0',
  models:{webgpu:WEBLLM_MODEL,wasm:TRANSFORMERS_MODEL},
  async chat(messages,options={}){return generate(messages,options)},
  async warmup(){try{return await webllm()}catch{return await transformers()}},
  status(){return {mode,lastError,webgpuAvailable:!!globalThis.navigator?.gpu,webgpuModel:WEBLLM_MODEL,wasmModel:TRANSFORMERS_MODEL}},
  onStatus(fn){listeners.add(fn);return()=>listeners.delete(fn)}
};
if(typeof window!=='undefined')window.TONYLocalModel=localModel;
