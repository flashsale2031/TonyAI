/* Pixel 026 — glow by layered rectangles/circles. */
export function glow(ctx,x,y,r,color='#fff',layers=4){ctx.save();for(let i=layers;i>0;i--){ctx.globalAlpha=(layers-i+1)/(layers*layers);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r*i/layers,0,Math.PI*2);ctx.fill();}ctx.restore();}
if(typeof window!=='undefined')window.TONYPixel026={glow};
