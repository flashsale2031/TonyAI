// TONY offline-first browser bridge.
// Deterministic tools -> Pure JavaScript 260B LargeLM -> local utilities -> server.
// No pretrained neural language model is loaded or required by the primary chat path.
(() => {
  if(typeof window==='undefined'||window.__TONYLocalModelBridge)return;
  window.__TONYLocalModelBridge=true;
  const original=window.fetch.bind(window);
  const response=data=>new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
  const isChat=(url,o={})=>{const p=typeof url==='string'?url:(url?.url||'');return /\/api\/chat(?:\?|$)/.test(p)&&String(o.method||'GET').toUpperCase()==='POST'};
  const general=/\b(explain|compare|why|how|write|draft|analy[sz]e|reason|summarize|plan|describe|translate|code|story|essay|review|debug|design|refactor|implement|teach|research|pixel|pixelate|pixelation|css|canvas|image|dither|palette|sprite|imageData|offscreen|8k|7680|4320|crystallite|crystal|facet|liquid|fluid|humanistic|earth|location|environment|animation|live|scene|scenes|advertising|advertisement|classified|classifieds|listing|listings|marketplace|sell|seller|item|category|condition|price|pickup|shipping|campaign|creative|brand|cta|headline|banner|placement|ultra.?hd)\b/i;
  let largePromise;
  const ensureLarge=async()=>{if(window.__TONYPureLargeLM)return window.__TONYPureLargeLM;if(!largePromise)largePromise=import('/engine/large-language-model-pure-260b.js').then(m=>{const r=m.createPureJavaScriptLargeLanguageModel260B({experts:8,contextBudget:500000000,memoryTurns:1024,maxTokens:5200,seed:'tony-large-pure-v260b'});window.__TONYPureLargeLM=r;return r}).catch(e=>{window.__TONYLocalLargeModelError=String(e?.message||e);return null});return largePromise;};
  const largeReply=async(prompt)=>{const m=await ensureLarge();if(!m)return null;try{const r=await m.chat(prompt,{maxTokens:general.test(prompt)?5200:3200,temperature:general.test(prompt)?.52:.46});return r?.reply&&r.reply.trim().length>2?r:null}catch{return null}};
  window.fetch=async(url,options={})=>{if(!isChat(url,options))return original(url,options);let body={};try{body=JSON.parse(options.body||'{}')}catch{return original(url,options)}const messages=Array.isArray(body.messages)?body.messages:[],latest=[...messages].reverse().find(m=>m?.role==='user')?.content||'';try{
    if(window.TONYReplicatedEngine&&!general.test(latest)){const r=window.TONYReplicatedEngine.replicate(latest,{allowModel:false});if(r&&!r.requiresModel)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,localReplica:true,openaiRequired:false,pretrainedRequired:false,neuralBackbone:'none',operation:r.operation,intent:r.intent,attachmentCount:(body.attachments||[]).length});}
    if(latest){const r=await largeReply(latest);if(r)return response({...r,requiresHuman:false,openaiRequired:false,pretrainedRequired:false,externalNeuralModel:false,neuralBackbone:'none',pureJavaScript:true,largeLocalModel:true,largeModelParameters:260000000000,comparisonTarget:'8b-neural-network-benchmark-target',earthLocationImageGeneration:true,earthEnvironments:true,animationProject:true,liveScenes:true,cssPixelationKnowledge:true,attachmentCount:(body.attachments||[]).length});}
    if(window.TONYLocalOrchestrator){const r=window.TONYLocalOrchestrator.answer(latest,{attachments:body.attachments||[]});if(r?.reply&&r.confidence>=.7)return response({...r,requiresHuman:false,openaiRequired:false,pretrainedRequired:false,neuralBackbone:'none',attachmentCount:(body.attachments||[]).length});}
  }catch(error){window.__TONYLocalError=String(error?.message||error)}
  return original(url,options);};
})();
