// Offline language utilities: deterministic text intelligence without a hosted LLM.
const words=s=>String(s??'').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[];
const freq=(s)=>{const m=new Map();for(const w of words(s))m.set(w,(m.get(w)||0)+1);return m};
const stop=new Set('the a an and or but if then than of to in on for with from by is are was were be been this that these those it its as at into about what who where when why how can could would should do does did i you we they he she'.split(' '));
export const localLanguage=Object.freeze({
 keywords(text,n=10){return [...freq(text)].filter(([w])=>!stop.has(w)&&w.length>2).sort((a,b)=>b[1]-a[1]).slice(0,n).map(x=>x[0]);},
 sentences(text){return String(text??'').split(/(?<=[.!?])\s+/).filter(Boolean);},
 summarize(text,n=4){const ss=this.sentences(text);const f=freq(text);return ss.map((s,i)=>({s,i,score:words(s).reduce((x,w)=>x+(stop.has(w)?0:(f.get(w)||0)),0)/Math.max(1,words(s).length)})).sort((a,b)=>b.score-a.score).slice(0,n).sort((a,b)=>a.i-b.i).map(x=>x.s).join(' ');},
 classify(text){const s=String(text).toLowerCase();if(/[?]/.test(s))return 'question';if(/\b(explain|teach|learn)\b/.test(s))return 'learning';if(/\b(write|create|generate|make)\b/.test(s))return 'creation';if(/\b(fix|debug|repair)\b/.test(s))return 'debugging';if(/\b(compare|versus|vs)\b/.test(s))return 'comparison';return 'general';},
 similarity(a,b){const A=new Set(words(a).filter(x=>!stop.has(x))),B=new Set(words(b).filter(x=>!stop.has(x)));if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.sqrt(A.size*B.size);},
 rank(query,documents=[]){return documents.map((d,i)=>({document:d,index:i,score:this.similarity(query,typeof d==='string'?d:d?.text)})).sort((a,b)=>b.score-a.score);},
 keywordsForQuestion(q){return this.keywords(q,8).join(' ');},
 redactSecrets(text){return String(text??'').replace(/\b(?:sk|pk)_[A-Za-z0-9_-]{12,}\b/g,'[REDACTED]').replace(/(?:password|passwd|secret)\s*[:=]\s*[^\s]+/gi,'$1: [REDACTED]');}
});
if(typeof window!=='undefined')window.TONYLocalLanguage=localLanguage;
