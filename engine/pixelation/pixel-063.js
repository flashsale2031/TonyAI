/* Pixel 063 — fog layers with depth-based opacity. */
export function fog(ctx,w,h,layers=10,seed=31){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296);for(let i=0;i<layers;i++){const y=r()*h;ctx.fillStyle=`rgba(220,225,230,${.025+r()*.06})`;ctx.fillRect(0,y,w,3+r()*12);}}
if(typeof window!=='undefined')window.TONYPixel063={fog};
