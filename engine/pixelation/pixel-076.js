/* Pixel 076 — sprite outline expansion around opaque pixels. */
export function spriteOutline(ctx,mask,w,h,radius=1){for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(mask[y*w+x])for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++)if(dx*dx+dy*dy<=radius*radius&&!mask[(y+dy)*w+(x+dx)])ctx.fillRect(x+dx,y+dy,1,1);}
if(typeof window!=='undefined')window.TONYPixel076={spriteOutline};
