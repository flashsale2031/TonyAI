/* Pixel 019 — sprite-sheet slicing and drawing. */
export function slice(image,cols,rows,index){const w=image.width/cols,h=image.height/rows;return {sx:(index%cols)*w,sy:Math.floor(index/cols)*h,sw:w,sh:h};}
export function drawSprite(ctx,image,cols,rows,index,x,y,w=image.width/cols,h=image.height/rows){const s=slice(image,cols,rows,index);ctx.imageSmoothingEnabled=false;ctx.drawImage(image,s.sx,s.sy,s.sw,s.sh,x,y,w,h);}
if(typeof window!=='undefined')window.TONYPixel019={slice,drawSprite};
