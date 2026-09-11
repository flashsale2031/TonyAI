export const core110={postMessage:(target,data)=>target?.postMessage?.(data),onMessage:(target,fn)=>{target.onmessage=fn;return target}};
if(typeof window!=='undefined')window.TONYCore110=core110;