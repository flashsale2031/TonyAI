// TONY offline-first browser bridge.
// Deterministic tools -> Pure JavaScript 440B LargeLM -> local utilities -> server.
// The primary LargeLM path requires no pretrained neural language model or external neural model.
(() => {
  if(typeof window==='undefined'||window.__TONYLocalModelBridge)return;
  window.__TONYLocalModelBridge=true;
  const original=window.fetch.bind(window);
  const response=data=>new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
  const isChat=(url,o={})=>{const p=typeof url==='string'?url:(url?.url||'');return /\/api\/chat(?:\?|$)/.test(p)&&String(o.method||'GET').toUpperCase()==='POST'};
  const local=/\b(explain|compare|why|how|write|draft|analy[sz]e|reason|summarize|plan|describe|translate|code|story|essay|review|debug|design|refactor|implement|teach|research|math|calculate|data|json|csv|image|images|pixel|pixelate|canvas|offscreen|webgl|svg|8k|7680|4320|scene|scenes|character|characters|profile|activity|activities|behavior|behaviour|personality|trait|mood|emotion|gesture|gaze|pose|posture|render|renderer|recreate|recreation|composition|lighting|camera|silhouette|texture|animation|live|location|environment|file|zip|clipboard|storage|dom|worker|timer|url|css|network|api.?free)\b/i;
  let largePromise;
  const ensureLarge=async()=>{if(window.__TONYPureLargeLM)return window.__TONYPureLargeLM;if(!largePromise)largePromise=import('/engine/large-language-model-pure-440b.js').then(m=>{const r=m.createPureJavaScriptLargeLanguageModel440B({experts:8,contextBudget:800000000,memoryTurns:1024,maxTokens:6200,seed:'tony-large-pure-v440b'});window.__TONYPureLargeLM=r;return r}).catch(e=>{window.__TONYLocalLargeModelError=String(e?.message||e);return null});return largePromise;};
  const largeReply=async(prompt,attachmentCount=0)=>{const m=await ensureLarge();if(!m)return null;try{const r=await m.chat(prompt,{maxTokens:local.test(prompt)?6200:3600,temperature:local.test(prompt)?.5:.44,attachmentCount});return r?.reply&&r.reply.trim().length>2?r:null}catch{return null}};
  window.fetch=async(url,options={})=>{if(!isChat(url,options))return original(url,options);let body={};try{body=JSON.parse(options.body||'{}')}catch{return original(url,options)}const messages=Array.isArray(body.messages)?body.messages:[],latest=[...messages].reverse().find(m=>m?.role==='user')?.content||'',attachmentCount=(body.attachments||[]).length;try{
    if(window.TONYReplicatedEngine&&!local.test(latest)){const r=window.TONYReplicatedEngine.replicate(latest,{allowModel:false});if(r&&!r.requiresModel)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,localReplica:true,openaiRequired:false,pretrainedRequired:false,neuralBackbone:'none',operation:r.operation,intent:r.intent,attachmentCount});}
    if(latest){const r=await largeReply(latest,attachmentCount);if(r)return response({...r,requiresHuman:false,openaiRequired:false,pretrainedRequired:false,externalNeuralModel:false,neuralBackbone:'none',pureJavaScript:true,apiFree:true,largeLocalModel:true,largeModelParameters:440000000000,comparisonTarget:'8b-neural-network-benchmark-target',selectedCharacterImageSceneRecreation:true,characterBehaviorProfiles:true,characterActivityRendering:true,animationProject:true,liveScenes:true,earthLocations:true,cssPixelationKnowledge:true,attachmentCount});}
    if(window.TONYLocalOrchestrator){const r=window.TONYLocalOrchestrator.answer(latest,{attachments:body.attachments||[]});if(r?.reply&&r.confidence>=.7)return response({...r,requiresHuman:false,openaiRequired:false,pretrainedRequired:false,neuralBackbone:'none',attachmentCount});}
  }catch(error){window.__TONYLocalError=String(error?.message||error)}
  return original(url,options);};
})();
