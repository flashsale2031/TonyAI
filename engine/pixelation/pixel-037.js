/* Pixel 037 — grayscale luminance mapping. */
export function grayscale(data){for(let i=0;i<data.length;i+=4){const y=Math.round(.2126*data[i]+.7152*data[i+1]+.0722*data[i+2]);data[i]=data[i+1]=data[i+2]=y;}return data;}
if(typeof window!=='undefined')window.TONYPixel037={grayscale};
