export const core039={scroll:(el,x,y)=>el?.scrollTo?.(x,y),into:(el)=>el?.scrollIntoView?.({behavior:'smooth',block:'nearest'})};
if(typeof window!=='undefined')window.TONYCore039=core039;