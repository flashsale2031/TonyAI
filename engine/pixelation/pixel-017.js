/* Pixel 017 — seeded value noise interpolation. */
export function valueNoise(x,y,seed=1){const hash=(ix,iy)=>{let n=(ix*374761393+iy*668265263+seed*1442695041)|0;n=(n^(n>>>13))*1274126177;return ((n^(n>>>16))>>>0)/4294967295};const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,s=t=>t*t*(3-2*t),u=s(fx),v=s(fy),a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);return a+(b-a)*u+((c+(d-c)*u)-(a+(b-a)*u))*v;}
if(typeof window!=='undefined')window.TONYPixel017={valueNoise};
