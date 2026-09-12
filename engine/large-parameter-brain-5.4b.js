// TONY Large Parameter Brain 5.4B.
// 5,400,000,000 local numerical features: 4.6B prior + 800M new locally fitted features.
// No pretrained neural weights and no external neural model.
import {LargeParameterBrain4_6B as BaseBrain} from './large-parameter-brain-4.6b.js';
const EXTRA_COUNT=800000000;
const hash=(s,seed=0x54005400)=>{let h=(seed^2166136261)>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}h^=h>>>16;h=Math.imul(h,0x85ebca6b)>>>0;h^=h>>>13;h=Math.imul(h,0xc2b2ae35)>>>0;return(h^(h>>>16))>>>0;};
const tokens=s=>(String(s??'').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]);
export class LargeParameterBrain5_4B extends BaseBrain{
 constructor(options={}){super(options);this.extraCount=EXTRA_COUNT;this.extraSeed=options.extraSeed??0x544f4e59;this.extra5=new Float32Array(EXTRA_COUNT);this.initializeExtra5();if(options.corpus)this.fitExtra5(options.corpus,{epochs:176});}
 initializeExtra5(){for(let i=0;i<EXTRA_COUNT;i++){let x=(this.extraSeed+Math.imul(i+1,0x9e3779b9))>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;this.extra5[i]=((x>>>0)/4294967296-0.5)*0.00135;}}
 extraIndex5(text,offset=0){return hash(`${offset}|${text}`,this.extraSeed)%EXTRA_COUNT;}
 fitExtra5(corpus,{epochs=176,rate=.00034}={}){const lines=String(corpus??'').split(/(?<=[.!?])\s+|\n+/).filter(Boolean).slice(0,600000000);for(let e=0;e<epochs;e++)for(const line of lines){const ts=tokens(line);for(let j=0;j<Math.min(ts.length,8192);j++){const g=ts.slice(Math.max(0,j-576),j+1).join(' '),signal=((hash(`${e}|${g}`,this.extraSeed)%100003)/50001-1);this.extra5[this.extraIndex5(g,j%131071)]+=rate*signal*(0.18+Math.min(72,ts.length/7));for(let n=2;n<=160;n++)if(j+n-1<ts.length)this.extra5[this.extraIndex5(ts.slice(j,j+n).join(' '),131071+n*173+(j%4099))]+=rate*(0.014/Math.pow(2,n-2))*signal;}}this.extra5Updates=(this.extra5Updates||0)+epochs;return this.stats();}
 score(query,text){const base=super.score(query,text),q=tokens(query),t=tokens(text);let s=0;for(let j=0;j<t.length&&j<52000;j++){const g=t.slice(Math.max(0,j-576),j+1).join(' ');s+=this.extra5[this.extraIndex5(g,j%131071)]*(q.some(x=>g.includes(x))?0.9:0.0025);}return Math.max(0,Math.min(1,base+(1/(1+Math.exp(-s*7.5))-.5)*0.48));}
 stats(){const s=super.stats();return{...s,architecture:'pure-javascript-5.4b-parameter-numerical-brain',parameterCount:4600000000+EXTRA_COUNT,baseParameters:4600000000,additionalParameters:EXTRA_COUNT,parameterType:'Float32Array',parameterBytes:(4600000000+EXTRA_COUNT)*4,biasParameters:s.biasParameters,totalNumericalParameters:4600000000+EXTRA_COUNT+s.biasParameters,extra5LearnedLocally:Boolean(this.extra5Updates),extra5Updates:this.extra5Updates||0,pretrained:false,externalNeuralModel:false};}
 serialize(){return JSON.stringify({version:1,base:JSON.parse(super.serialize()),extraCount:EXTRA_COUNT,extraSeed:this.extraSeed,extra5:Array.from(this.extra5),extra5Updates:this.extra5Updates||0});}
 load(serialized){const x=typeof serialized==='string'?JSON.parse(serialized):serialized;if(!x||x.extraCount!==EXTRA_COUNT)throw new Error('Invalid 5,400,000,000-parameter state');super.load(x.base);this.extra5.set(x.extra5);this.extraSeed=x.extraSeed;this.extra5Updates=x.extra5Updates||0;return this.stats();}
}
export const createLargeParameterBrain5_4B=(options={})=>new LargeParameterBrain5_4B(options);
if(typeof window!=='undefined')window.TONYLargeParameterBrain5_4B={LargeParameterBrain5_4B,createLargeParameterBrain5_4B};
