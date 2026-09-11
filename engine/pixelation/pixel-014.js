/* Pixel 014 — alpha-aware posterization. */
export function posterize(data,bands=8){const step=255/(bands-1);for(let i=0;i<data.length;i+=4)for(let k=0;k<3;k++)data[i+k]=Math.round(data[i+k]/step)*step;return data;}
if(typeof window!=='undefined')window.TONYPixel014={posterize};
