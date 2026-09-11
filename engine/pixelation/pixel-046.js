/* Pixel 046 — repeating tile texture composer. */
export function tile(ctx,source,w,h,tw,th){for(let y=0;y<h;y+=th)for(let x=0;x<w;x+=tw)ctx.drawImage(source,x,y,tw,th);}
export function tileMap(ctx,map,tiles,size=8){map.forEach((row,y)=>row.forEach((id,x)=>{const t=tiles[id];if(t)ctx.drawImage(t,x*size,y*size,size,size);}));}
if(typeof window!=='undefined')window.TONYPixel046={tile,tileMap};
