/* Pixel 030 — pixelated terrain silhouette. */
export function terrain(ctx,w,h,base,horizon=.55,rough=10,fill='#243'){let y=h*horizon;ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(0,y);for(let x=0;x<=w;x+=rough){y+=((Math.random()-.5)*rough);y=Math.max(h*.2,Math.min(h*.85,y));ctx.lineTo(x,y);}ctx.lineTo(w,h);ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
if(typeof window!=='undefined')window.TONYPixel030={terrain};
