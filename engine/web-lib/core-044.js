export const core044={sleep:(ms)=>new Promise(r=>setTimeout(r,ms)),raf:(fn)=>requestAnimationFrame(fn)};
if(typeof window!=='undefined')window.TONYCore044=core044;