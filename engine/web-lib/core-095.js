export const core095={loadImage:(src)=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})};
if(typeof window!=='undefined')window.TONYCore095=core095;