/* Pixel 087 — kaleidoscope sampler that mirrors a source canvas into sectors. */
export function kaleidoscope(ctx,source,cx,cy,r=64,sectors=8){const step=Math.PI*2/sectors;ctx.save();ctx.translate(cx,cy);for(let i=0;i<sectors;i++){ctx.save();ctx.rotate(i*step);if(i%2)ctx.scale(1,-1);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,0,step);ctx.closePath();ctx.clip();ctx.drawImage(source,-cx,-cy);ctx.restore();}ctx.restore();}
if(typeof window!=='undefined')window.TONYPixel087={kaleidoscope};
