/* TONY Pixel Lab 004 — nearest-neighbor image scaling. */
export function nearest(ctx,source,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(source,0,0,w,h);return c;}
export function drawNearest(ctx,image,x,y,w,h){ctx.imageSmoothingEnabled=false;ctx.drawImage(image,x,y,w,h);}
if(typeof window!=='undefined')window.TONYPixel004={nearest,drawNearest};
