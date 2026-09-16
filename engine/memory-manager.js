const SECRET=/\b(password|passcode|mfa|2fa|authentication code|private key|seed phrase|api key|token|credit card|bank account)\b/i;
function clean(value){return String(value??'').replace(/\s+/g,' ').trim().slice(0,1000);}
export class MemoryManager{
 constructor(seed=[]){this.items=[];for(const item of seed)this.add(item,{explicit:true});}
 add(input,{explicit=false,ttlMs=0}={}){const text=clean(typeof input==='string'?input:input?.text);if(!explicit||!text||SECRET.test(text))return {ok:false,reason:!explicit?'explicit-consent-required':'sensitive-memory-rejected'};const now=Date.now();const item={id:`mem-${now}-${Math.random().toString(36).slice(2,8)}`,text,createdAt:now,expiresAt:ttlMs?now+ttlMs:0};this.items=[...this.items.filter(x=>x.text!==text),item].slice(-100);return {ok:true,item};}
 list(){const now=Date.now();this.items=this.items.filter(x=>!x.expiresAt||x.expiresAt>now);return this.items.map(x=>({...x}));}
 search(query='',limit=5){const terms=clean(query).toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>2);return this.list().map(item=>({...item,score:terms.filter(term=>item.text.toLowerCase().includes(term)).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit);}
 remove(id){const before=this.items.length;this.items=this.items.filter(x=>x.id!==id);return before!==this.items.length;}
 clear(){this.items=[];}
 export(){return this.list().map(({id,text,createdAt,expiresAt})=>({id,text,createdAt,expiresAt}));}
}
