/* Pixel 044 — connected-component labeling for sprite masks. */
export function components(mask,w,h){const seen=new Uint8Array(mask.length),out=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const s=y*w+x;if(!mask[s]||seen[s])continue;const q=[s],cells=[];seen[s]=1;while(q.length){const i=q.pop(),cx=i%w,cy=Math.floor(i/w);cells.push([cx,cy]);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=cx+dx,Y=cy+dy,j=Y*w+X;if(X>=0&&X<w&&Y>=0&&Y<h&&mask[j]&&!seen[j]){seen[j]=1;q.push(j);}}}out.push(cells);}return out;}
if(typeof window!=='undefined')window.TONYPixel044={components};
