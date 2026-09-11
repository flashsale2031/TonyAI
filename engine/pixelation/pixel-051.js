/* Pixel 051 — sine-wave displacement for water, flags, and heat haze. */
export function wave(data,w,h,amp=4,wavelength=18,phase=0){const src=new Uint8ClampedArray(data);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const sx=Math.round(x+Math.sin(y/wavelength+phase)*amp),sy=Math.max(0,Math.min(h-1,y)),xx=Math.max(0,Math.min(w-1,sx)),i=(y*w+x)*4,j=(sy*w+xx)*4;data.set(src.subarray(j,j+4),i);}return data;}
if(typeof window!=='undefined')window.TONYPixel051={wave};
