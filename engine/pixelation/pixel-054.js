/* Pixel 054 — value-noise interpolation for organic textures. */
function hash(x,y,s=1){let n=(x*374761393+y*668265263+s*1442695041)|0;n=(n^(n>>>13))*1274126177;return ((n^(n>>>16))>>>0)/4294967296;}
export function valueNoise(x,y,seed=1){const x0=Math.floor(x),y0=Math.floor(y),u=x-x0,v=y-y0,s=t=>t*t*(3-2*t),a=hash(x0,y0,seed),b=hash(x0+1,y0,seed),c=hash(x0,y0+1,seed),d=hash(x0+1,y0+1,seed),ab=a+(b-a)*s(u),cd=c+(d-c)*s(u);return ab+(cd-ab)*s(v);}
if(typeof window!=='undefined')window.TONYPixel054={valueNoise};
