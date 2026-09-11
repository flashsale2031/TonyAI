/* Pixel 018 — bilinear palette sampling. */
export function sampleGrid(grid,w,h,x,y){x=Math.max(0,Math.min(w-1,x));y=Math.max(0,Math.min(h-1,y));const x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(w-1,x0+1),y1=Math.min(h-1,y0+1),tx=x-x0,ty=y-y0,p=(i)=>grid[yIndex(i)*3] ;function yIndex(i){return i}const a=grid[y0*w+x0],b=grid[y0*w+x1],c=grid[y1*w+x0],d=grid[y1*w+x1];return [0,1,2].map(k=>(a[k]*(1-tx)+b[k]*tx)*(1-ty)+(c[k]*(1-tx)+d[k]*tx)*ty);}
if(typeof window!=='undefined')window.TONYPixel018={sampleGrid};
