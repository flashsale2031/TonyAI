/* Pixel 059 — fire particle field for procedural flames. */
export function fire(ctx,w,h,count=120,seed=8){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296);for(let i=0;i<count;i++){const x=w*.25+r()*w*.5,y=h-r()*h*.75,size=1+r()*4;ctx.fillStyle=`rgba(255,${60+(r()*160)|0},${10+(r()*45)|0},${.15+r()*.7})`;ctx.fillRect(x+Math.sin(y*.05)*8,y,size,size);}}
if(typeof window!=='undefined')window.TONYPixel059={fire};
