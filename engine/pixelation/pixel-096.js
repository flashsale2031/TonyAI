/* Pixel 096 — topographic map generator using layered seeded elevation bands. */
export function topoMap(w,h,levels=8,seed=113){let s=seed>>>0,r=()=>((s=s*1664525+1013904223>>>0)/4294967296),out=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=Math.sin(x*.07)+Math.cos(y*.09)+Math.sin((x+y)*.035)+r()*.35;out[y*w+x]=Math.max(0,Math.min(levels-1,Math.floor((n+2.5)/5*levels)));}return out;}
if(typeof window!=='undefined')window.TONYPixel096={topoMap};
