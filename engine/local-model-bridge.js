// TONY offline-first browser bridge.
// Deterministic tools -> LargeLM -> persistent MidLM -> pretrained neural backbone
// -> TransformerLM -> NeuralLM -> TinyLM -> server.
// OpenAI/server remains a final fallback rather than the default chat engine.
(() => {
  if(typeof window==='undefined'||window.__TONYLocalModelBridge)return;
  window.__TONYLocalModelBridge=true;
  const original=window.fetch.bind(window);
  const response=data=>new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
  const isChat=(url,o={})=>{const p=typeof url==='string'?url:(url?.url||'');return /\/api\/chat(?:\?|$)/.test(p)&&String(o.method||'GET').toUpperCase()==='POST'};
  const simple=/^(hi|hello|hey|thanks|thank you)$/i;
  const general=/\b(explain|compare|why|how|write|draft|analy[sz]e|reason|summarize|plan|describe|translate|code|story|essay|review|debug|design|refactor|implement|teach|research)\b/i;
  let largePromise;
  const ensureLarge=async()=>{if(window.__TONYLargeLM)return window.__TONYLargeLM;if(!largePromise)largePromise=import('/engine/large-language-model.js').then(m=>{const r=m.createLargeLanguageModel({experts:8,contextBudget:12000,memoryTurns:512,maxTokens:900,seed:'tony-large-local-v1',pretrained:window.TONYLocalModel||null});window.__TONYLargeLM=r;return r;}).catch(e=>{window.__TONYLargeLMError=String(e?.message||e);return null});return largePromise;};
  let localPromise;
  const ensureLocal=async()=>{if(window.__TONYMidLocalRuntime)return window.__TONYMidLocalRuntime;if(!localPromise)localPromise=import('/engine/mid-local-runtime.js').then(m=>{const r=m.createMidLocalRuntime({minConfidence:.44});window.__TONYMidLocalRuntime=r;return r;}).catch(e=>{window.__TONYMidLocalError=String(e?.message||e);return null});return localPromise;};
  const largeReply=async(messages,prompt)=>{const m=await ensureLarge();if(!m)return null;try{const r=await m.chat(prompt,{maxTokens:general.test(prompt)?900:700,temperature:general.test(prompt)?.56:.5,useNeural:true});return r?.reply&&r.reply.trim().length>3?r:null;}catch{return null;}};
  const localReply=async prompt=>{const r=await ensureLocal();if(!r)return null;const out=r.answer(prompt,{maxTokens:general.test(prompt)?640:420,temperature:general.test(prompt)?.48:.42});return out?.reply&&out.reply.trim().length>2?out:null;};
  window.fetch=async(url,options={})=>{if(!isChat(url,options))return original(url,options);let body={};try{body=JSON.parse(options.body||'{}')}catch{return original(url,options)}const messages=Array.isArray(body.messages)?body.messages:[],latest=[...messages].reverse().find(m=>m?.role==='user')?.content||'';try{
    if(window.TONYReplicatedEngine&&!general.test(latest)){const r=window.TONYReplicatedEngine.replicate(latest,{allowModel:false});if(r&&!r.requiresModel)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,localReplica:true,openaiRequired:false,operation:r.operation,intent:r.intent,attachmentCount:(body.attachments||[]).length});}
    if(latest&&!simple.test(latest)){const r=await largeReply(messages,latest);if(r)return response({...r,requiresHuman:false,openaiRequired:false,largeLocalModel:true,attachmentCount:(body.attachments||[]).length});}
    if(latest){const r=await localReply(latest);if(r&&(!general.test(latest)||r.confidence>=.44))return response({...r,requiresHuman:false,openaiRequired:false,attachmentCount:(body.attachments||[]).length});}
    if(latest&&!simple.test(latest)&&window.TONYLocalModel){try{const r=await window.TONYLocalModel.chat(messages,{maxTokens:640,temperature:.58});if(r?.reply)return response({...r,requiresHuman:false,openaiRequired:false,localModel:true,attachmentCount:(body.attachments||[]).length});}catch{}}
    if(window.TONYNeuralLanguageModel?.createNeuralLanguageModel&&!simple.test(latest)){try{const m=window.__TONYNeuralInstance||window.TONYNeuralLanguageModel.createNeuralLanguageModel({epochs:12,learningRate:.035});window.__TONYNeuralInstance=m;const text=m.generate(latest,{maxTokens:180,temperature:.62,topK:16,repetitionPenalty:2});if(text?.trim())return response({reply:text.trim(),model:'TONY-NeuralLM',confidence:.7,localNeural:true,openaiRequired:false,requiresHuman:false,attachmentCount:(body.attachments||[]).length});}catch{}}
    if(window.TONYTinyChat&&!general.test(latest)&&!simple.test(latest)){const r=window.TONYTinyChat.tinyChat.chat(latest,{maxTokens:160,temperature:.42});if(r?.reply&&r.confidence>=.64)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,tinyModel:true,openaiRequired:false,attachmentCount:(body.attachments||[]).length});}
    if(window.TONYLocalOrchestrator){const r=window.TONYLocalOrchestrator.answer(latest,{attachments:body.attachments||[]});if(r?.reply&&r.confidence>=.7)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,localOrchestrator:true,openaiRequired:false,route:r.route,operation:r.operation,intent:r.intent,attachmentCount:(body.attachments||[]).length});}
  }catch(error){window.__TONYLocalError=String(error?.message||error)}
  return original(url,options);};
})();
