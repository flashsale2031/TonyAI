export const core083={textInput:(el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}))}};
if(typeof window!=='undefined')window.TONYCore083=core083;