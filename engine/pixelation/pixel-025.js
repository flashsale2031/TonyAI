/* Pixel 025 — hard-edged shadow offsets. */
export function shadow(ctx,draw,x,y,dx=2,dy=2,color='#000'){ctx.save();ctx.fillStyle=color;ctx.translate(dx,dy);draw(ctx,x,y);ctx.restore();draw(ctx,x,y);}
if(typeof window!=='undefined')window.TONYPixel025={shadow};
