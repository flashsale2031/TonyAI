/* Pixel 050 — water ripple displacement field. */
export function ripple(data,w,h,amp=3,frequency=.12,phase=0){const src=new Uint8ClampedArray(data);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=Math.round(Math.sin(y*frequency+phase)*amp),dy=Math.round(Math.cos(x*frequency+phase)*amp),sx=Math.max(0,Math.min(w-1,x+dx)),sy=Math.max(0,Math.min(h-1,y+dy)),i=(y*w+x)*4,j=(sy*w+sx)*4;for(let k=0;k<4;k++)data[i+k]=src[j+k];}return data;}
if(typeof window!=='undefined')window.TONYPixel050={ripple};
