/* Pixel 052 — animated plasma field. */
export function plasma(ctx,w,h,time=0,scale=12){const im=ctx.createImageData(w,h),d=im.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=Math.sin(x/scale+time)+Math.sin(y/scale-time)+Math.sin((x+y)/scale+time*.7),n=(v+3)/6,i=(y*w+x)*4;d[i]=n*255;d[i+1]=(1-n)*180+n*60;d[i+2]=220-n*130;d[i+3]=255;}ctx.putImageData(im,0,0);return im;}
if(typeof window!=='undefined')window.TONYPixel052={plasma};
