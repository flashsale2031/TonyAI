export const core108={time:()=>performance.now(),mark:(name)=>performance.mark(name),measure:(n,s,e)=>performance.measure(n,s,e)};
if(typeof window!=='undefined')window.TONYCore108=core108;