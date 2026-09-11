/* Pixel 036 — RGB color distance and matching. */
export function distance(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);}
export function nearestColor(rgb,palette){return palette.reduce((best,p)=>distance(rgb,p)<distance(rgb,best)?p:best,palette[0]);}
if(typeof window!=='undefined')window.TONYPixel036={distance,nearestColor};
