export const core100={worker:(src)=>new Worker(src,{type:'module'}),message:(w,data)=>w.postMessage(data)};
if(typeof window!=='undefined')window.TONYCore100=core100;