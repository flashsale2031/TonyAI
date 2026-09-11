/* Pixel 020 — tile-map composition. */
export function renderMap(ctx,map,tiles,tileSize=8){ctx.imageSmoothingEnabled=false;map.forEach((row,y)=>row.forEach((id,x)=>{const t=tiles[id];if(t)ctx.drawImage(t,x*tileSize,y*tileSize,tileSize,tileSize);}));}
export function mapSize(map,tileSize=8){return {width:(map[0]?.length||0)*tileSize,height:map.length*tileSize};}
if(typeof window!=='undefined')window.TONYPixel020={renderMap,mapSize};
