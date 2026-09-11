/* Pixel 061 — rain streak field with deterministic wind. */
export function rain(ctx,w,h,count=140,seed=17,wind=.35){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296);ctx.save();for(let i=0;i<count;i++){const x=r()*w,y=r()*h,len=2+r()*7;ctx.fillRect(Math.round(x),Math.round(y),1,Math.round(len));if(wind)ctx.fillRect(Math.round(x+wind*len),Math.round(y+len),1,1);}ctx.restore();}
if(typeof window!=='undefined')window.TONYPixel061={rain};
