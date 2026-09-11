/* Pixel 043 — flood fill on indexed masks. */
export function flood(buffer,w,h,x,y,target,replacement){if(target===replacement)return buffer;const q=[[x,y]];while(q.length){const [cx,cy]=q.pop();if(cx<0||cy<0||cx>=w||cy>=h)continue;const i=cy*w+cx;if(buffer[i]!==target)continue;buffer[i]=replacement;q.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);}return buffer;}
if(typeof window!=='undefined')window.TONYPixel043={flood};
