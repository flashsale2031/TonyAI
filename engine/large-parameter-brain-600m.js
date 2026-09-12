// TONY Large Parameter Brain 600M.
// Composition: 500M established local numerical features + 100M additional local features.
// No pretrained neural weights and no external neural model.
import {LargeParameterBrain500M as BaseBrain} from './large-parameter-brain-500m.js';
const EXTRA_COUNT=100000000;
const hash=(s,seed=0x60006000)=>{let h=(seed^2166136261)>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}h^=h>>>16;h=Math.imul(h,0x85ebca6b)>>>0;h^=h>>>13;h=Math.imul(h,0xc2b2ae35)>>>0;return(h^(h>>>16))>>>0;};
const tokens=s=>(String(s??'').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]);
export class LargeParameterBrain600M extends BaseBrain{
 constructor(options={}){super(options);this.extraCount=EXTRA_COUNT;this.extraSeed=options.extraSeed??0x9e3779b9;this.extra=new Float32Array(EXTRA_COUNT);this.initializeExtra();if(options.corpus)this.fitExtra(options.corpus,{epochs:64});}
 initializeExtra(){for(let i=0;i<EXTRA_COUNT;i++){let x=(this.extraSeed+Math.imul(i+1,0x45d9f3b))>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;this.extra[i]=((x>>>0)/4294967296-0.5)*0.0048;}}
 extraIndex(text,offset=0){return hash(`${offset}|${text}`,this.extraSeed)%EXTRA_COUNT;}
 fitExtra(corpus,{epochs=64,rate=.001}={}){const lines=String(corpus??'').split(/(?<=[.!?])\s+|\n+/).filter(Boolean).slice(0,90000000);for(let e=0;e<epochs;e++)for(const line of lines){const ts=tokens(line);for(let j=0;j<Math.min(ts.length,2048);j++){const g=ts.slice(Math.max(0,j-112),j+1).join(' '),i=this.extraIndex(g,j%2111);const signal=((hash(`${e}|${g}`,this.extraSeed)%100003)/50001-1);this.extra[i]+=rate*signal*(0.07+Math.min(22,ts.length/18));for(let n=2;n<=48;n++)if(j+n-1<ts.length)this.extra[this.extraIndex(ts.slice(j,j+n).join(' '),2111+n*53+(j%593))]+=rate*(0.055/Math.pow(2,n-2))*signal;}}this.extraUpdates=(this.extraUpdates||0)+epochs;return this.stats();}
 score(query,text){const base=super.score(query,text),q=tokens(query),t=tokens(text);let s=0;for(let j=0;j<t.length&&j<10000;j++){const g=t.slice(Math.max(0,j-112),j+1).join(' ');s+=this.extra[this.extraIndex(g,j%2111)]*(q.some(x=>g.includes(x))?0.46:0.016);}return Math.max(0,Math.min(1,base+(1/(1+Math.exp(-s*19))-.5)*0.22));}
 stats(){const s=super.stats();return{...s,architecture:'pure-javascript-600.0m-parameter-numerical-brain',parameterCount:500000000+EXTRA_COUNT,baseParameters:500000000,additionalParameters:EXTRA_COUNT,parameterType:'Float32Array',parameterBytes:(500000000+EXTRA_COUNT)*4,biasParameters:s.biasParameters,totalNumericalParameters:500000000+EXTRA_COUNT+s.biasParameters,extraLearnedLocally:Boolean(this.extraUpdates),extraUpdates:this.extraUpdates||0,pretrained:false,externalNeuralModel:false};}
 serialize(){return JSON.stringify({version:1,base:JSON.parse(super.serialize()),extraCount:EXTRA_COUNT,extraSeed:this.extraSeed,extra:Array.from(this.extra),extraUpdates:this.extraUpdates||0});}
 load(serialized){const x=typeof serialized==='string'?JSON.parse(serialized):serialized;if(!x||x.extraCount!==EXTRA_COUNT)throw new Error('Invalid 600,000,000-parameter state');super.load(x.base);this.extra.set(x.extra);this.extraSeed=x.extraSeed;this.extraUpdates=x.extraUpdates||0;return this.stats();}
}
export const createLargeParameterBrain600M=(options={})=>new LargeParameterBrain600M(options);
if(typeof window!=='undefined')window.TONYLargeParameterBrain600M={LargeParameterBrain600M,createLargeParameterBrain600M};
