/* Pixel 021 — sprite mirroring and flipping. */
export function drawFlipped(ctx,image,x,y,w,h,{flipX=false,flipY=false}={}){ctx.save();ctx.translate(flipX?x+w:x,flipY?y+h:y);ctx.scale(flipX?-1:1,flipY?-1:1);ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0,w,h);ctx.restore();}
if(typeof window!=='undefined')window.TONYPixel021={drawFlipped};
