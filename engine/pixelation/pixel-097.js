/* Pixel 097 — isometric tile renderer with diamond projection and depth ordering. */
export function isoTiles(ctx,map,tileW=16,tileH=8,ox=0,oy=0){for(let y=0;y<map.length;y++)for(let x=0;x<map[y].length;x++){const v=map[y][x],sx=ox+(x-y)*tileW/2,sy=oy+(x+y)*tileH/2-v*2;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+tileW/2,sy+tileH/2);ctx.lineTo(sx,sy+tileH);ctx.lineTo(sx-tileW/2,sy+tileH/2);ctx.closePath();ctx.fill();}}
if(typeof window!=='undefined')window.TONYPixel097={isoTiles};
