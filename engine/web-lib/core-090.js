export const core090={encode:(v)=>new TextEncoder().encode(String(v)),decode:(v)=>new TextDecoder().decode(v)};
if(typeof window!=='undefined')window.TONYCore090=core090;