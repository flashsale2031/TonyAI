export const core043={href:(u)=>new URL(u,location.href).href,params:(u)=>Object.fromEntries(new URL(u,location.href).searchParams)};
if(typeof window!=='undefined')window.TONYCore043=core043;