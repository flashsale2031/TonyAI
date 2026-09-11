/* Pixel 089 — deterministic particle field with attraction, drift, and density. */
export function particleField(ctx,w,h,count=120,seed=89,{attractX=w/2,attractY=h/2,force=.002}={}){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296);for(let i=0;i<count;i++){let x=r()*w,y=r()*h,vx=(r()-.5)*2,vy=(r()-.5)*2;for(let t=0;t<8;t++){vx+=(attractX-x)*force;vy+=(attractY-y)*force;x+=vx;y+=vy;if(x<0||x>=w||y<0||y>=h)break;ctx.fillRect(Math.round(x),Math.round(y),1,1);}}}
if(typeof window!=='undefined')window.TONYPixel089={particleField};
