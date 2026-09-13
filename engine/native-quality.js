import { largeJavaScriptLM } from './large-js-lm.js';

const clean=s=>String(s??'').trim();
const words=s=>clean(s).match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)||[];
const escape=s=>clean(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const hash=s=>{let h=2166136261;for(const c of clean(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619)}return h>>>0};
const pick=(seed,a)=>a[seed%a.length];

function safeArithmetic(text){
 const raw=clean(text).replace(/^(calculate|compute|what is|solve)\s*/i,'').replace(/[?=]$/,'').trim();
 if(!/^[0-9+\-*/().%\s]+$/.test(raw)||!/[+\-*/%]/.test(raw))return null;
 try{const value=Function(`"use strict";return (${raw})`)();if(typeof value!=='number'||!Number.isFinite(value))return null;return Number.isInteger(value)?String(value):String(Number(value.toFixed(12)));}catch{return null;}
}

function sentenceSummary(text,max=3){
 const sentences=clean(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];
 if(sentences.length<=max)return sentences.join(' ').trim();
 const q=new Set(words(text).map(x=>x.toLowerCase()).filter(x=>x.length>3));
 return sentences.map((s,i)=>{let score=0;for(const w of words(s))if(q.has(w.toLowerCase()))score++;return{score:score+(i===0?1:0),s:s.trim()}}).sort((a,b)=>b.score-a.score).slice(0,max).sort((a,b)=>sentences.indexOf(a.s)-sentences.indexOf(b.s)).map(x=>x.s).join(' ');
}

function answer(query,{history=[],maxTokens=256}={}){
 const q=clean(query);
 const arithmetic=safeArithmetic(q);if(arithmetic!==null)return arithmetic;
 const wordCount=q.match(/^(?:word\s*count|count\s+words?)\s*:\s*([\s\S]+)$/i);if(wordCount)return JSON.stringify({words:words(wordCount[1]).length,characters:wordCount[1].length});
 const reverse=q.match(/^reverse\s*:\s*([\s\S]+)$/i);if(reverse)return [...reverse[1]].reverse().join('');
 const slug=q.match(/^slug\s*:\s*([\s\S]+)$/i);if(slug)return slug[1].toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
 const summary=q.match(/^(?:summarize|summary)\s*:\s*([\s\S]+)$/i);if(summary)return sentenceSummary(summary[1],3);
 const intents=largeJavaScriptLM.intent(q);
 const hits=largeJavaScriptLM.retrieve(q,10);
 const context=history.slice(-8).map(m=>`${m?.role||'user'}: ${clean(m?.content)}`).join('\n');
 const evidence=hits.slice(0,5).map(x=>x.text).filter(Boolean);
 const sections=[];
 if(context)sections.push(`Conversation context:\n${context}`);
 if(evidence.length)sections.push(evidence.join('\n'));
 const lead=intents.includes('write')?'Draft a complete response using the requested format and tone.':intents.includes('code')?'Give a concrete implementation or debugging answer, including assumptions and verification.':intents.includes('summarize')?'Preserve the main claim, evidence, decisions, risks, and next steps.':intents.includes('research')?'Separate known evidence from inference and identify what should be verified with current sources.':'Answer the request directly and concisely.';
 if(sections.length)return `${lead}\n\n${sections.join('\n\n')}`.slice(0,Math.max(512,Number(maxTokens)||256)*6);
 return largeJavaScriptLM.generate(q,{maxTokens:Math.min(Number(maxTokens)||256,512),temperature:.22});
}

function scene(prompt,options={}){
 const p=clean(prompt),seed=hash(p),size=String(options.size||'1024x1024').match(/^(\d+)x(\d+)$/)||[];
 const w=Math.max(256,Math.min(4096,Number(size[1]||1024))),h=Math.max(256,Math.min(4096,Number(size[2]||1024)));
 const lower=p.toLowerCase(),night=/night|moon|stars|space|dark/.test(lower),water=/ocean|sea|lake|river|beach/.test(lower),mountain=/mountain|hills|peaks/.test(lower),city=/city|skyline|building|street/.test(lower),forest=/forest|tree|garden|park/.test(lower),robot=/robot/.test(lower),dragon=/dragon/.test(lower),rocket=/rocket|space/.test(lower),car=/car|vehicle/.test(lower),apple=/apple/.test(lower),coffee=/coffee|cafe/.test(lower);
 const sky=night?'#071126':water?'#9bd4ef':'#b8d8f2',ground=water?'#1d7896':forest?'#315f3b':mountain?'#586a7d':'#6b8060';
 const accents=['#f59e0b','#22c55e','#38bdf8','#a78bfa','#f472b6','#ef4444'];
 const accent=pick(seed,accents), objects=[];
 if(mountain)objects.push(`<path d="M0 ${h*.68} L${w*.18} ${h*.34} L${w*.34} ${h*.58} L${w*.52} ${h*.24} L${w*.76} ${h*.6} L${w*.9} ${h*.38} L${w} ${h*.67} V${h} H0Z" fill="#516172"/><path d="M${w*.18} ${h*.34} L${w*.25} ${h*.47} L${w*.34} ${h*.58} L${w*.52} ${h*.24} L${w*.59} ${h*.38} L${w*.76} ${h*.6} L${w*.9} ${h*.38} L${w} ${h*.67} V${h*.78} H0 V${h*.68Z" fill="#d7e0e8" opacity=".55"/>`);
 if(city)for(let i=0;i<8;i++){const bw=70+(hash(`${p}:b${i}`)%140),x=(i/8)*w+bw*.1,top=h*(.35+(hash(`${p}:t${i}`)%25)/100);objects.push(`<rect x="${x}" y="${top}" width="${bw}" height="${h-top}" fill="#334155"/><g fill="#fbbf24">${Array.from({length:4},(_,r)=>`<rect x="${x+12}" y="${top+20+r*34}" width="12" height="10"/><rect x="${x+34}" y="${top+20+r*34}" width="12" height="10"/>`).join('')}</g>`)}
 if(water)objects.push(`<path d="M0 ${h*.66} Q${w*.18} ${h*.61} ${w*.36} ${h*.66} T${w*.72} ${h*.66} T${w} ${h*.66} V${h} H0Z" fill="${ground}"/><path d="M0 ${h*.73} Q${w*.2} ${h*.69} ${w*.4} ${h*.73} T${w} ${h*.73}" fill="none" stroke="#bfe8f5" stroke-width="8" opacity=".55"/>`);
 if(forest)for(let i=0;i<14;i++){const x=20+(hash(`${p}:tree${i}`)%(Math.max(1,w-40)));const y=h*.66-(hash(`${p}:ty${i}`)%120);objects.push(`<path d="M${x} ${y+80} L${x+28} ${y+80} L${x+20} ${y+45} L${x+45} ${y+45} L${x+14} ${y-10} L${x-17} ${y+45} L${x+8} ${y+45}Z" fill="#28553a"/><rect x="${x+10}" y="${y+70}" width="10" height="35" fill="#6b4f35"/>`)}
 if(apple)objects.push(`<ellipse cx="${w*.5}" cy="${h*.7}" rx="130" ry="45" fill="#fff" opacity=".92"/><circle cx="${w*.5}" cy="${h*.63}" r="72" fill="#dc2626"/><path d="M${w*.5} ${h*.56} Q${w*.53} ${h*.49} ${w*.57} ${h*.51}" fill="none" stroke="#315f3b" stroke-width="14"/>`);
 if(robot)objects.push(`<g transform="translate(${w*.5} ${h*.5})"><rect x="-70" y="-90" width="140" height="110" rx="25" fill="#cbd5e1" stroke="#475569" stroke-width="8"/><circle cx="-28" cy="-45" r="12" fill="${accent}"/><circle cx="28" cy="-45" r="12" fill="${accent}"/><rect x="-38" y="-5" width="76" height="10" rx="5" fill="#475569"/><rect x="-95" y="30" width="190" height="125" rx="28" fill="#94a3b8"/><path d="M-50 155 L-95 230 M50 155 L95 230 M-95 70 L-155 120 M95 70 L155 120" stroke="#64748b" stroke-width="30" stroke-linecap="round"/></g>`);
 if(dragon)objects.push(`<path d="M${w*.18} ${h*.48} Q${w*.35} ${h*.2} ${w*.54} ${h*.44} Q${w*.68} ${h*.55} ${w*.84} ${h*.28} L${w*.77} ${h*.55} Q${w*.57} ${h*.7} ${w*.4} ${h*.55} Q${w*.25} ${h*.68} ${w*.14} ${h*.55}Z" fill="${accent}" stroke="#4c1d95" stroke-width="10"/>`);
 if(rocket)objects.push(`<g transform="translate(${w*.55} ${h*.42}) rotate(-25)"><path d="M0 -130 Q70 -55 0 70 Q-70 -55 0 -130Z" fill="#e2e8f0" stroke="#475569" stroke-width="8"/><circle cy="-40" r="22" fill="#38bdf8"/><path d="M-28 50 L-65 100 L-18 84 M28 50 L65 100 L18 84" fill="#ef4444"/><path d="M-20 65 L0 135 L20 65Z" fill="#f97316"/></g>`);
 if(car)objects.push(`<g transform="translate(${w*.5} ${h*.66})"><path d="M-180 30 L-125 -35 L70 -35 L150 30 H190 V80 H-190 V30Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="8"/><rect x="-75" y="-25" width="70" height="48" fill="#bae6fd"/><rect x="5" y="-25" width="70" height="48" fill="#bae6fd"/><circle cx="-110" cy="80" r="34" fill="#111827"/><circle cx="110" cy="80" r="34" fill="#111827"/></g>`);
 if(coffee)objects.push(`<g transform="translate(${w*.5} ${h*.63})"><rect x="-190" y="-70" width="380" height="180" rx="18" fill="#8b5e3c"/><rect x="-125" y="-35" width="250" height="95" rx="12" fill="#f5f0e6"/><circle cx="0" cy="10" r="48" fill="#6f4e37"/><path d="M-10 -45 Q0 -90 10 -45" stroke="#fff" stroke-width="8" fill="none" opacity=".7"/></g>`);
 const stars=night?Array.from({length:40},(_,i)=>{const x=hash(`${p}:sx${i}`)%w,y=hash(`${p}:sy${i}`)%(Math.floor(h*.62));return `<circle cx="${x}" cy="${y}" r="${1+(i%3)}" fill="#fff" opacity=".${5+(i%5)}"/>`}).join(''):'';
 const moon=night?`<circle cx="${w*.78}" cy="${h*.2}" r="${Math.min(w,h)*.07}" fill="#fff7c2"/>`:'';
 const label=escape(p.slice(0,120));
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${night?'#172554':'#e0f2fe'}"/></linearGradient><filter id="soft"><feGaussianBlur stdDeviation="${Math.max(1,Math.round(Math.min(w,h)/400))}"/></filter></defs><rect width="100%" height="100%" fill="url(#sky)"/>${stars}${moon}<rect y="${h*.66}" width="100%" height="${h*.34}" fill="${ground}"/>${objects.join('')}<rect x="${w*.04}" y="${h*.88}" width="${w*.92}" height="${h*.08}" rx="16" fill="#000" opacity=".28"/><text x="${w*.06}" y="${h*.93}" fill="#fff" font-family="Arial,sans-serif" font-size="${Math.max(16,Math.round(w/48))}">${label}</text></svg>`;
 return {ok:true,image:`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,mimeType:'image/svg+xml',model:'tonyai-procedural-image-v2',size:`${w}x${h}`,prompt:p,seed,renderer:'procedural-svg-scene-v2'};
}

export const nativeQuality={
 version:'2.0.0',
 answer,
 scene,
 capabilities(){return{version:this.version,deterministicTextRouting:true,exactArithmetic:true,extractiveSummarization:true,contextAwareSynthesis:true,proceduralSceneGeneration:true,svg:true,externalImageModel:false,externalLanguageModel:false,openaiDependency:false};}
};
