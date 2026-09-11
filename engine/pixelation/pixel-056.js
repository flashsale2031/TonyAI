/* Pixel 056 — marble veins from layered sine fields. */
export function marble(ctx,w,h,scale=22,veins=4){const im=ctx.createImageData(w,h),d=im.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=x/scale+y/scale*.7+Math.sin(y/scale*veins+Math.sin(x/scale*2))*1.8,v=(Math.sin(n*6.28)+1)/2,i=(y*w+x)*4;d[i]=205-v*45;d[i+1]=205-v*55;d[i+2]=200-v*40;d[i+3]=255;}ctx.putImageData(im,0,0);return im;}
if(typeof window!=='undefined')window.TONYPixel056={marble};
