/* Pixel 016 — procedural noise texture. */
export function noise(width,height,seed=1){const a=new Float32Array(width*height);let s=seed>>>0;for(let i=0;i<a.length;i++){s=(1664525*s+1013904223)>>>0;a[i]=s/4294967296;}return a;}
export function paintNoise(ctx,width,height,scale=1,seed=1){const n=noise(Math.ceil(width/scale),Math.ceil(height/scale),seed);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const v=n[Math.floor(y/scale)*Math.ceil(width/scale)+Math.floor(x/scale)];ctx.fillStyle=`rgb(${v*255},${v*255},${v*255})`;ctx.fillRect(x,y,1,1);}}
if(typeof window!=='undefined')window.TONYPixel016={noise,paintNoise};
