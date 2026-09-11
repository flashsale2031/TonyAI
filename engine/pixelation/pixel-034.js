/* Pixel 034 — RGB to indexed palette conversion. */
export function indexed(data,palette){const out=new Uint8Array(data.length/4);for(let i=0,j=0;i<data.length;i+=4,j++){let best=0,d=Infinity;palette.forEach((p,k)=>{const z=(data[i]-p[0])**2+(data[i+1]-p[1])**2+(data[i+2]-p[2])**2;if(z<d){d=z;best=k;}});out[j]=best;}return out;}
if(typeof window!=='undefined')window.TONYPixel034={indexed};
