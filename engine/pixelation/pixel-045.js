/* Pixel 045 — contour extraction from binary masks. */
export function contour(mask,w,h){const pts=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!mask[i])continue;const edge=x===0||y===0||x===w-1||y===h-1||!mask[i-1]||!mask[i+1]||!mask[i-w]||!mask[i+w];if(edge)pts.push({x,y});}return pts;}
if(typeof window!=='undefined')window.TONYPixel045={contour};
