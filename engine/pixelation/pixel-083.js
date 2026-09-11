/* Pixel 083 — bitmap font metrics, alignment, and wrapping helper. */
export function bitmapLayout(text,{scale=1,maxWidth=Infinity,spacing=1}={}){const cw=6*scale+spacing,lines=[];let line='';for(const ch of text){if(ch==='\n'||(line.length+1)*cw>maxWidth&&line){lines.push(line);line='';}if(ch!=='\n')line+=ch;}if(line)lines.push(line);return {lines,width:Math.min(maxWidth,Math.max(0,...lines.map(v=>v.length*cw))),height:lines.length*8*scale};}
if(typeof window!=='undefined')window.TONYPixel083={bitmapLayout};
