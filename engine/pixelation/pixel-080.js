/* Pixel 080 — neon sign renderer with stepped tube strokes and halo. */
export function neonSign(ctx,text,x,y,{scale=2,gap=2}={}){ctx.save();ctx.font=`bold ${8*scale}px monospace`;ctx.textBaseline='top';for(let pass=3;pass>=1;pass--){ctx.globalAlpha=.08*pass;ctx.fillText(text,x,y+pass*gap);}ctx.globalAlpha=1;ctx.fillText(text,x,y);ctx.restore();}
if(typeof window!=='undefined')window.TONYPixel080={neonSign};
