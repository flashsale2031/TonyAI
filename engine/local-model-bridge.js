// TONY offline-first browser bridge v7.
// Deterministic tools -> local MidLM -> cached pretrained neural weights -> smaller local models -> server.
// OpenAI/server remains an optional final fallback rather than a required inference path.
(() => {
  if(typeof window==='undefined'||window.__TONYLocalModelBridge)return;
  window.__TONYLocalModelBridge=true;
  const original=window.fetch.bind(window);
  const response=data=>new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
  const isChat=(url,o={})=>{const p=typeof url==='string'?url:(url?.url||'');return /\/api\/chat(?:\?|$)/.test(p)&&String(o.method||'GET').toUpperCase()==='POST'};
  const simple=/^(hi|hello|hey|thanks|thank you|what is \d+\s*[+\-*/]\s*\d+\??)$/i;
  let localPromise;
  const ensureLocal=async()=>{
    if(window.__TONYMidLocalFirstInstance)return window.__TONYMidLocalFirstInstance;
    if(!localPromise)localPromise=import('/engine/mid-local-first.js').then(({createMidLocalFirst})=>{const corpus=window.TONYTransformerTraining?.text||'';const m=createMidLocalFirst({corpusText:corpus});window.__TONYMidLocalFirstInstance=m;return m;}).catch(e=>{window.__TONYMidLocalFirstError=String(e?.message||e);return null});
    return localPromise;
  };
  const localAnswer=async(messages)=>{const m=await ensureLocal();if(!m)return null;try{return await m.answer(messages,{pretrained:window.TONYLocalModel,maxTokens:640,temperature:.62});}catch(e){window.__TONYMidLocalFirstError=String(e?.message||e);return null;}};
  window.fetch=async(url,options={})=>{
    if(!isChat(url,options))return original(url,options);
    let body={};try{body=JSON.parse(options.body||'{}')}catch{return original(url,options)}
    const messages=Array.isArray(body.messages)?body.messages:[];
    const latest=[...messages].reverse().find(m=>m?.role==='user')?.content||'';
    try{
      // Deterministic operations never need a neural or hosted model.
      if(window.TONYReplicatedEngine&&!simple.test(latest)){
        const r=window.TONYReplicatedEngine.replicate(latest,{allowModel:false});
        if(r&&!r.requiresModel)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,localReplica:true,operation:r.operation,intent:r.intent,openaiRequired:false,attachmentCount:(body.attachments||[]).length});
      }
      // Primary path: MidLM runs entirely in JavaScript from its local corpus, retrieval,
      // experts, memory, feedback and cached state. This path deliberately does not call OpenAI.
      if(latest&&!simple.test(latest)){
        const r=await localAnswer(messages);
        if(r?.reply&&r.confidence>=.72)return response({...r,requiresHuman:false,openaiRequired:false,attachmentCount:(body.attachments||[]).length});
      }
      // If the local statistical answer is weak, use the pretrained neural weights locally.
      if(latest&&!simple.test(latest)&&window.TONYLocalModel?.chat){
        try{
          const r=await window.TONYLocalModel.chat(messages,{maxTokens:640,temperature:.62});
          if(r?.reply&&r.reply.trim().length>3)return response({reply:r.reply.trim(),model:r.model||'SmolLM2-360M-Instruct',confidence:.84,pretrainedNeural:true,localModel:true,modelMode:r.mode,openaiRequired:false,requiresHuman:false,attachmentCount:(body.attachments||[]).length});
        }catch(e){window.__TONYPretrainedModelError=String(e?.message||e)}
      }
      // Existing compact local models remain available as additional offline fallbacks.
      if(window.TONYNeuralLanguageModel?.createNeuralLanguageModel&&latest&&!simple.test(latest)){
        try{const m=window.__TONYNeuralInstance||window.TONYNeuralLanguageModel.createNeuralLanguageModel({epochs:12,learningRate:.035});window.__TONYNeuralInstance=m;const text=m.generate(latest,{maxTokens:180,temperature:.64,topK:16,repetitionPenalty:2});if(text?.trim())return response({reply:text.trim(),model:'TONY-NeuralLM',confidence:.7,localNeural:true,openaiRequired:false,requiresHuman:false,attachmentCount:(body.attachments||[]).length});}catch(e){window.__TONYNeuralError=String(e?.message||e)}
      }
      if(window.TONYTinyChat&&latest&&!simple.test(latest)){
        try{const r=window.TONYTinyChat.tinyChat.chat(latest,{maxTokens:180,temperature:.42});if(r?.reply&&r.confidence>=.64)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,tinyModel:true,openaiRequired:false,attachmentCount:(body.attachments||[]).length});}catch(e){window.__TONYTinyError=String(e?.message||e)}
      }
      if(window.TONYLocalOrchestrator){const r=window.TONYLocalOrchestrator.answer(latest,{attachments:body.attachments||[]});if(r?.reply&&r.confidence>=.7)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,localOrchestrator:true,route:r.route,operation:r.operation,intent:r.intent,openaiRequired:false,attachmentCount:(body.attachments||[]).length});}
    }catch(error){window.__TONYLocalError=String(error?.message||error)}
    // Only now does the original server/OpenAI path get a chance to answer.
    return original(url,options);
  };
})();
