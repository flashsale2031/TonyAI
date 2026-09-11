/* Pixel 099 — GIF-like frame exporter using browser-native WebCodecs when available. */
export async function exportFrames(frames,{type='image/png',quality=.92,prefix='pixel-frame'}={}){const files=[];for(let i=0;i<frames.length;i++){const canvas=frames[i];const blob=await new Promise(resolve=>canvas.toBlob(resolve,type,quality));if(blob)files.push({name:`${prefix}-${String(i).padStart(3,'0')}.png`,blob});}return files;}
if(typeof window!=='undefined')window.TONYPixel099={exportFrames};
