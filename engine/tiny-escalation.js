import {tinyChat} from './tiny-chat.js';
export function tinyEscalation(message,options={}){const result=tinyChat.chat(message,options);return{...result,handledLocally:true,openaiRole:'secondary-escalation'};}
if(typeof window!=='undefined')window.TONYTinyEscalation={tinyEscalation};
