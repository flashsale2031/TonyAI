export const core105={click:(el)=>{el?.click?.();return el},dispatch:(el,type)=>el?.dispatchEvent?.(new Event(type,{bubbles:true}))};
if(typeof window!=='undefined')window.TONYCore105=core105;