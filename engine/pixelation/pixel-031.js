/* Pixel 031 — stepped circles for hard-edged planets. */
export function steppedCircle(ctx,cx,cy,r,fill='#fff'){ctx.fillStyle=fill;for(let y=-r;y<=r;y++){const x=Math.floor(Math.sqrt(Math.max(0,r*r-y*y)));ctx.fillRect(cx-x,cy+y,x*2+1,1);}}
if(typeof window!=='undefined')window.TONYPixel031={steppedCircle};
