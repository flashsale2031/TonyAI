/* Pixel 029 — stipple and halftone dots. */
export function stipple(ctx,w,h,step=4,density=.5){for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step)if(Math.random()<density)ctx.fillRect(x,y,1,1);}
if(typeof window!=='undefined')window.TONYPixel029={stipple};
