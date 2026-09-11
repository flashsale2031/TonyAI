/* Pixel 040 — outline expansion via neighborhood dilation. */
export function dilate(mask,w,h,r=1){const out=new Uint8Array(mask);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let on=0;for(let yy=-r;yy<=r&&!on;yy++)for(let xx=-r;xx<=r;xx++){const X=x+xx,Y=y+yy;if(X>=0&&X<w&&Y>=0&&Y<h&&mask[Y*w+X]){on=1;break;}}out[y*w+x]=on;}return out;}
if(typeof window!=='undefined')window.TONYPixel040={dilate};
