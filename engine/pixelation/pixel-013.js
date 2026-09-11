/* Pixel 013 — RGB channel splitting. */
export function chromatic(ctx,source,offset=2){ctx.globalCompositeOperation='screen';for(const [r,g,b,dx] of [['#f00',null,null,-offset],['#0f0',null,null,0],['#00f',null,null,offset]]){ctx.globalAlpha=.28;ctx.drawImage(source,dx,0);}}
export function css(){return '.tony-chromatic{filter:contrast(1.08) saturate(1.2)}';}
if(typeof window!=='undefined')window.TONYPixel013={chromatic,css};
