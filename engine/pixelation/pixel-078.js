/* Pixel 078 — pixel bevel with raised and recessed edge masks. */
export function bevel(ctx,w,h,depth=3){for(let i=0;i<depth;i++){ctx.fillRect(i,i,w-2*i,1);ctx.fillRect(i,i,1,h-2*i);ctx.fillRect(i,h-1-i,w-2*i,1);ctx.fillRect(w-1-i,i,1,h-2*i);}}
if(typeof window!=='undefined')window.TONYPixel078={bevel};
