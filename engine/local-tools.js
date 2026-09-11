// Offline-first utility toolbox for TONY. No model/API dependency.
const clean=s=>String(s??'').trim();
export const localTools=Object.freeze({
  calculator(expression){const s=clean(expression).replace(/,/g,'');if(!/^[0-9+\-*/%().\s]+$/.test(s))throw new Error('Only numeric arithmetic is supported');if(s.length>300)throw new Error('Expression too long');return Function(`"use strict";return (${s})`)();},
  wordCount(text){const t=clean(text);return {characters:t.length,words:t?t.split(/\s+/).length:0,lines:t?t.split(/\n/).length:0};},
  reverse(text){return [...String(text??'')].reverse().join('');},
  slug(text){return clean(text).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');},
  json(value){return JSON.stringify(value,null,2);},
  parseJSON(text){return JSON.parse(text);},
  unique(items=[]){return [...new Set(items)];},
  sort(items=[],direction='asc'){return [...items].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true})*(direction==='desc'?-1:1));},
  groupBy(items=[],key){return items.reduce((o,x)=>{const k=typeof key==='function'?key(x):x?.[key];(o[k]??=[]).push(x);return o;},{});},
  csv(rows=[]){if(!rows.length)return '';const keys=[...new Set(rows.flatMap(x=>Object.keys(x||{})))];const q=v=>`"${String(v??'').replaceAll('"','""')}"`;return [keys.map(q).join(','),...rows.map(r=>keys.map(k=>q(r?.[k])).join(','))].join('\n');},
  extractUrls(text){return [...String(text).matchAll(/https?:\/\/[^\s<>"']+/gi)].map(m=>m[0]);},
  extractEmails(text){return [...String(text).matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)].map(m=>m[0]);},
  template(text,data={}){return String(text).replace(/\{\{\s*([\w.-]+)\s*\}\}/g,(_,k)=>k.split('.').reduce((v,p)=>v?.[p],data)??'');},
  chunk(text,size=1000){const s=String(text);const n=Math.max(1,Number(size)||1000);const out=[];for(let i=0;i<s.length;i+=n)out.push(s.slice(i,i+n));return out;},
  summarize(text,maxSentences=5){const s=String(text).split(/(?<=[.!?])\s+/).filter(Boolean);return s.slice(0,Math.max(1,maxSentences)).join(' ');},
  dateISO(date=new Date()){return new Date(date).toISOString();},
  daysBetween(a,b){return Math.round(Math.abs(new Date(b)-new Date(a))/86400000);},
  clamp(n,min=0,max=1){return Math.min(max,Math.max(min,Number(n)));},
  hash(text){let h=2166136261;for(const c of String(text)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');}
});
if(typeof window!=='undefined')window.TONYLocalTools=localTools;
