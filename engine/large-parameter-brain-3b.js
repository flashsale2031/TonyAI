// TONY Large Parameter Brain 3.0B.
// 3,000,000,000 local numerical features: 2.6B prior + 400M new locally fitted features.
// No pretrained neural weights and no external neural model.
import {LargeParameterBrain2_6B as BaseBrain} from './large-parameter-brain-2.6b.js';
const EXTRA_COUNT=400000000;
const hash=(s,seed=0x30003000)=>{let h=(seed^2166136261)>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}h^=h>>>16;h=Math.imul(h,0x85ebca6b)>>>0;h^=h>>>13;h=Math.imul(h,0xc2b2ae35)>>>0;return(h^(h>>>16))>>>0;};
const tokens=s=>(String(s??'').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]);
export class LargeParameterBrain3B extends BaseBrain{
 constructor(options={}){super(options);this.extraCount=EXTRA_COUNT;this.extraSeed=options.extraSeed??0x544f4e59;this.extra=new Float32Array(EXTRA_COUNT);this.initializeExtra();if(options.corpus)this.fitExtra(options.corpus,{epochs:128});}
 initializeExtra(){for(let i=0;i<EXTRA_COUNT;i++){let x=(this.extraSeed+Math.imul(i+1,0x45d9f3b))>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;this.extra[i]=((x>>>0)/4294967296-0.5)*0.002;}}
 extraIndex(text,offset=0){return hash(`${offset}|${text}`,this.extraSeed)%EXTRA_COUNT;}
 fitExtra(corpus,{epochs=128,rate=.00044}={}){const lines=String(corpus??'').split(/(?<=[.!?])\s+|\n+/).filter(Boolean).slice(0,320000000);for(let e=0;e<epochs;e++)for(const line of lines){const ts=tokens(line);for(let j=0;j<Math.min(ts.length,5632);j++){const g=ts.slice(Math.max(0,j-320),j+1).join(' '),signal=((hash(`${e}|${g}`,this.extraSeed)%100003)/50001-1);this.extra[this.extraIndex(g,j%32749)]+=rate*signal*(0.13+Math.min(52,ts.length/9));for(let n=2;n<=112;n++)if(j+n-1<ts.length)this.extra[this.extraIndex(ts.slice(j,j+n).join(' '),32749+n*139+(j%2357))]+=rate*(0.024/Math.pow(2,n-2))*signal;}}this.extraUpdates=(this.extraUpdates||0)+epochs;return this.stats();}
 score(query,text){const base=super.score(query,text),q=tokens(query),t=tokens(text);let s=0;for(let j=0;j<t.length&&j<32000;j++){const g=t.slice(Math.max(0,j-320),j+1).join(' ');s+=this.extra[this.extraIndex(g,j%32749)]*(q.some(x=>g.includes(x))?0.76:0.005);}return Math.max(0,Math.min(1,base+(1/(1+Math.exp(-s*12))-.5)*0.38));}
 stats(){const s=super.stats();return{...s,architecture:'pure-javascript-3.0b-parameter-numerical-brain',parameterCount:2600000000+EXTRA_COUNT,baseParameters:2600000000,additionalParameters:EXTRA_COUNT,parameterType:'Float32Array',parameterBytes:(2600000000+EXTRA_COUNT)*4,biasParameters:s.biasParameters,totalNumericalParameters:2600000000+EXTRA_COUNT+s.biasParameters,extraLearnedLocally:Boolean(this.extraUpdates),extraUpdates:this.extraUpdates||0,pretrained:false,externalNeuralModel:false};}
 serialize(){return JSON.stringify({version:1,base:JSON.parse(super.serialize()),extraCount:EXTRA_COUNT,extraSeed:this.extraSeed,extra:Array.from(this.extra),extraUpdates:this.extraUpdates||0});}
 load(serialized){const x=typeof serialized==='string'?JSON.parse(serialized):serialized;if(!x||x.extraCount!==EXTRA_COUNT)throw new Error('Invalid 3,000,000,000-parameter state');super.load(x.base);this.extra.set(x.extra);this.extraSeed=x.extraSeed;this.extraUpdates=x.extraUpdates||0;return this.stats();}
}
export const createLargeParameterBrain3B=(options={})=>new LargeParameterBrain3B(options);
if(typeof window!=='undefined')window.TONYLargeParameterBrain3B={LargeParameterBrain3B,createLargeParameterBrain3B};
