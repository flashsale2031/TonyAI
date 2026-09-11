/* Pixel 070 — blocky lens flare with discrete rays and falloff. */
export function lensFlare(ctx,cx,cy,r=18,rays=8){ctx.save();for(let i=0;i<rays;i++){const a=i*Math.PI*2/rays, len=r*(1+(i%2)*.7), x=Math.round(cx+Math.cos(a)*len),y=Math.round(cy+Math.sin(a)*len);ctx.fillRect(Math.min(cx,x),Math.min(cy,y),Math.max(1,Math.abs(x-cx)),Math.max(1,Math.abs(y-cy)));}ctx.fillRect(cx-r/3,cy-r/3,Math.ceil(r*2/3),Math.ceil(r*2/3));ctx.restore();}
if(typeof window!=='undefined')window.TONYPixel070={lensFlare};
