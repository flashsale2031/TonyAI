/* Pixel 079 — directional metallic texture from stepped highlights. */
export function metalTexture(ctx,w,h,segments=24,seed=71){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296);for(let i=0;i<segments;i++){const y=Math.round(r()*h),width=Math.round(w*(.15+r()*.55));ctx.fillRect(Math.round(r()*(w-width)),y,width,1);if(i%4===0)ctx.fillRect(0,y+1,w,1);}}
if(typeof window!=='undefined')window.TONYPixel079={metalTexture};
