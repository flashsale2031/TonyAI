/* Pixel 053 — fractal Brownian motion height field. */
export function fbm(x,y,{octaves=5,lacunarity=2,gain=.5,noise}={}){let a=1,f=1,sum=0,norm=0;for(let i=0;i<octaves;i++){sum+=noise(x*f,y*f)*a;norm+=a;a*=gain;f*=lacunarity;}return sum/norm;}
export function heightMap(w,h,noise,opts={}){const out=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)out[y*w+x]=fbm(x/w,y/h,{...opts,noise});return out;}
if(typeof window!=='undefined')window.TONYPixel053={fbm,heightMap};
