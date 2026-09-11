/* Pixel 068 — ocean horizon with quantized wave bands. */
export function ocean(ctx,w,h,horizon=.58,waves=12){ctx.fillRect(0,horizon*h,w,h-horizon*h);for(let i=0;i<waves;i++){const y=Math.round(horizon*h+i*5);ctx.fillRect(0,y,w,1);for(let x=0;x<w;x+=8){if((x+i)%3===0)ctx.fillRect(x,y+1,3,1);}}}
if(typeof window!=='undefined')window.TONYPixel068={ocean};
