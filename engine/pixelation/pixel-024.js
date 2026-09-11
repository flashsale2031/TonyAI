/* Pixel 024 — radial gradient lighting for pixel scenes. */
export function radial(ctx,x,y,r,inner,outer){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,inner);g.addColorStop(1,outer);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
if(typeof window!=='undefined')window.TONYPixel024={radial};
