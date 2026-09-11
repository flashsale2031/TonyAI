/* Pixel 091 — reaction-diffusion approximation using a discrete cellular automaton. */
export function reactionDiffusion(w,h,iterations=80,seed=101){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296),a=new Float32Array(w*h),b=new Float32Array(w*h);for(let i=0;i<a.length;i++)a[i]=r()>.94?1:0;for(let t=0;t<iterations;t++){for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x,n=(a[i-1]+a[i+1]+a[i-w]+a[i+w])*.25;b[i]=Math.max(0,Math.min(1,a[i]+.22*(n-a[i])-.08*a[i]*(1-a[i])));}a.set(b);}return a;}
if(typeof window!=='undefined')window.TONYPixel091={reactionDiffusion};
