// TONY Local Brain — dependency-free browser/Node reasoning engine.
// This is an offline assistant layer: it does not contain a large pretrained
// language model. It combines deterministic intent parsing, retrieval hooks,
// math, dates, text transformation, and lightweight knowledge utilities.

const STOP=new Set('a an the and or but if then than of to in on for with from by is are was were be been being this that these those it its as at into about what who where when why how can could would should do does did'.split(' '));
const norm=s=>String(s??'').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
const tokens=s=>norm(s).split(' ').filter(Boolean);
const overlap=(a,b)=>{const A=new Set(tokens(a).filter(x=>!STOP.has(x)));const B=new Set(tokens(b).filter(x=>!STOP.has(x)));if(!A.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/A.size;};
const sentence=s=>String(s??'').split(/(?<=[.!?])\s+/).filter(Boolean);

function arithmetic(q){
  const s=String(q).replace(/,/g,'').replace(/[^0-9+\-*/().%\s]/g,'').trim();
  if(!/[+\-*/%]/.test(s)||!/^[-+*/%0-9().\s]+$/.test(s))return null;
  try{if(s.length>120)return null;const v=Function(`"use strict";return (${s})`)();return Number.isFinite(v)?String(v):null;}catch{return null;}
}
function unit(q){
  const m=norm(q).match(/(-?\d+(?:\.\d+)?)\s*(miles?|kilometers?|km|meters?|feet|ft|inches?|in|pounds?|lbs?|ounces?|oz|celsius|fahrenheit|f|c)\s+(?:to|in)\s+([a-z]+)/);
  if(!m)return null;const n=Number(m[1]),u=m[2],to=m[3];const key=x=>x.startsWith('mile')?'mi':x.startsWith('kil')||x==='km'?'km':x.startsWith('meter')?'m':x==='ft'||x.startsWith('foot')?'ft':x.startsWith('inch')||x==='in'?'in':x.startsWith('pound')||x==='lbs'?'lb':x.startsWith('ounce')||x==='oz'?'oz':x.startsWith('cels')||x==='c'?'c':x.startsWith('fahr')||x==='f'?'f':x;const a=key(u),b=key(to);
  const factors={mi:1609.344,km:1000,m:1,ft:.3048,in:.0254,lb:.45359237,oz:.028349523125};if(factors[a]&&factors[b])return `${n*factors[a]/factors[b]} ${to}`;if(a==='c'&&b==='f')return `${n*9/5+32} °F`;if(a==='f'&&b==='c')return `${(n-32)*5/9} °C`;return null;
}
function dateAnswer(q){const s=norm(q);if(!/date|day|today|tomorrow|yesterday|week|month|year/.test(s))return null;const d=new Date();if(s.includes('tomorrow'))d.setDate(d.getDate()+1);if(s.includes('yesterday'))d.setDate(d.getDate()-1);return d.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});}
function summarize(text,max=5){const ss=sentence(text);return ss.sort((a,b)=>b.length-a.length).slice(0,max).join(' ');}
function extractQuestion(q){return {tokens:tokens(q),urls:[...String(q).matchAll(/https?:\/\/[^\s)]+/gi)].map(x=>x[0]),questionType:/^\s*(who|what|where|when|why|how|is|are|can|does|did|will|should)\b/i.test(q)?'question':'request'};}

export class LocalBrain{
 constructor(){this.memory=[];this.knowledge=[];this.skills=new Map();}
 addKnowledge(items=[]){for(const item of items){if(item?.text)this.knowledge.push({...item,text:String(item.text)});}return this.knowledge.length;}
 remember(item){if(item)this.memory.push({at:Date.now(),...item});if(this.memory.length>500)this.memory.shift();}
 register(name,fn){this.skills.set(name,fn);}
 retrieve(q,limit=5){return [...this.knowledge].map(x=>({...x,score:overlap(q,x.text)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit);}
 answer(q){
  const input=String(q||'').trim();if(!input)return {reply:'What would you like help with?',confidence:.2,source:'local'};
  const math=arithmetic(input);if(math!==null)return {reply:math,confidence:.99,source:'local-math'};
  const conv=norm(input);if(/^(hi|hello|hey|good morning|good afternoon|good evening)$/.test(conv))return {reply:'Hello — I’m TONY. I can reason locally, work with files, perform calculations, transform text, and use configured web tools when available.',confidence:.98,source:'local'};
  const u=unit(input);if(u)return {reply:u,confidence:.99,source:'local-units'};
  const dt=dateAnswer(input);if(dt)return {reply:dt,confidence:.97,source:'local-date'};
  const hits=this.retrieve(input);if(hits.length)return {reply:summarize(hits.map(x=>x.text).join(' ')),confidence:Math.min(.92,.55+hits[0].score*.35),source:'local-knowledge',evidence:hits};
  if(/summarize|summary/.test(conv))return {reply:'Paste the text you want summarized and I’ll condense it locally.',confidence:.75,source:'local'};
  if(/rewrite|rephrase|paraphrase/.test(conv))return {reply:'Send the text and tell me the tone you want; I can rewrite it locally.',confidence:.75,source:'local'};
  return {reply:`I can handle this locally, but I don't have a pretrained general-purpose language model in JavaScript. For factual/current questions I should use TONY's configured web retrieval, and for complex generation I need a model provider. Your request was: “${input}”`,confidence:.35,source:'local'};
 }
}
export const localBrain=new LocalBrain();
if(typeof window!=='undefined')window.TONYLocalBrain=localBrain;
