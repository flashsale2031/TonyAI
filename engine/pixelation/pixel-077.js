/* Pixel 077 — tiled pixel border generator with corner locking. */
export function pixelBorder(ctx,w,h,size=4){for(let x=0;x<w;x+=size){ctx.fillRect(x,0,size,1);ctx.fillRect(x,h-1,size,1);}for(let y=0;y<h;y+=size){ctx.fillRect(0,y,1,size);ctx.fillRect(w-1,y,1,size);}for(let i=0;i<size;i++){ctx.fillRect(i,i,1,1);ctx.fillRect(w-1-i,i,1,1);ctx.fillRect(i,h-1-i,1,1);ctx.fillRect(w-1-i,h-1-i,1,1);}}
if(typeof window!=='undefined')window.TONYPixel077={pixelBorder};
