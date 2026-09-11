/* Pixel 032 — concentric ring renderer. */
export function rings(ctx,cx,cy,radii,colors){radii.forEach((r,i)=>{ctx.fillStyle=colors[i%colors.length];ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();});}
if(typeof window!=='undefined')window.TONYPixel032={rings};
