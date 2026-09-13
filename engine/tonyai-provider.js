import { largeJavaScriptLM } from './large-js-lm.js';

const clean = value => String(value ?? '').trim();
const escapeXml = value => clean(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const hash = text => { let h = 2166136261; for (const ch of clean(text)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const palette = seed => ['#111827','#1f2937','#334155','#475569','#64748b','#0f766e','#0369a1','#7c3aed','#be123c','#b45309'][seed % 10];

function messagesToPrompt(messages=[]) { return messages.map(m => `${m?.role || 'user'}: ${clean(m?.content)}`).join('\n'); }

function localImage(prompt, options={}) {
 const width = Number(String(options.size || '1024x1024').split('x')[0]) || 1024;
 const height = Number(String(options.size || '1024x1024').split('x')[1]) || 1024;
 const seed = hash(prompt);
 const bg = palette(seed);
 const accent = palette(seed >>> 4);
 const safePrompt = escapeXml(prompt).slice(0, 220);
 const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${Math.round(width*.72)}" cy="${Math.round(height*.28)}" r="${Math.round(Math.min(width,height)*.12)}" fill="#f8fafc" fill-opacity=".82"/><path d="M0 ${Math.round(height*.78)} Q ${Math.round(width*.22)} ${Math.round(height*.52)} ${Math.round(width*.42)} ${Math.round(height*.76)} T ${width} ${Math.round(height*.68)} V ${height} H0Z" fill="#020617" fill-opacity=".62"/><rect x="${Math.round(width*.06)}" y="${Math.round(height*.72)}" width="${Math.round(width*.88)}" height="${Math.round(height*.2)}" rx="28" fill="#ffffff" fill-opacity=".13"/><text x="${Math.round(width*.1)}" y="${Math.round(height*.82)}" fill="#ffffff" font-family="Arial, sans-serif" font-size="36" font-weight="700">TonyAI Local Image</text><text x="${Math.round(width*.1)}" y="${Math.round(height*.89)}" fill="#ffffff" fill-opacity=".9" font-family="Arial, sans-serif" font-size="22">${safePrompt}</text></svg>`;
 return {ok:true,image:`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')},`,mimeType:'image/svg+xml',model:'tonyai-local-image-v1',size:`${width}x${height}`,prompt};
}

export const tonyAIProvider = {
 name:'tonyai-native',
 version:'1.0.0',
 external:false,
 openaiCompatible:false,
 chat({messages=[],max_tokens=256,temperature=.38}={}) {
   const prompt=messagesToPrompt(messages); const latest=clean([...messages].reverse().find(m=>m?.role==='user')?.content);
   const reply=largeJavaScriptLM.synthesize(latest,{retrieved:largeJavaScriptLM.retrieve(latest,8),toolResults:[],sources:[]}) || largeJavaScriptLM.generate(latest,{maxTokens:Math.min(Number(max_tokens)||256,2048),temperature:Number(temperature)||.38});
   return {id:`tony-${Date.now().toString(36)}-${hash(prompt).toString(16)}`,object:'chat.completion',created:Math.floor(Date.now()/1000),model:'tonyai-native',choices:[{index:0,message:{role:'assistant',content:reply},finish_reason:'stop'}],usage:{prompt_tokens:prompt.split(/\s+/).filter(Boolean).length,completion_tokens:reply.split(/\s+/).filter(Boolean).length,total_tokens:(prompt+' '+reply).split(/\s+/).filter(Boolean).length}};
 },
 generateImage({prompt,size='1024x1024'}={}) { return localImage(prompt,{size}); },
 embeddings({input}={}) { const text=Array.isArray(input)?input.join('\n'):clean(input); const vector=Array.from({length:64},(_,i)=>(((hash(`${text}:${i}`)%200000)-100000)/100000)); return {object:'list',data:[{object:'embedding',index:0,embedding:vector}],model:'tonyai-native-embedding-v1',usage:{prompt_tokens:text.split(/\s+/).filter(Boolean).length,total_tokens:text.split(/\s+/).filter(Boolean).length}}; },
 capabilities(){return {name:this.name,version:this.version,external:false,pretrainedModelRequired:false,chat:true,imageGeneration:true,embeddings:true,openaiDependency:false};}
};

export const TONYAIProvider = tonyAIProvider;
