/* Pixel 047 — brick wall procedural texture. */
export function bricks(ctx,w,h,bw=16,bh=8,mortar='#222',a='#a55',b='#844'){ctx.fillStyle=mortar;ctx.fillRect(0,0,w,h);for(let y=0,row=0;y<h;y+=bh,row++)for(let x=-((row&1)?bw/2:0);x<w;x+=bw){ctx.fillStyle=((x/bw+row)&1)?a:b;ctx.fillRect(x+1,y+1,bw-2,bh-2);}}
if(typeof window!=='undefined')window.TONYPixel047={bricks};
