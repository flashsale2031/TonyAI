/* Pixel 069 — pixel sun/moon with stepped circular geometry. */
export function celestial(ctx,cx,cy,r=12,fill='#fff',phase=1){ctx.fillStyle=fill;for(let y=-r;y<=r;y++){const x=Math.floor(Math.sqrt(Math.max(0,r*r-y*y)));ctx.fillRect(cx-x,cy+y,x*2+1,1);}if(phase<1){ctx.globalCompositeOperation='destination-out';for(let y=-r;y<=r;y++){const x=Math.floor(Math.sqrt(Math.max(0,r*r-y*y)));ctx.fillRect(cx+Math.round((phase*2-1)*r*.5)-x,cy+y,x*2+1,1);}ctx.globalCompositeOperation='source-over';}}
if(typeof window!=='undefined')window.TONYPixel069={celestial};
