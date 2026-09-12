// TONY offline-first browser bridge.
// Deterministic tools -> LargeLM + genuine pretrained local neural backbone -> local JS experts -> server.
// The pretrained backbone is downloaded/cached locally; OpenAI/server remains a final fallback.
(() => {
  if(typeof window==='undefined'||window.__TONYLocalModelBridge)return;
  window.__TONYLocalModelBridge=true;
  const original=window.fetch.bind(window);
  const response=data=>new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
  const isChat=(url,o={})=>{const p=typeof url==='string'?url:(url?.url||'');return /\/api\/chat(?:\?|$)/.test(p)&&String(o.method||'GET').toUpperCase()==='POST'};
  const simple=/^(hi|hello|hey|thanks|thank you)$/i;
  const general=/\b(explain|compare|why|how|write|draft|analy[sz]e|reason|summarize|plan|describe|translate|code|story|essay|review|debug|design|refactor|implement|teach|research)\b/i;
  let largePromise;
  const ensureLarge=async()=>{if(window.__TONYLargeLM)return window.__TONYLargeLM;if(!largePromise)largePromise=(async()=>{if(!window.TONYLocalModel)try{await import('/engine/local-model.js')}catch{}const m=await import('/engine/large-language-model.js');const r=m.createLargeLanguageModel({experts:8,contextBudget:14000,memoryTurns:512,maxTokens:900,seed:'tony-large-neural-v3',pretrained:window.TONYLocalModel||null,neuralFirst:true});window.__TONYLargeLM=r;return r})().catch(e=>{window.__TONYLargeLMError=String(e?.message||e);return null});return largePromise;};
  const largeReply=async(prompt)=>{const m=await ensureLarge();if(!m)return null;try{const r=await m.chat(prompt,{maxTokens:general.test(prompt)?1000:800,temperature:general.test(prompt)?.56:.5,useNeural:true});return r?.reply&&r.reply.trim().length>3?r:null;}catch{return null;}};
  window.fetch=async(url,options={})=>{if(!isChat(url,options))return original(url,options);let body={};try{body=JSON.parse(options.body||'{}')}catch{return original(url,options)}const messages=Array.isArray(body.messages)?body.messages:[],latest=[...messages].reverse().find(m=>m?.role==='user')?.content||'';try{
    if(window.TONYReplicatedEngine&&!general.test(latest)){const r=window.TONYReplicatedEngine.replicate(latest,{allowModel:false});if(r&&!r.requiresModel)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,localReplica:true,openaiRequired:false,operation:r.operation,intent:r.intent,attachmentCount:(body.attachments||[]).length});}
    if(latest&&!simple.test(latest)){const r=await largeReply(latest);if(r)return response({...r,requiresHuman:false,openaiRequired:false,pretrainedNeural:true,largeLocalModel:true,attachmentCount:(body.attachments||[]).length});}
    if(window.TONYLocalOrchestrator){const r=window.TONYLocalOrchestrator.answer(latest,{attachments:body.attachments||[]});if(r?.reply&&r.confidence>=.7)return response({...r,requiresHuman:false,openaiRequired:false,localOrchestrator:true,attachmentCount:(body.attachments||[]).length});}
  }catch(error){window.__TONYLocalError=String(error?.message||error)}
  return original(url,options);};
})();
