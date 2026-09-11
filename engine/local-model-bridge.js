// Browser routing bridge: deterministic replica first, local WebGPU/WASM model second,
// server /api/chat last. This keeps the supplied engine's common operations offline-first.
(() => {
  if(typeof window==='undefined'||window.__TONYLocalModelBridge)return;
  window.__TONYLocalModelBridge=true;
  const original=window.fetch.bind(window);
  const isChat=(url,options={})=>{const path=typeof url==='string'?url:(url?.url||'');return /\/api\/chat(?:\?|$)/.test(path)&&options?.method?.toUpperCase()==='POST';};
  window.fetch=async(url,options={})=>{
    if(!isChat(url,options))return original(url,options);
    let body={};try{body=JSON.parse(options.body||'{}')}catch{return original(url,options)}
    const messages=Array.isArray(body.messages)?body.messages:[];if(!messages.length)return original(url,options);
    const latest=[...messages].reverse().find(m=>m?.role==='user')?.content||'';
    try{
      if(window.TONYReplicatedEngine){
        const replica=window.TONYReplicatedEngine.replicate(latest);
        if(replica&&!replica.requiresModel)return new Response(JSON.stringify({reply:replica.reply,confidence:replica.confidence,requiresHuman:false,localReplica:true,operation:replica.operation,intent:replica.intent,attachmentCount:(body.attachments||[]).length}),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
      }
      if(window.TONYLocalModel){
        const result=await window.TONYLocalModel.chat(messages,{maxTokens:320,temperature:.7});
        if(result?.reply)return new Response(JSON.stringify({reply:result.reply,confidence:.72,requiresHuman:false,localModel:true,model:result.model,modelMode:result.mode,attachmentCount:(body.attachments||[]).length}),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
      }
    }catch(error){if(window.TONYLocalModel)window.TONYLocalModel.lastError=String(error?.message||error)}
    return original(url,options);
  };
})();
