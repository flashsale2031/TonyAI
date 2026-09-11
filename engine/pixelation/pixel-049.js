/* Pixel 049 — wood-grain bands with seeded distortion. */
export function wood(ctx,w,h,seed=3){let s=seed>>>0;const rnd=()=>((s=s*1103515245+12345>>>0)/4294967296);for(let y=0;y<h;y+=2){const wave=Math.sin(y*.08)*4+Math.sin(y*.021)*7;ctx.fillStyle=`rgb(${105+(y%24)},${58+(y%15)},${28+(y%9)})`;ctx.fillRect(0,y,w,2);if(rnd()<.28){ctx.fillStyle='rgba(35,18,8,.45)';ctx.fillRect(Math.max(0,w*.5+wave+rnd()*30),y,1+Math.floor(rnd()*4),2);}}}
if(typeof window!=='undefined')window.TONYPixel049={wood};
