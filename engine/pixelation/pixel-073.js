/* Pixel 073 — VHS glitch bands with seeded horizontal displacement. */
export function vhsGlitch(ctx,w,h,bands=12,seed=61){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296);ctx.save();for(let i=0;i<bands;i++){const y=Math.round(r()*h),bh=1+r()*5,dx=Math.round((r()-.5)*12);try{const d=ctx.getImageData(0,y,w,bh);ctx.putImageData(d,dx,y);}catch{ctx.fillRect(Math.max(0,dx),y,Math.min(w,Math.abs(dx)+2),bh);}}ctx.restore();}
if(typeof window!=='undefined')window.TONYPixel073={vhsGlitch};
