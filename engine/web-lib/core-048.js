export const core048={encode:(v)=>btoa(unescape(encodeURIComponent(String(v)))),decode:(v)=>decodeURIComponent(escape(atob(v)))};
if(typeof window!=='undefined')window.TONYCore048=core048;