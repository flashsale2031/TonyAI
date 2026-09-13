import { largeJavaScriptLM } from './large-js-lm.js';
import { nativeQuality } from './native-quality.js';

const clean=value=>String(value??'').trim();
const hash=text=>{let h=2166136261;for(const ch of clean(text)){h^=ch.codePointAt(0);h=Math.imul(h,16777619)}return h>>>0};
const messagesToPrompt=(messages=[])=>messages.map(m=>`${m?.role||'user'}: ${clean(m?.content)}`).join('\n');

export const tonyAIProvider={
 name:'tonyai-native',version:'2.0.0',external:false,openaiCompatible:false,
 chat({messages=[],max_tokens=256}={}){
  const prompt=messagesToPrompt(messages);const latest=clean([...messages].reverse().find(m=>m?.role==='user')?.content);
  const reply=nativeQuality.answer(latest,{history:messages,maxTokens:Math.min(Number(max_tokens)||256,512)});
  return {id:`tony-${Date.now().toString(36)}-${hash(prompt).toString(16)}`,object:'chat.completion',created:Math.floor(Date.now()/1000),model:'tonyai-native',choices:[{index:0,message:{role:'assistant',content:reply},finish_reason:'stop'}],usage:{prompt_tokens:prompt.split(/\s+/).filter(Boolean).length,completion_tokens:reply.split(/\s+/).filter(Boolean).length,total_tokens:(prompt+' '+reply).split(/\s+/).filter(Boolean).length},quality:nativeQuality.capabilities()};
 },
 generateImage({prompt,size='1024x1024'}={}){return nativeQuality.scene(prompt,{size});},
 embeddings({input}={}){const text=Array.isArray(input)?input.join('\n'):clean(input);const vector=Array.from({length:128},(_,i)=>(((hash(`${text}:${i}`)%200000)-100000)/100000));return{object:'list',data:[{object:'embedding',index:0,embedding:vector}],model:'tonyai-native-embedding-v2',usage:{prompt_tokens:text.split(/\s+/).filter(Boolean).length,total_tokens:text.split(/\s+/).filter(Boolean).length}};},
 capabilities(){return{name:this.name,version:this.version,external:false,pretrainedModelRequired:false,chat:true,imageGeneration:true,embeddings:true,openaiDependency:false,...nativeQuality.capabilities()};}
};
export const TONYAIProvider=tonyAIProvider;
