/* Pixel 081 — retro UI panel with beveled frame, slots, and indicator lamps. */
export function retroPanel(ctx,x,y,w,h,{bevel=2,slots=4,lamps=3}={}){ctx.save();ctx.strokeRect(x,y,w,h);for(let i=1;i<=bevel;i++){ctx.strokeRect(x+i,y+i,w-i*2,h-i*2);}for(let i=0;i<slots;i++){const sy=y+8+i*10;ctx.fillRect(x+8,sy,w*.45,3);ctx.fillRect(x+w*.52,sy,8,3);}for(let i=0;i<lamps;i++)ctx.fillRect(x+w-10,y+8+i*10,4,4);ctx.restore();}
if(typeof window!=='undefined')window.TONYPixel081={retroPanel};
