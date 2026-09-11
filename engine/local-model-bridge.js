// TONY offline-first browser bridge.
// Deterministic tools -> trained local NeuralLM -> TinyLM -> pretrained WebGPU/WASM -> server fallback.
(() => {
  if(typeof window==='undefined'||window.__TONYLocalModelBridge)return;
  window.__TONYLocalModelBridge=true;
  const original=window.fetch.bind(window);
  const response=data=>new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
  const isChat=(url,o={})=>{const p=typeof url==='string'?url:(url?.url||'');return /\/api\/chat(?:\?|$)/.test(p)&&String(o.method||'GET').toUpperCase()==='POST'};
  const simple=/^(hi|hello|hey|thanks|thank you|what is \d+\s*[+\-*/]\s*\d+\??)$/i;
  const general=/\b(explain|compare|why|how|write|draft|analy[sz]e|reason|summarize|plan|describe|translate|code|story|essay|review)\b/i;
  const ensureNeural=()=>{if(window.TONYNeuralLanguageModel&&window.__TONYNeuralInstance)return window.__TONYNeuralInstance;if(!window.TONYNeuralLanguageModel?.createNeuralLanguageModel)return null;try{window.__TONYNeuralInstance=window.TONYNeuralLanguageModel.createNeuralLanguageModel({epochs:12,learningRate:.035});return window.__TONYNeuralInstance;}catch(e){window.__TONYNeuralError=String(e?.message||e);return null;}};
  const neuralReply=(prompt)=>{const m=ensureNeural();if(!m)return null;const text=m.generate(prompt,{maxTokens:96,temperature:.7,topK:10,repetitionPenalty:1.8});const raw=String(text||'').trim();const reply=raw.replace(/^.*?\b(?:user|assistant):\s*/i,'').trim();return reply&&reply.length>3?{reply,model:'TONY-NeuralLM',confidence:.7,localNeural:true,neuralStats:m.stats()}:null;};
  window.fetch=async(url,options={})=>{
    if(!isChat(url,options))return original(url,options);
    let body={};try{body=JSON.parse(options.body||'{}')}catch{return original(url,options)}
    const messages=Array.isArray(body.messages)?body.messages:[],latest=[...messages].reverse().find(m=>m?.role==='user')?.content||'';
    try{
      if(window.TONYReplicatedEngine&&!general.test(latest)){
        const r=window.TONYReplicatedEngine.replicate(latest,{allowModel:false});
        if(r&&!r.requiresModel)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,localReplica:true,operation:r.operation,intent:r.intent,attachmentCount:(body.attachments||[]).length});
      }
      // Train a compact neural network from the bundled seed corpus and use it before larger models.
      if(latest&&!simple.test(latest)){
        const r=neuralReply(latest);
        if(r&&(!general.test(latest)||r.confidence>=.7))return response({...r,requiresHuman:false,attachmentCount:(body.attachments||[]).length});
      }
      if(window.TONYTinyChat&&!general.test(latest)&&!simple.test(latest)){
        const r=window.TONYTinyChat.tinyChat.chat(latest,{maxTokens:96,temperature:.45});
        if(r?.reply&&r.confidence>=.68)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,tinyModel:true,attachmentCount:(body.attachments||[]).length});
      }
      if(window.TONYLocalModel){
        const r=await window.TONYLocalModel.chat(messages,{maxTokens:512,temperature:general.test(latest)?.65:.7});
        if(r?.reply)return response({reply:r.reply,confidence:.8,requiresHuman:false,localModel:true,model:r.model,modelMode:r.mode,attachmentCount:(body.attachments||[]).length});
      }
      if(window.TONYLocalOrchestrator){
        const r=window.TONYLocalOrchestrator.answer(latest,{attachments:body.attachments||[]});
        if(r?.reply&&r.confidence>=.75)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,localOrchestrator:true,route:r.route,operation:r.operation,intent:r.intent,attachmentCount:(body.attachments||[]).length});
      }
    }catch(error){window.__TONYLocalError=String(error?.message||error)}
    return original(url,options);
  };
})();
