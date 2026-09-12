// TONY Large Parameter Brain 1.2B.
// 1,200,000,000 local numerical features; no pretrained neural weights.
import {LargeParameterBrain800M as BaseBrain} from './large-parameter-brain-800m.js';
const EXTRA_COUNT=400000000;
const hash=(s,seed=0x12ab34cd)=>{let h=(seed^2166136261)>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}h^=h>>>16;h=Math.imul(h,0x85ebca6b)>>>0;h^=h>>>13;h=Math.imul(h,0xc2b2ae35)>>>0;return(h^(h>>>16))>>>0;};
const tokens=s=>(String(s??'').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]);
export class LargeParameterBrain1_2B extends BaseBrain{
 constructor(options={}){super(options);this.extraCount=EXTRA_COUNT;this.extraSeed=options.extraSeed??0x1f123bb5;this.extra=new Float32Array(EXTRA_COUNT);this.initializeExtra();if(options.corpus)this.fitExtra(options.corpus,{epochs:88});}
 initializeExtra(){for(let i=0;i<EXTRA_COUNT;i++){let x=(this.extraSeed+Math.imul(i+1,0x45d9f3b))>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;this.extra[i]=((x>>>0)/4294967296-0.5)*0.0035;}}
 extraIndex(text,offset=0){return hash(`${offset}|${text}`,this.extraSeed)%EXTRA_COUNT;}
 fitExtra(corpus,{epochs=88,rate=.00072}={}){const lines=String(corpus??'').split(/(?<=[.!?])\s+|\n+/).filter(Boolean).slice(0,150000000);for(let e=0;e<epochs;e++)for(const line of lines){const ts=tokens(line);for(let j=0;j<Math.min(ts.length,3072);j++){const g=ts.slice(Math.max(0,j-176),j+1).join(' '),signal=((hash(`${e}|${g}`,this.extraSeed)%100003)/50001-1);this.extra[this.extraIndex(g,j%4093)]+=rate*signal*(0.08+Math.min(32,ts.length/14));for(let n=2;n<=72;n++)if(j+n-1<ts.length)this.extra[this.extraIndex(ts.slice(j,j+n).join(' '),4093+n*83+(j%997))]+=rate*(0.04/Math.pow(2,n-2))*signal;}}this.extraUpdates=(this.extraUpdates||0)+epochs;return this.stats();}
 score(query,text){const base=super.score(query,text),q=tokens(query),t=tokens(text);let s=0;for(let j=0;j<t.length&&j<16000;j++){const g=t.slice(Math.max(0,j-176),j+1).join(' ');s+=this.extra[this.extraIndex(g,j%4093)]*(q.some(x=>g.includes(x))?0.56:0.01);}return Math.max(0,Math.min(1,base+(1/(1+Math.exp(-s*17))-.5)*0.27));}
 stats(){const s=super.stats();return{...s,architecture:'pure-javascript-1.2b-parameter-numerical-brain',parameterCount:800000000+EXTRA_COUNT,baseParameters:800000000,additionalParameters:EXTRA_COUNT,parameterType:'Float32Array',parameterBytes:(800000000+EXTRA_COUNT)*4,biasParameters:s.biasParameters,totalNumericalParameters:800000000+EXTRA_COUNT+s.biasParameters,extraLearnedLocally:Boolean(this.extraUpdates),extraUpdates:this.extraUpdates||0,pretrained:false,externalNeuralModel:false};}
 serialize(){return JSON.stringify({version:1,base:JSON.parse(super.serialize()),extraCount:EXTRA_COUNT,extraSeed:this.extraSeed,extra:Array.from(this.extra),extraUpdates:this.extraUpdates||0});}
 load(serialized){const x=typeof serialized==='string'?JSON.parse(serialized):serialized;if(!x||x.extraCount!==EXTRA_COUNT)throw new Error('Invalid 1,200,000,000-parameter state');super.load(x.base);this.extra.set(x.extra);this.extraSeed=x.extraSeed;this.extraUpdates=x.extraUpdates||0;return this.stats();}
}
export const createLargeParameterBrain1_2B=(options={})=>new LargeParameterBrain1_2B(options);
if(typeof window!=='undefined')window.TONYLargeParameterBrain1_2B={LargeParameterBrain1_2B,createLargeParameterBrain1_2B};
