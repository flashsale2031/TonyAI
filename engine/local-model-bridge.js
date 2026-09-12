// TONY offline-first browser bridge.
// Deterministic tools -> Pure JavaScript 5.4B LargeLM -> local utilities -> server.
// No pretrained neural language model is loaded or required by the primary chat path.
(() => {
  if(typeof window==='undefined'||window.__TONYLocalModelBridge)return;
  window.__TONYLocalModelBridge=true;
  const original=window.fetch.bind(window);
  const response=data=>new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
  const isChat=(url,o={})=>{const p=typeof url==='string'?url:(url?.url||'');return /\/api\/chat(?:\?|$)/.test(p)&&String(o.method||'GET').toUpperCase()==='POST'};
  const simple=/^(hi|hello|hey|thanks|thank you)$/i;
  const general=/\b(explain|compare|why|how|write|draft|analy[sz]e|reason|summarize|plan|describe|translate|code|story|essay|review|debug|design|refactor|implement|teach|research)\b/i;
  let largePromise;
  const ensureLarge=async()=>{if(window.__TONYPureLargeLM)return window.__TONYPureLargeLM;if(!largePromise)largePromise=import('/engine/large-language-model-pure-5.4b.js').then(m=>{const r=m.createPureJavaScriptLargeLanguageModel5_4B({experts:8,contextBudget:50000000,memoryTurns:1024,maxTokens:1600,seed:'tony-large-pure-v5.4b'});window.__TONYPureLargeLM=r;return r}).catch(e=>{window.__TONYPureLargeLMError=String(e?.message||e);return null});return largePromise;};
  const largeReply=async(prompt)=>{const m=await ensureLarge();if(!m)return null;try{const r=await m.chat(prompt,{maxTokens:general.test(prompt)?1600:1100,temperature:general.test(prompt)?.52:.46});return r?.reply&&r.reply.trim().length>2?r:null}catch{return null}};
  window.fetch=async(url,options={})=>{if(!isChat(url,options))return original(url,options);let body={};try{body=JSON.parse(options.body||'{}')}catch{return original(url,options)}const messages=Array.isArray(body.messages)?body.messages:[],latest=[...messages].reverse().find(m=>m?.role==='user')?.content||'';try{
    if(window.TONYReplicatedEngine&&!general.test(latest)){const r=window.TONYReplicatedEngine.replicate(latest,{allowModel:false});if(r&&!r.requiresModel)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,localReplica:true,openaiRequired:false,pretrainedRequired:false,neuralBackbone:'none',operation:r.operation,intent:r.intent,attachmentCount:(body.attachments||[]).length});}
    if(latest){const r=await largeReply(latest);if(r)return response({...r,requiresHuman:false,openaiRequired:false,pretrainedRequired:false,neuralBackbone:'none',pureJavaScript:true,largeLocalModel:true,largeModelParameters:5400000000,comparisonTarget:'8b-neural-network-benchmark-target',attachmentCount:(body.attachments||[]).length});}
    if(window.TONYLocalOrchestrator){const r=window.TONYLocalOrchestrator.answer(latest,{attachments:body.attachments||[]});if(r?.reply&&r.confidence>=.7)return response({...r,requiresHuman:false,openaiRequired:false,pretrainedRequired:false,neuralBackbone:'none',attachmentCount:(body.attachments||[]).length});}
  }catch(error){window.__TONYLocalError=String(error?.message||error)}
  return original(url,options);};
})();
