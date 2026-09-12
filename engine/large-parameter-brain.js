// TONY Large Parameter Brain v2.
// Pure JavaScript numerical learner: exactly 600,000 primary floating-point parameters.
// Parameters are fitted locally from TONY's JavaScript knowledge corpus at startup.
// This is not a pretrained neural network and does not contain copied model weights.

const PARAMETER_COUNT=600000;
const DEFAULT_SEED=0x6d2b79f5;
const clean=s=>String(s??'').trim();
const norm=s=>clean(s).toLowerCase();
const tokens=s=>(norm(s).match(/[\p{L}\p{N}]+/gu)||[]);
const hash=(s,seed=DEFAULT_SEED)=>{let h=(seed^2166136261)>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}h^=h>>>16;h=Math.imul(h,0x85ebca6b)>>>0;h^=h>>>13;h=Math.imul(h,0xc2b2ae35)>>>0;return(h^(h>>>16))>>>0;};
const rand=(seed)=>{let x=seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return ((x>>>0)/4294967296)*2-1;};

export class LargeParameterBrain{
 constructor({count=PARAMETER_COUNT,seed=DEFAULT_SEED,corpus=''}={}){
  this.count=PARAMETER_COUNT;
  this.seed=seed>>>0;
  this.weights=new Float32Array(PARAMETER_COUNT);
  this.bias=new Float32Array(4096);
  this.updates=0;
  this.fitted=false;
  this.initialize();
  if(corpus)this.fit(corpus,{epochs:4});
 }
 initialize(){for(let i=0;i<PARAMETER_COUNT;i++)this.weights[i]=rand((this.seed+Math.imul(i+1,0x9e3779b1))>>>0)*0.025;for(let i=0;i<this.bias.length;i++)this.bias[i]=rand((this.seed^i)>>>0)*0.01;}
 featureIndex(text,offset=0){return hash(`${offset}|${text}`,this.seed)%PARAMETER_COUNT;}
 fit(corpus,{epochs=3,rate=.0105}={}){
  const lines=clean(corpus).split(/(?<=[.!?])\s+|\n+/).filter(Boolean).slice(0,75000);
  for(let epoch=0;epoch<Math.max(1,epochs);epoch++){
   for(let i=0;i<lines.length;i++){
    const line=lines[i],ts=tokens(line);if(!ts.length)continue;
    const target=hash(line,this.seed)%4096;this.bias[target]+=rate*(.35-this.bias[target]);
    for(let j=0;j<Math.min(ts.length,72);j++){
     const gram=ts.slice(Math.max(0,j-4),j+1).join(' ');
     const idx=this.featureIndex(gram,j%11);const signal=((hash(`${target}|${gram}`,this.seed)%2001)/1000-1);
     this.weights[idx]+=rate*signal*(.5+Math.min(2.25,ts.length/32));
     if(j+1<ts.length){const pair=`${ts[j]} ${ts[j+1]}`;this.weights[this.featureIndex(pair,17+(j%7))]+=rate*.5*signal;}
     if(j+2<ts.length){const tri=`${ts[j]} ${ts[j+1]} ${ts[j+2]}`;this.weights[this.featureIndex(tri,29+(j%7))]+=rate*.25*signal;}
    }
    this.updates++;
   }
  }
  this.fitted=true;
  return this.stats();
 }
 score(query,text){
  const q=tokens(query),t=tokens(text);if(!q.length||!t.length)return 0;
  let score=0;
  for(let i=0;i<q.length;i++){
   const qx=q[i];score+=this.weights[this.featureIndex(qx,0)]*.35;
   for(let j=0;j<t.length&&j<128;j++){
    if(qx===t[j])score+=.06;
    score+=this.weights[this.featureIndex(`${qx} ${t[j]}`,3)]*.08;
   }
  }
  for(let j=0;j<Math.min(t.length-1,127);j++)score+=this.weights[this.featureIndex(`${t[j]} ${t[j+1]}`,17)]*.025;
  const mean=score/(q.length+1);return 1/(1+Math.exp(-Math.max(-12,Math.min(12,mean*7))));
 }
 rank(query,candidates,limit=8){return candidates.map((x,i)=>({...x,parameterScore:this.score(query,x.text||''),_i:i})).sort((a,b)=>(b.parameterScore+(b.score||0)*.4)-(a.parameterScore+(a.score||0)*.4)).slice(0,limit);}
 generate(query,context,{maxTokens=220}={}){
  const source=clean(context);if(!source)return'';
  const sentences=source.split(/(?<=[.!?])\s+|\n+/).filter(Boolean);
  const ranked=this.rank(query,sentences.map(text=>({text})),Math.min(16,sentences.length));
  const chosen=[];let chars=0;
  for(const item of ranked){const text=clean(item.text);if(!text||chosen.some(x=>x.toLowerCase()===text.toLowerCase()))continue;if(chars+text.length>Math.max(800,maxTokens*9))continue;chosen.push(text);chars+=text.length;if(chosen.length>=5)break;}
  return chosen.join(' ');
 }
 stats(){return{architecture:'pure-javascript-600k-parameter-numerical-brain',parameterCount:PARAMETER_COUNT,parameterType:'Float32Array',parameterBytes:PARAMETER_COUNT*4,biasParameters:this.bias.length,totalNumericalParameters:PARAMETER_COUNT+this.bias.length,learnedLocally:this.fitted,updates:this.updates,pretrained:false,externalNeuralModel:false,seed:this.seed};}
 serialize(){return JSON.stringify({version:2,count:PARAMETER_COUNT,seed:this.seed,weights:Array.from(this.weights),bias:Array.from(this.bias),updates:this.updates,fitted:this.fitted});}
 load(serialized){const x=typeof serialized==='string'?JSON.parse(serialized):serialized;if(!x||x.count!==PARAMETER_COUNT)throw new Error('Invalid 600,000-parameter state');this.weights.set(x.weights);this.bias.set(x.bias);this.updates=x.updates||0;this.fitted=Boolean(x.fitted);return this.stats();}
}

export const createLargeParameterBrain=(options={})=>new LargeParameterBrain(options);
if(typeof window!=='undefined')window.TONYLargeParameterBrain={LargeParameterBrain,createLargeParameterBrain,PARAMETER_COUNT};
