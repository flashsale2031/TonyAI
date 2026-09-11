// Small offline knowledge/retrieval layer. Applications can seed it with their own documents.
const norm=s=>String(s??'').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
const tokens=s=>norm(s).split(' ').filter(Boolean);
export class LocalKnowledge {
 constructor(items=[]){this.items=[];this.add(items);}
 add(items=[]){for(const item of Array.isArray(items)?items:[items]){if(item)this.items.push(typeof item==='string'?{text:item}:item)}return this;}
 clear(){this.items=[];return this;}
 search(query,limit=6){const q=new Set(tokens(query));return this.items.map((item,index)=>{const t=tokens(item.text||item.content||item.title||'');let hits=0;for(const x of t)if(q.has(x))hits++;const score=q.size?hits/q.size:0;return {...item,index,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit);}
 answer(query,limit=4){const hits=this.search(query,limit);if(!hits.length)return null;return {text:hits.map(x=>x.text||x.content||x.title).join('\n\n'),hits,confidence:Math.min(.95,.45+(hits[0].score*.5))};}
}
export const localKnowledge=new LocalKnowledge();
if(typeof window!=='undefined')window.TONYLocalKnowledge=localKnowledge;
