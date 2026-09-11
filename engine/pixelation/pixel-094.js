/* Pixel 094 — recursive Sierpinski-style triangle fractal. */
export function sierpinski(ctx,x,y,size,depth=5){if(depth<=0){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+size,y);ctx.lineTo(x+size/2,y-size);ctx.closePath();ctx.fill();return;}const s=size/2;sierpinski(ctx,x,y,s,depth-1);sierpinski(ctx,x+s,y,s,depth-1);sierpinski(ctx,x+s/2,y-s,s,depth-1);}
if(typeof window!=='undefined')window.TONYPixel094={sierpinski};
