/* Pixel 074 — palette index encoder with packed Uint8 indices. */
export function encodePalette(data,palette){const out=new Uint8Array(data.length/4);for(let p=0,i=0;p<data.length;p+=4,i++){let best=0,dist=Infinity;for(let j=0;j<palette.length;j++){const q=palette[j],d=(data[p]-q[0])**2+(data[p+1]-q[1])**2+(data[p+2]-q[2])**2;if(d<dist){dist=d;best=j;}}out[i]=best;}return out;}
if(typeof window!=='undefined')window.TONYPixel074={encodePalette};
