/* Pixel 060 — sparks with velocity, gravity, and lifetime. */
export function sparks(ctx,w,h,count=90,seed=13){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296);for(let i=0;i<count;i++){let x=w*.5,y=h*.72,vx=(r()-.5)*3,vy=-(1+r()*4),life=5+r()*18;for(let t=0;t<life;t++){ctx.globalAlpha=1-t/life;ctx.fillRect(Math.round(x),Math.round(y),1,1);x+=vx;vy+=.18; y+=vy;}ctx.globalAlpha=1;}}
if(typeof window!=='undefined')window.TONYPixel060={sparks};
