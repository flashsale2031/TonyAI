/* TONY Pixel Lab 007 — Bresenham pixel lines. */
export function bresenham(x0,y0,x1,y1,plot){let dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,e=dx+dy;for(;;){plot(x0,y0);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}
if(typeof window!=='undefined')window.TONYPixel007={bresenham};
