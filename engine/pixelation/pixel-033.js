/* Pixel 033 — dithering by Floyd–Steinberg error diffusion. */
export function floyd(data,w,h,levels=2){const q=v=>Math.round(v/255*(levels-1))*255/(levels-1);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,old=[data[i],data[i+1],data[i+2]],nv=old.map(q);old.forEach((v,k)=>{data[i+k]=nv[k];const e=v-nv[k];for(const [dx,dy,f] of [[1,0,7/16],[-1,1,3/16],[0,1,5/16],[1,1,1/16]]){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy<h){const j=(yy*w+xx)*4;data[j+k]=Math.max(0,Math.min(255,data[j+k]+e*f));}}});}return data;}
if(typeof window!=='undefined')window.TONYPixel033={floyd};
