/* TONY Pixel Lab 010 — CSS pixel-art image shell. */
export function pixelCSS({size=4,filter='none'}={}){return `.tony-pixel-art{image-rendering:pixelated;image-rendering:crisp-edges;filter:${filter};width:auto;height:auto;}`;}
export function pixelStyle(selector='.tony-pixel-art',size=4){return `${selector}{image-rendering:pixelated;image-rendering:crisp-edges;transform-origin:0 0;}`;}
if(typeof window!=='undefined')window.TONYPixel010={pixelCSS,pixelStyle};
