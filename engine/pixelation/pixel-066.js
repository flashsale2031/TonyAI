/* Pixel 066 — low-resolution tree generator with trunk and canopy. */
export function tree(ctx,x,ground,height=32,seed=41){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296);const top=ground-height;ctx.fillRect(x-1,top+height*.35,3,height*.65);for(let i=0;i<18;i++){const a=r()*Math.PI*2,rad=2+r()*7,cx=Math.round(x+(r()-.5)*height*.8),cy=Math.round(top+height*.25+(r()-.5)*height*.35);ctx.fillRect(cx-rad,cy-rad,rad*2,rad*2);}}
if(typeof window!=='undefined')window.TONYPixel066={tree};
