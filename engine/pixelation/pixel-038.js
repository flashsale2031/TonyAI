/* Pixel 038 — threshold and silhouette extraction. */
export function threshold(data,cut=128){for(let i=0;i<data.length;i+=4){const y=.2126*data[i]+.7152*data[i+1]+.0722*data[i+2],v=y>=cut?255:0;data[i]=data[i+1]=data[i+2]=v;}return data;}
if(typeof window!=='undefined')window.TONYPixel038={threshold};
