/* Pixel 057 — cloud puffs from deterministic overlapping circles. */
export function clouds(ctx,w,h,count=18,seed=4){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296);for(let i=0;i<count;i++){const x=r()*w,y=h*.2+r()*h*.45,rx=4+r()*12,ry=3+r()*8;ctx.fillStyle=`rgba(235,240,255,${.25+r()*.45})`;ctx.fillRect(x-rx,y-ry,rx*2,ry*2);ctx.fillRect(x-rx*.5,y-ry*1.5,rx,ry*3);}}
if(typeof window!=='undefined')window.TONYPixel057={clouds};
