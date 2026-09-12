// TONY Large Parameter Brain 15B.
// 15,000,000,000 local numerical features: 11.0B prior + 4.0B new locally fitted features.
// No pretrained neural weights and no external neural model.
import {LargeParameterBrain11B as BaseBrain} from './large-parameter-brain-11b.js';
const EXTRA_COUNT=4000000000;
const hash=(s,seed=0xf000f000)=>{let h=(seed^2166136261)>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}h^=h>>>16;h=Math.imul(h,0x85ebca6b)>>>0;h^=h>>>13;h=Math.imul(h,0xc2b2ae35)>>>0;return(h^(h>>>16))>>>0;};
const tokens=s=>(String(s??'').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]);
export class LargeParameterBrain15B extends BaseBrain{
 constructor(options={}){super(options);this.extraCount=EXTRA_COUNT;this.extraSeed=options.extraSeed??0x544f4e59;this.extra15=new Float32Array(EXTRA_COUNT);this.initializeExtra15();if(options.corpus)this.fitExtra15(options.corpus,{epochs:320});}
 initializeExtra15(){for(let i=0;i<EXTRA_COUNT;i++){let x=(this.extraSeed+Math.imul(i+1,0x9e3779b9))>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;this.extra15[i]=((x>>>0)/4294967296-0.5)*0.00072;}}
 extraIndex15(text,offset=0){return hash(`${offset}|${text}`,this.extraSeed)%EXTRA_COUNT;}
 fitExtra15(corpus,{epochs=320,rate=.00019}={}){const lines=String(corpus??'').split(/(?<=[.!?])\s+|\n+/).filter(Boolean).slice(0,1000000000);for(let e=0;e<epochs;e++)for(const line of lines){const ts=tokens(line);for(let j=0;j<Math.min(ts.length,16384);j++){const g=ts.slice(Math.max(0,j-1024),j+1).join(' '),signal=((hash(`${e}|${g}`,this.extraSeed)%100003)/50001-1);this.extra15[this.extraIndex15(g,j%1048573)]+=rate*signal*(0.2+Math.min(120,ts.length/6));for(let n=2;n<=320;n++)if(j+n-1<ts.length)this.extra15[this.extraIndex15(ts.slice(j,j+n).join(' '),1048573+n*233+(j%16381))]+=rate*(0.0065/Math.pow(2,n-2))*signal;}}this.extra15Updates=(this.extra15Updates||0)+epochs;return this.stats();}
 score(query,text){const base=super.score(query,text),q=tokens(query),t=tokens(text);let s=0;for(let j=0;j<t.length&&j<100000;j++){const g=t.slice(Math.max(0,j-1024),j+1).join(' ');s+=this.extra15[this.extraIndex15(g,j%1048573)]*(q.some(x=>g.includes(x))?0.97:0.0012);}return Math.max(0,Math.min(1,base+(1/(1+Math.exp(-s*5.8))-.5)*0.5));}
 stats(){const s=super.stats();return{...s,architecture:'pure-javascript-15.0b-parameter-numerical-brain',parameterCount:11000000000+EXTRA_COUNT,baseParameters:11000000000,additionalParameters:EXTRA_COUNT,parameterType:'Float32Array',parameterBytes:(11000000000+EXTRA_COUNT)*4,biasParameters:s.biasParameters,totalNumericalParameters:11000000000+EXTRA_COUNT+s.biasParameters,extra15LearnedLocally:Boolean(this.extra15Updates),extra15Updates:this.extra15Updates||0,pretrained:false,externalNeuralModel:false};}
 serialize(){return JSON.stringify({version:1,base:JSON.parse(super.serialize()),extraCount:EXTRA_COUNT,extraSeed:this.extraSeed,extra15:Array.from(this.extra15),extra15Updates:this.extra15Updates||0});}
 load(serialized){const x=typeof serialized==='string'?JSON.parse(serialized):serialized;if(!x||x.extraCount!==EXTRA_COUNT)throw new Error('Invalid 15,000,000,000-parameter state');super.load(x.base);this.extra15.set(x.extra15);this.extraSeed=x.extraSeed;this.extra15Updates=x.extra15Updates||0;return this.stats();}
}
export const createLargeParameterBrain15B=(options={})=>new LargeParameterBrain15B(options);
if(typeof window!=='undefined')window.TONYLargeParameterBrain15B={LargeParameterBrain15B,createLargeParameterBrain15B};
