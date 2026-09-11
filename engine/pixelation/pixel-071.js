/* Pixel 071 — bloom approximation using expanding hard-edged masks. */
export function bloom(ctx,cx,cy,size=12,passes=4){ctx.save();for(let p=passes;p>=1;p--){const r=Math.round(size*p/passes);for(let y=-r;y<=r;y+=2)for(let x=-r;x<=r;x+=2)if(x*x+y*y<=r*r)ctx.fillRect(cx+x,cy+y,2,2);}ctx.restore();}
if(typeof window!=='undefined')window.TONYPixel071={bloom};
