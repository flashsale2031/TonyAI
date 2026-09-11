/* Pixel 048 — stone texture using deterministic cell noise. */
export function stone(ctx,w,h,size=10,seed=11){let s=seed>>>0;const rnd=()=>((s=s*1664525+1013904223>>>0)/4294967296);for(let y=0;y<h;y+=size)for(let x=0;x<w;x+=size){const v=90+rnd()*70;ctx.fillStyle=`rgb(${v|0},${(v*.96)|0},${(v*.9)|0})`;ctx.fillRect(x,y,size+1,size+1);if(rnd()<.22){ctx.fillStyle='rgba(20,20,20,.35)';ctx.fillRect(x+rnd()*size,y+rnd()*size,1+size*.15,1);}}}
if(typeof window!=='undefined')window.TONYPixel048={stone};
