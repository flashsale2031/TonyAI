/* Pixel 065 — foliage canopy from recursive branching clusters. */
export function foliage(ctx,x,y,size=24,depth=3,seed=5){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296);function branch(px,py,len,d){if(d<=0){ctx.fillRect(px,py,2,2);return;}const ang=(r()-.5)*1.2,ex=px+Math.sin(ang)*len,ey=py-len;ctx.fillRect(ex,ey,2,2);branch(ex,ey,len*.68,d-1);branch(ex,ey,len*.55,d-1);}branch(x,y,size,depth);}
if(typeof window!=='undefined')window.TONYPixel065={foliage};
