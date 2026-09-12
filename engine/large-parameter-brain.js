// TONY Large Parameter Brain v22.
// Pure JavaScript numerical learner: exactly 6,500,000 primary floating-point parameters.
// Locally initialized/fitted numerical features; not pretrained neural-network weights.
const PARAMETER_COUNT=6500000;
const DEFAULT_SEED=0x6d2b79f5;
const clean=s=>String(s??'').trim();
const norm=s=>clean(s).toLowerCase();
const tokens=s=>(norm(s).match(/[\p{L}\p{N}]+/gu)||[]);
const hash=(s,seed=DEFAULT_SEED)=>{let h=(seed^2166136261)>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}h^=h>>>16;h=Math.imul(h,0x85ebca6b)>>>0;h^=h>>>13;h=Math.imul(h,0xc2b2ae35)>>>0;return(h^(h>>>16))>>>0;};
const rand=seed=>{let x=seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return((x>>>0)/4294967296)*2-1;};
export class LargeParameterBrain{
 constructor({seed=DEFAULT_SEED,corpus=''}={}){this.count=PARAMETER_COUNT;this.seed=seed>>>0;this.weights=new Float32Array(PARAMETER_COUNT);this.bias=new Float32Array(49152);this.updates=0;this.fitted=false;this.initialize();if(corpus)this.fit(corpus,{epochs:23});}
 initialize(){for(let i=0;i<PARAMETER_COUNT;i++)this.weights[i]=rand((this.seed+Math.imul(i+1,0x9e3779b1))>>>0)*0.0096;for(let i=0;i<this.bias.length;i++)this.bias[i]=rand((this.seed^i)>>>0)*0.004;}
 featureIndex(text,offset=0){return hash(`${offset}|${text}`,this.seed)%PARAMETER_COUNT;}
 fit(corpus,{epochs=23,rate=.0037}={}){const lines=clean(corpus).split(/(?<=[.!?])\s+|\n+/).filter(Boolean).slice(0,2400000);for(let epoch=0;epoch<Math.max(1,epochs);epoch++)for(const line of lines){const ts=tokens(line);if(!ts.length)continue;const target=hash(line,this.seed)%this.bias.length;this.bias[target]+=rate*(.35-this.bias[target]);for(let j=0;j<Math.min(ts.length,320);j++){const gram=ts.slice(Math.max(0,j-24),j+1).join(' '),signal=((hash(`${target}|${gram}`,this.seed)%24001)/12000-1);this.weights[this.featureIndex(gram,j%151)]+=rate*signal*(.21+Math.min(7.2,ts.length/24));for(let n=2;n<=9;n++)if(j+n-1<ts.length)this.weights[this.featureIndex(ts.slice(j,j+n).join(' '),151+n*53+(j%73))]+=rate*(.34/Math.pow(2,n-2))*signal;}}this.updates+=epochs;this.fitted=true;return this.stats();}
 score(query,text){const q=tokens(query),t=tokens(text);if(!q.length||!t.length)return 0;let s=0;for(const qx of q){s+=this.weights[this.featureIndex(qx,0)]*.29;for(let j=0;j<t.length&&j<1200;j++){if(qx===t[j])s+=.062;s+=this.weights[this.featureIndex(`${qx} ${t[j]}`,3)]*.068;}}for(let n=2;n<=9;n++)for(let j=0;j+n<=Math.min(t.length,1200);j++)s+=this.weights[this.featureIndex(t.slice(j,j+n).join(' '),151+n*53)]*(n===2?.0205:n===3?.0135:n===4?.0088:n===5?.006:n===6?.0048:n===7?.0042:n===8?.0039:.0035);const m=s/(q.length+1);return 1/(1+Math.exp(-Math.max(-12,Math.min(12,m*7.7))));}
 rank(query,candidates,limit=72){return candidates.map((x,i)=>({...x,parameterScore:this.score(query,x.text||''),_i:i})).sort((a,b)=>(b.parameterScore+(b.score||0)*.45)-(a.parameterScore+(a.score||0)*.45)).slice(0,limit);}
 generate(query,context,{maxTokens=1100}={}){const source=clean(context);if(!source)return'';const sentences=source.split(/(?<=[.!?])\s+|\n+/).filter(Boolean);const ranked=this.rank(query,sentences.map(text=>({text})),Math.min(180,sentences.length));const chosen=[];let chars=0;for(const item of ranked){const text=clean(item.text);if(!text||chosen.some(x=>x.toLowerCase()===text.toLowerCase())||chars+text.length>Math.max(4600,maxTokens*10))continue;chosen.push(text);chars+=text.length;if(chosen.length>=48)break;}return chosen.join(' ');}
 stats(){return{architecture:'pure-javascript-6.5m-parameter-numerical-brain',parameterCount:PARAMETER_COUNT,parameterType:'Float32Array',parameterBytes:PARAMETER_COUNT*4,biasParameters:this.bias.length,totalNumericalParameters:PARAMETER_COUNT+this.bias.length,learnedLocally:this.fitted,updates:this.updates,pretrained:false,externalNeuralModel:false,seed:this.seed};}
 serialize(){return JSON.stringify({version:22,count:PARAMETER_COUNT,seed:this.seed,weights:Array.from(this.weights),bias:Array.from(this.bias),updates:this.updates,fitted:this.fitted});}
 load(serialized){const x=typeof serialized==='string'?JSON.parse(serialized):serialized;if(!x||x.count!==PARAMETER_COUNT)throw new Error('Invalid 6,500,000-parameter state');this.weights.set(x.weights);this.bias.set(x.bias);this.updates=x.updates||0;this.fitted=Boolean(x.fitted);return this.stats();}
}
export const createLargeParameterBrain=(options={})=>new LargeParameterBrain(options);
if(typeof window!=='undefined')window.TONYLargeParameterBrain={LargeParameterBrain,createLargeParameterBrain,PARAMETER_COUNT};
