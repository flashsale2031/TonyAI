/* Pixel 039 — edge detection for pixel outlines. */
export function edges(data,w,h){const src=new Uint8ClampedArray(data);const lum=i=>.2126*src[i]+.7152*src[i+1]+.0722*src[i+2];for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=(y*w+x)*4,gx=lum(i+4)-lum(i-4),gy=lum(i+w*4)-lum(i-w*4),v=Math.min(255,Math.hypot(gx,gy));data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}return data;}
if(typeof window!=='undefined')window.TONYPixel039={edges};
