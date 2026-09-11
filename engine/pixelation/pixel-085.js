/* Pixel 085 — geometric mandala from repeated radial polygons. */
export function mandala(ctx,cx,cy,r=24,arms=8,rings=4){for(let k=1;k<=rings;k++){const rr=r*k/rings;ctx.beginPath();for(let i=0;i<arms;i++){const a=i*Math.PI*2/arms, x=Math.round(cx+Math.cos(a)*rr),y=Math.round(cy+Math.sin(a)*rr);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.stroke();}}
if(typeof window!=='undefined')window.TONYPixel085={mandala};
