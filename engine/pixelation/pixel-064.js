/* Pixel 064 — grass blade field with clustered variation. */
export function grass(ctx,w,h,count=180,seed=37){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296);for(let i=0;i<count;i++){const x=r()*w,y=h-r()*h*.35,len=2+r()*7,lean=Math.round((r()-.5)*3);ctx.fillRect(Math.round(x),Math.round(y),1,Math.round(len));if(len>5)ctx.fillRect(Math.round(x+lean),Math.round(y-len*.5),1,2);}}
if(typeof window!=='undefined')window.TONYPixel064={grass};
