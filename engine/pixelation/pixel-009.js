/* TONY Pixel Lab 009 — palette ramps and gradients. */
export function ramp(a,b,n){const out=[];for(let i=0;i<n;i++){const t=n<2?0:i/(n-1);out.push(a.map((v,k)=>Math.round(v+(b[k]-v)*t)));}return out;}
export function gradientPalette(stops,n=16){if(stops.length<2)return stops;const out=[];for(let i=0;i<n;i++){const p=i/(n-1)*(stops.length-1),j=Math.min(stops.length-2,Math.floor(p)),t=p-j;out.push(stops[j].map((v,k)=>Math.round(v+(stops[j+1][k]-v)*t)));}return out;}
if(typeof window!=='undefined')window.TONYPixel009={ramp,gradientPalette};
