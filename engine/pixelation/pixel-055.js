/* Pixel 055 — Voronoi/cellular distance texture. */
export function voronoi(w,h,cell=10,seed=9){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296),pts=[];for(let y=-1;y<=h/cell+1;y++)for(let x=-1;x<=w/cell+1;x++)pts.push([x*cell+r()*cell,y*cell+r()*cell]);const out=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let d=Infinity;for(const p of pts)d=Math.min(d,Math.hypot(x-p[0],y-p[1]));out[y*w+x]=d/cell;}return out;}
if(typeof window!=='undefined')window.TONYPixel055={voronoi};
