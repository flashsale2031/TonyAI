// Makes the local model the preferred /api/chat provider in the browser.
// If WebGPU/WASM initialization fails, the original server request is preserved as fallback.
(() => {
  if(typeof window==='undefined'||!window.TONYLocalModel||window.__TONYLocalModelBridge)return;
  window.__TONYLocalModelBridge=true;
  const original=window.fetch.bind(window);
  const local=(url,options={})=>{
    const path=typeof url==='string'?url:(url?.url||'');
    return /\/api\/chat(?:\?|$)/.test(path)&&options?.method?.toUpperCase()==='POST';
  };
  window.fetch=async(url,options={})=>{
    if(!local(url,options))return original(url,options);
    try{
      const body=JSON.parse(options.body||'{}');
      const messages=Array.isArray(body.messages)?body.messages:[];
      if(!messages.length)return original(url,options);
      const result=await window.TONYLocalModel.chat(messages,{maxTokens:320,temperature:.7});
      if(!result?.reply)throw new Error('Local model returned an empty response');
      const payload={reply:result.reply,confidence:.72,requiresHuman:false,localModel:true,model:result.model,modelMode:result.mode,attachmentCount:(body.attachments||[]).length};
      return new Response(JSON.stringify(payload),{status:200,headers:{'content-type':'application/json'}});
    }catch(error){
      window.TONYLocalModel.lastError=String(error?.message||error);
      return original(url,options);
    }
  };
})();
