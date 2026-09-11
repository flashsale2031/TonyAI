// TONY offline-first browser bridge.
// Order: deterministic JS -> local WebGPU/WASM model -> server/provider fallback.
(() => {
  if(typeof window==='undefined'||window.__TONYLocalModelBridge)return;
  window.__TONYLocalModelBridge=true;
  const original=window.fetch.bind(window);
  const response=(data)=>new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
  const isChat=(url,o={})=>{const p=typeof url==='string'?url:(url?.url||'');return /\/api\/chat(?:\?|$)/.test(p)&&String(o.method||'GET').toUpperCase()==='POST'};
  window.fetch=async(url,options={})=>{
    if(!isChat(url,options))return original(url,options);
    let body={};try{body=JSON.parse(options.body||'{}')}catch{return original(url,options)}
    const messages=Array.isArray(body.messages)?body.messages:[];
    const latest=[...messages].reverse().find(m=>m?.role==='user')?.content||'';
    try{
      if(window.TONYReplicatedEngine){
        const r=window.TONYReplicatedEngine.replicate(latest,{allowModel:false});
        if(r&&!r.requiresModel)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,localReplica:true,operation:r.operation,intent:r.intent,attachmentCount:(body.attachments||[]).length});
      }
      if(window.TONYLocalOrchestrator){
        const r=window.TONYLocalOrchestrator.answer(latest,{attachments:body.attachments||[]});
        if(r?.reply && r.confidence>=.75)return response({reply:r.reply,confidence:r.confidence,requiresHuman:false,localOrchestrator:true,route:r.route,operation:r.operation,intent:r.intent,attachmentCount:(body.attachments||[]).length});
      }
      if(window.TONYLocalModel){
        const r=await window.TONYLocalModel.chat(messages,{maxTokens:384,temperature:.7});
        if(r?.reply)return response({reply:r.reply,confidence:.72,requiresHuman:false,localModel:true,model:r.model,modelMode:r.mode,attachmentCount:(body.attachments||[]).length});
      }
    }catch(error){window.__TONYLocalError=String(error?.message||error)}
    return original(url,options);
  };
})();
