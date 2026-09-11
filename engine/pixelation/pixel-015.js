/* Pixel 015 — hue/saturation/value color utilities. */
export function hsv(h,s,v){h=((h%360)+360)%360;s/=100;v/=100;const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c,seg=h/60;let r=0,g=0,b=0;if(seg<1)[r,g,b]=[c,x,0];else if(seg<2)[r,g,b]=[x,c,0];else if(seg<3)[r,g,b]=[0,c,x];else if(seg<4)[r,g,b]=[0,x,c];else if(seg<5)[r,g,b]=[x,0,c];else[r,g,b]=[c,0,x];return [r+m,g+m,b+m].map(z=>Math.round(z*255));}
if(typeof window!=='undefined')window.TONYPixel015={hsv};
