/* Pixel 058 — smoke wisps using layered translucent blocks. */
export function smoke(ctx,w,h,count=80,seed=21){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296);for(let i=0;i<count;i++){const x=w*.2+r()*w*.6,y=h-r()*h*.8,size=2+r()*8;ctx.fillStyle=`rgba(190,190,205,${.025+r()*.08})`;ctx.fillRect(x+Math.sin(y*.03)*10-size,y,size,size);}}
if(typeof window!=='undefined')window.TONYPixel058={smoke};
