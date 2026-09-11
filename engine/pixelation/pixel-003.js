/* TONY Pixel Lab 003 — ordered dithering. */
const B=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
export function dither(data,width,height,levels=2){const step=255/Math.max(1,levels-1);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4,t=(B[y&3][x&3]/16-.5)*step;for(let k=0;k<3;k++)data[i+k]=Math.max(0,Math.min(255,Math.round((data[i+k]+t)/step)*step));}return data;}
if(typeof window!=='undefined')window.TONYPixel003={dither};
