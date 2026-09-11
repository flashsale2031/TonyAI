/* Pixel 084 — icon generator for common UI symbols on a grid. */
export function icon(ctx,type,x,y,size=8){const m={plus:['00100','00100','11111','00100','00100'],minus:['00000','00000','11111','00000','00000'],x:['10001','01010','00100','01010','10001'],check:['00001','00010','10100','01000','00000'],heart:['01010','11111','11111','01110','00100']};const g=m[type]||m.plus;for(let r=0;r<g.length;r++)for(let c=0;c<g[r].length;c++)if(g[r][c]==='1')ctx.fillRect(x+c*size,y+r*size,size,size);}
if(typeof window!=='undefined')window.TONYPixel084={icon};
