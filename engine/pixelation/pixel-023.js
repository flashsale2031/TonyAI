/* Pixel 023 — triangle rasterizer facade. */
export function triangle(ctx,a,b,c,fill){ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...c);ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
export function barycentric(p,a,b,c){const v0=[b[0]-a[0],b[1]-a[1]],v1=[c[0]-a[0],c[1]-a[1]],v2=[p[0]-a[0],p[1]-a[1]],d=v0[0]*v1[1]-v1[0]*v0[1],v=(v2[0]*v1[1]-v1[0]*v2[1])/d,w=(v0[0]*v2[1]-v2[0]*v0[1])/d;return [1-v-w,v,w];}
if(typeof window!=='undefined')window.TONYPixel023={triangle,barycentric};
