/* Pixel 012 — checkerboard texture. */
export function checker(ctx,w,h,size=8,a='#fff',b='#000'){for(let y=0;y<h;y+=size)for(let x=0;x<w;x+=size){ctx.fillStyle=((x/size+y/size)&1)?a:b;ctx.fillRect(x,y,size,size);}}
if(typeof window!=='undefined')window.TONYPixel012={checker};
