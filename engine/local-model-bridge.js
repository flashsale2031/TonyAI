// TONY offline-first browser bridge.
// Simple deterministic work stays local; general language uses the real local WebGPU/WASM model.
(() => {
  if(typeof window==='undefined'||window.__TONYLocalModelBridge)return;
  window.__TONYLocalModelBridge=true;
  const original=window.fetch.bind(window);
  const response=data=>new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
  const isChat=(url,o={})=>{const p=typeof url==='string'?url:(url?.url||'');return /\/api\/chat(?:\?|$)/.test(p)&&String(o.method||'GET').toUpperCase()==='POST'};
  const simple=/^(hi|hello|hey|thanks|thank you|what is \d+\s*[+\-*/]\s*\d+\??)$/i;
  const general=/\b(explain|compare|why|how|write|draft|analy[sz]e|reason|summarize|plan|describe|translate|code|story|essay|review)\b/i;
  window.fetch=async(url,options={})=>{
    if(!isChat(url,options))return original(url,options);
    let body={};try{body=JSON.parse(options.body||'{}')}catch{return original(url,options)}
    const messages=Array.isArray(body.messages)?body.messages:[],latest=[...messages].reverse().find(m=>m?.role==='user')?.content||'';
    try{
      // Prefer deterministic tools for genuinely deterministic requests.
      if(window.TONYReplicatedEngine&&!general.test(latest)){
        const r=window.TONYReplicatedEngine.replicate(latest,{allowModel:false});
        if(r&&!r.requiresModel)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,localReplica:true,operation:r.operation,intent:r.intent,attachmentCount:(body.attachments||[]).length});
      }
      // TinyLM is a fast micro-model; use it for short/local prompts when available.
      if(window.TONYTinyChat&&!general.test(latest)&&!simple.test(latest)){
        const r=window.TONYTinyChat.tinyChat.chat(latest,{maxTokens:96,temperature:.45});
        if(r?.reply&&r.confidence>=.68)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,tinyModel:true,attachmentCount:(body.attachments||[]).length});
      }
      // General language should use the actual pretrained local neural model.
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
