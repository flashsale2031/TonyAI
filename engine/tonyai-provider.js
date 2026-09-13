import { nativeQuality } from './native-quality.js';
const clean=value=>String(value??'').trim();
const hash=text=>{let h=2166136261;for(const ch of clean(text)){h^=ch.codePointAt(0);h=Math.imul(h,16777619)}return h>>>0};
const messagesToPrompt=(messages=[])=>messages.map(m=>`${m?.role||'user'}: ${clean(m?.content)}`).join('\n');
const nativeWordCount=(query)=>{const match=clean(query).match(/^word\s*count\s*:\s*([\s\S]+)$/i);if(!match)return null;const text=match[1];return JSON.stringify({words:text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length||0,characters:text.length});};
export const tonyAIProvider={
 name:'tonyai-native',version:'3.0.0',external:false,openaiCompatible:false,
 chat({messages=[],max_tokens=256}={}){const prompt=messagesToPrompt(messages),latest=clean([...messages].reverse().find(m=>m?.role==='user')?.content),reply=nativeWordCount(latest)??nativeQuality.answer(latest,{history:messages,maxTokens:Math.min(Number(max_tokens)||256,512)});return{id:`tony-${Date.now().toString(36)}-${hash(prompt).toString(16)}`,object:'chat.completion',created:Math.floor(Date.now()/1000),model:'tonyai-native',choices:[{index:0,message:{role:'assistant',content:reply},finish_reason:'stop'}],usage:{prompt_tokens:prompt.split(/\s+/).filter(Boolean).length,completion_tokens:reply.split(/\s+/).filter(Boolean).length,total_tokens:(prompt+' '+reply).split(/\s+/).filter(Boolean).length},quality:nativeQuality.capabilities()};},
 generateImage({prompt,size='1024x1024',style='cinematic',variant=0}={}){return nativeQuality.scene(prompt,{size,style,variant});},
 embeddings({input}={}){const text=Array.isArray(input)?input.join('\n'):clean(input);const vector=Array.from({length:128},(_,i)=>(((hash(`${text}:${i}`)%200000)-100000)/100000));return{object:'list',data:[{object:'embedding',index:0,embedding:vector}],model:'tonyai-native-embedding-v3',usage:{prompt_tokens:text.split(/\s+/).filter(Boolean).length,total_tokens:text.split(/\s+/).filter(Boolean).length}};},
 capabilities(){return{name:this.name,version:this.version,external:false,pretrainedModelRequired:false,chat:true,imageGeneration:true,embeddings:true,openaiDependency:false,...nativeQuality.capabilities()};}
};
export const TONYAIProvider=tonyAIProvider;
