/* Pixel 022 — pixel polygon rasterization. */
export function polygon(ctx,points,fill){ctx.save();ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.restore();}
if(typeof window!=='undefined')window.TONYPixel022={polygon};
