/* Pixel 028 — procedural stars. */
export function stars(ctx,w,h,count=100,seed=7){let s=seed>>>0;const rand=()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296};for(let i=0;i<count;i++){const x=Math.floor(rand()*w),y=Math.floor(rand()*h),z=rand();ctx.globalAlpha=.35+.65*z;ctx.fillRect(x,y,1,1);if(z>.9)ctx.fillRect(x-1,y,3,1);ctx.globalAlpha=1;}}
if(typeof window!=='undefined')window.TONYPixel028={stars};
