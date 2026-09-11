/* TONY Pixel Lab 002 — palette quantization. */
export function quantize(rgb,palette=[]){if(!palette.length)return rgb;let best=palette[0],d=Infinity;for(const p of palette){const q=(rgb[0]-p[0])**2+(rgb[1]-p[1])**2+(rgb[2]-p[2])**2;if(q<d){d=q;best=p;}}return best;}
export function quantizeImage(data,palette){for(let i=0;i<data.length;i+=4){const p=quantize([data[i],data[i+1],data[i+2]],palette);data[i]=p[0];data[i+1]=p[1];data[i+2]=p[2];}return data;}
if(typeof window!=='undefined')window.TONYPixel002={quantize,quantizeImage};
