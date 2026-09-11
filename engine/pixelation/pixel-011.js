/* Pixel 011 — horizontal/vertical scanline rasterization. */
export function scanlines(ctx,w,h,step=2,alpha=.15){ctx.save();ctx.globalAlpha=alpha;for(let y=0;y<h;y+=step)ctx.fillRect(0,y,w,1);ctx.restore();}
if(typeof window!=='undefined')window.TONYPixel011={scanlines};
