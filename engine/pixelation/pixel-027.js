/* Pixel 027 — palette-aware sky bands. */
export function sky(ctx,w,h,stops){const n=stops.length;for(let y=0;y<h;y++){const t=y/Math.max(1,h-1)*(n-1),i=Math.min(n-2,Math.floor(t)),f=t-i,a=stops[i],b=stops[i+1],c=a.map((v,k)=>Math.round(v+(b[k]-v)*f));ctx.fillStyle=`rgb(${c[0]},${c[1]},${c[2]})`;ctx.fillRect(0,y,w,1);}}
if(typeof window!=='undefined')window.TONYPixel027={sky};
