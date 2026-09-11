/* Pixel 042 — nearest-neighbor palette swap for sprites. */
export function swap(data,from,to){const map=new Map(from.map((c,i)=>[c.join(','),to[i%to.length]]));for(let i=0;i<data.length;i+=4){const p=map.get([data[i],data[i+1],data[i+2]].join(','));if(p){data[i]=p[0];data[i+1]=p[1];data[i+2]=p[2];}}return data;}
if(typeof window!=='undefined')window.TONYPixel042={swap};
