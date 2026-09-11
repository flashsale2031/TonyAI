/* Pixel 072 — CRT scanline, vignette, and RGB offset effect. */
export function crt(ctx,w,h,{scan=2,offset=1,vignette=true}={}){ctx.save();ctx.globalAlpha=.22;for(let y=0;y<h;y+=scan)ctx.fillRect(0,y,w,1);if(offset){ctx.globalAlpha=.18;ctx.fillRect(offset,0,1,h);ctx.fillRect(w-offset,0,1,h);}if(vignette){ctx.globalAlpha=.12;for(let i=0;i<Math.min(w,h)/4;i+=2){ctx.fillRect(i,0,1,h);ctx.fillRect(w-i,0,1,h);}}ctx.restore();}
if(typeof window!=='undefined')window.TONYPixel072={crt};
