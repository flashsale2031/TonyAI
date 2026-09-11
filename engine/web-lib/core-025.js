export const core025={upper:(v)=>String(v??'').toUpperCase(),words:(v)=>String(v??'').trim().split(/\s+/).filter(Boolean)};
if(typeof window!=='undefined')window.TONYCore025=core025;