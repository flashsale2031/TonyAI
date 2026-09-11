/* Pixel 035 — palette extraction by RGB histogram. */
export function histogram(data,bins=8){const h=new Map();for(let i=0;i<data.length;i+=4){const k=[data[i],data[i+1],data[i+2]].map(v=>Math.floor(v/256*bins)).join(',');h.set(k,(h.get(k)||0)+1);}return [...h.entries()].sort((a,b)=>b[1]-a[1]);}
if(typeof window!=='undefined')window.TONYPixel035={histogram};
