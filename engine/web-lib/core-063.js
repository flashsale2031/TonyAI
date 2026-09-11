export const core063={random:(min=0,max=1)=>Math.random()*(max-min)+min,int:(min,max)=>Math.floor(Math.random()*(max-min+1))+min};
if(typeof window!=='undefined')window.TONYCore063=core063;