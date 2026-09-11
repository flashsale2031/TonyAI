// Lightweight local evaluation harness for TinyLM.
// It does not claim frontier-level intelligence; it measures regressions locally.
const tokenize=s=>String(s||'').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[];
const overlap=(a,b)=>{const A=new Set(tokenize(a)),B=new Set(tokenize(b));if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.max(A.size,B.size);};
export function evaluateTinyModel(model,cases=[]){const rows=[];for(const c of cases){const prompt=String(c.prompt||''),expected=String(c.expected||'');const reply=model.generate(prompt,{maxTokens:c.maxTokens||64,temperature:c.temperature??.35,topK:c.topK||8,stopOnSentence:true});rows.push({prompt,expected,reply,overlap:overlap(reply,expected),perplexity:model.perplexity(expected)});}const avg=rows.length?rows.reduce((a,x)=>a+x.overlap,0)/rows.length:0;return{score:avg,cases:rows.length,results:rows};}
export const defaultTinyEval=[
 {prompt:'What is JavaScript?',expected:'JavaScript is a programming language used to build interactive web applications.'},
 {prompt:'Explain a database.',expected:'A database stores and organizes information so applications can retrieve and update it.'},
 {prompt:'What is an algorithm?',expected:'An algorithm is a step-by-step procedure for solving a problem.'}
];
if(typeof window!=='undefined')window.TONYTinyEvaluator={evaluateTinyModel,defaultTinyEval};
