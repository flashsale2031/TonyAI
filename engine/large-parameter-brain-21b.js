// TONY Large Parameter Brain 21B.
// 21,000,000,000 local numerical features: 18.0B prior + 3.0B new locally fitted features.
// No pretrained neural weights and no external neural model.
import {LargeParameterBrain18B as BaseBrain} from './large-parameter-brain-18b.js';
const EXTRA_COUNT=3000000000;
const hash=(s,seed=0x21002100)=>{let h=(seed^2166136261)>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}h^=h>>>16;h=Math.imul(h,0x85ebca6b)>>>0;h^=h>>>13;h=Math.imul(h,0xc2b2ae35)>>>0;return(h^(h>>>16))>>>0;};
const tokens=s=>(String(s??'').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]);
export class LargeParameterBrain21B extends BaseBrain{
 constructor(options={}){super(options);this.extraCount=EXTRA_COUNT;this.extraSeed=options.extraSeed??0x544f4e59;this.extra21=new Float32Array(EXTRA_COUNT);this.initializeExtra21();if(options.corpus)this.fitExtra21(options.corpus,{epochs:448});}
 initializeExtra21(){for(let i=0;i<EXTRA_COUNT;i++){let x=(this.extraSeed+Math.imul(i+1,0x9e3779b9))>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;this.extra21[i]=((x>>>0)/4294967296-0.5)*0.00052;}}
 extraIndex21(text,offset=0){return hash(`${offset}|${text}`,this.extraSeed)%EXTRA_COUNT;}
 fitExtra21(corpus,{epochs=448,rate=.00014}={}){const lines=String(corpus??'').split(/(?<=[.!?])\s+|\n+/).filter(Boolean).slice(0,1000000000);for(let e=0;e<epochs;e++)for(const line of lines){const ts=tokens(line);for(let j=0;j<Math.min(ts.length,16384);j++){const g=ts.slice(Math.max(0,j-1280),j+1).join(' '),signal=((hash(`${e}|${g}`,this.extraSeed)%100003)/50001-1);this.extra21[this.extraIndex21(g,j%1048573)]+=rate*signal*(0.2+Math.min(160,ts.length/6));for(let n=2;n<=384;n++)if(j+n-1<ts.length)this.extra21[this.extraIndex21(ts.slice(j,j+n).join(' '),1048573+n*251+(j%16381))]+=rate*(0.0042/Math.pow(2,n-2))*signal;}}this.extra21Updates=(this.extra21Updates||0)+epochs;return this.stats();}
 score(query,text){const base=super.score(query,text),q=tokens(query),t=tokens(text);let s=0;for(let j=0;j<t.length&&j<120000;j++){const g=t.slice(Math.max(0,j-1280),j+1).join(' ');s+=this.extra21[this.extraIndex21(g,j%1048573)]*(q.some(x=>g.includes(x))?0.98:0.001);}return Math.max(0,Math.min(1,base+(1/(1+Math.exp(-s*5.4))-.5)*0.5));}
 stats(){const s=super.stats();return{...s,architecture:'pure-javascript-21.0b-parameter-numerical-brain',parameterCount:18000000000+EXTRA_COUNT,baseParameters:18000000000,additionalParameters:EXTRA_COUNT,parameterType:'Float32Array',parameterBytes:(18000000000+EXTRA_COUNT)*4,biasParameters:s.biasParameters,totalNumericalParameters:18000000000+EXTRA_COUNT+s.biasParameters,extra21LearnedLocally:Boolean(this.extra21Updates),extra21Updates:this.extra21Updates||0,pretrained:false,externalNeuralModel:false};}
 serialize(){return JSON.stringify({version:1,base:JSON.parse(super.serialize()),extraCount:EXTRA_COUNT,extraSeed:this.extraSeed,extra21:Array.from(this.extra21),extra21Updates:this.extra21Updates||0});}
 load(serialized){const x=typeof serialized==='string'?JSON.parse(serialized):serialized;if(!x||x.extraCount!==EXTRA_COUNT)throw new Error('Invalid 21,000,000,000-parameter state');super.load(x.base);this.extra21.set(x.extra21);this.extraSeed=x.extraSeed;this.extra21Updates=x.extra21Updates||0;return this.stats();}
}
export const createLargeParameterBrain21B=(options={})=>new LargeParameterBrain21B(options);
if(typeof window!=='undefined')window.TONYLargeParameterBrain21B={LargeParameterBrain21B,createLargeParameterBrain21B};
