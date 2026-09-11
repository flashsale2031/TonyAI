/* TONY Pixel Lab 001 — deterministic pixel-grid renderer. */
export function pixelGrid({width=64,height=64,scale=8,fill='#fff'}={}){const c=document.createElement('canvas');c.width=width*scale;c.height=height*scale;const x=c.getContext('2d');x.fillStyle=fill;x.fillRect(0,0,c.width,c.height);return {canvas:c,ctx:x,scale};}
export function snap(v,scale){return Math.round(v/scale)*scale;}
if(typeof window!=='undefined')window.TONYPixel001={pixelGrid,snap};
