/* Pixel 041 — Atkinson dithering, useful for compact retro palettes. */
export function atkinson(data,w,h,levels=2){const q=v=>Math.round(v/255*(levels-1))*255/(levels-1);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;for(let k=0;k<3;k++){const old=data[i+k],nv=q(old),e=(old-nv)/8;data[i+k]=nv;for(const [dx,dy] of [[1,0],[2,0],[-1,1],[0,1],[1,1],[0,2]]){const X=x+dx,Y=y+dy;if(X>=0&&X<w&&Y>=0&&Y<h){const j=(Y*w+X)*4;data[j+k]=Math.max(0,Math.min(255,data[j+k]+e));}}}}return data;}
if(typeof window!=='undefined')window.TONYPixel041={atkinson};
