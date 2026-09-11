/* Pixel 067 — mountain layers using stepped horizon interpolation. */
export function mountains(ctx,w,h,layers=4,seed=53){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296);for(let l=0;l<layers;l++){const base=h*.72+l*3,pts=[];for(let x=0;x<=w;x+=4){const peak=base-(Math.abs(Math.sin(x*.025+l))*h*.25+r()*8);pts.push([x,peak]);}ctx.beginPath();ctx.moveTo(0,h);pts.forEach(([x,y])=>ctx.lineTo(x,Math.round(y)));ctx.lineTo(w,h);ctx.fill();}}
if(typeof window!=='undefined')window.TONYPixel067={mountains};
