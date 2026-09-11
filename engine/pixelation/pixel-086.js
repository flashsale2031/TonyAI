/* Pixel 086 — radial burst/pattern field with alternating spokes. */
export function radialPattern(ctx,cx,cy,r=32,spokes=16){for(let i=0;i<spokes;i++){const a=i*Math.PI*2/spokes,a2=a+Math.PI/spokes;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r));ctx.lineTo(Math.round(cx+Math.cos(a2)*r*.72),Math.round(cy+Math.sin(a2)*r*.72));ctx.closePath();if(i%2)ctx.stroke();else ctx.fill();}}
if(typeof window!=='undefined')window.TONYPixel086={radialPattern};
