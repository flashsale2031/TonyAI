/* Pixel 062 — snowflake field with six-arm crystalline glyphs. */
export function snow(ctx,w,h,count=80,seed=23){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296);for(let i=0;i<count;i++){const x=Math.round(r()*w),y=Math.round(r()*h),q=1+(r()*3|0);ctx.fillRect(x,y,q,q);if(q>2){ctx.fillRect(x-1,y,x+1,1);ctx.fillRect(x,y-1,1,3);}}}
if(typeof window!=='undefined')window.TONYPixel062={snow};
