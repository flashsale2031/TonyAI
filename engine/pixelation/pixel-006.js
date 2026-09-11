/* TONY Pixel Lab 006 — pixel-art primitives. */
export function rect(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
export function pixel(ctx,x,y,color,size=1){rect(ctx,x*size,y*size,size,size,color);}
export function line(ctx,points,color,size=1){ctx.fillStyle=color;for(const [x,y] of points)pixel(ctx,x,y,color,size);}
if(typeof window!=='undefined')window.TONYPixel006={rect,pixel,line};
