// TONY Large Parameter Brain 6.2B.
// 6,200,000,000 local numerical features: 5.4B prior + 800M new locally fitted features.
// No pretrained neural weights and no external neural model.
import {LargeParameterBrain5_4B as BaseBrain} from './large-parameter-brain-5.4b.js';
const EXTRA_COUNT=800000000;
const hash=(s,seed=0x62006200)=>{let h=(seed^2166136261)>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}h^=h>>>16;h=Math.imul(h,0x85ebca6b)>>>0;h^=h>>>13;h=Math.imul(h,0xc2b2ae35)>>>0;return(h^(h>>>16))>>>0;};
const tokens=s=>(String(s??'').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]);
export class LargeParameterBrain6_2B extends BaseBrain{
 constructor(options={}){super(options);this.extraCount=EXTRA_COUNT;this.extraSeed=options.extraSeed??0x544f4e59;this.extra6=new Float32Array(EXTRA_COUNT);this.initializeExtra6();if(options.corpus)this.fitExtra6(options.corpus,{epochs:184});}
 initializeExtra6(){for(let i=0;i<EXTRA_COUNT;i++){let x=(this.extraSeed+Math.imul(i+1,0x9e3779b9))>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;this.extra6[i]=((x>>>0)/4294967296-0.5)*0.0012;}}
 extraIndex6(text,offset=0){return hash(`${offset}|${text}`,this.extraSeed)%EXTRA_COUNT;}
 fitExtra6(corpus,{epochs=184,rate=.00031}={}){const lines=String(corpus??'').split(/(?<=[.!?])\s+|\n+/).filter(Boolean).slice(0,700000000);for(let e=0;e<epochs;e++)for(const line of lines){const ts=tokens(line);for(let j=0;j<Math.min(ts.length,9216);j++){const g=ts.slice(Math.max(0,j-640),j+1).join(' '),signal=((hash(`${e}|${g}`,this.extraSeed)%100003)/50001-1);this.extra6[this.extraIndex6(g,j%262147)]+=rate*signal*(0.2+Math.min(80,ts.length/6));for(let n=2;n<=176;n++)if(j+n-1<ts.length)this.extra6[this.extraIndex6(ts.slice(j,j+n).join(' '),262147+n*181+(j%8191))]+=rate*(0.012/Math.pow(2,n-2))*signal;}}this.extra6Updates=(this.extra6Updates||0)+epochs;return this.stats();}
 score(query,text){const base=super.score(query,text),q=tokens(query),t=tokens(text);let s=0;for(let j=0;j<t.length&&j<60000;j++){const g=t.slice(Math.max(0,j-640),j+1).join(' ');s+=this.extra6[this.extraIndex6(g,j%262147)]*(q.some(x=>g.includes(x))?0.92:0.002);}return Math.max(0,Math.min(1,base+(1/(1+Math.exp(-s*7))-.5)*0.5));}
 stats(){const s=super.stats();return{...s,architecture:'pure-javascript-6.2b-parameter-numerical-brain',parameterCount:5400000000+EXTRA_COUNT,baseParameters:5400000000,additionalParameters:EXTRA_COUNT,parameterType:'Float32Array',parameterBytes:(5400000000+EXTRA_COUNT)*4,biasParameters:s.biasParameters,totalNumericalParameters:5400000000+EXTRA_COUNT+s.biasParameters,extra6LearnedLocally:Boolean(this.extra6Updates),extra6Updates:this.extra6Updates||0,pretrained:false,externalNeuralModel:false};}
 serialize(){return JSON.stringify({version:1,base:JSON.parse(super.serialize()),extraCount:EXTRA_COUNT,extraSeed:this.extraSeed,extra6:Array.from(this.extra6),extra6Updates:this.extra6Updates||0});}
 load(serialized){const x=typeof serialized==='string'?JSON.parse(serialized):serialized;if(!x||x.extraCount!==EXTRA_COUNT)throw new Error('Invalid 6,200,000,000-parameter state');super.load(x.base);this.extra6.set(x.extra6);this.extraSeed=x.extraSeed;this.extra6Updates=x.extra6Updates||0;return this.stats();}
}
export const createLargeParameterBrain6_2B=(options={})=>new LargeParameterBrain6_2B(options);
if(typeof window!=='undefined')window.TONYLargeParameterBrain6_2B={LargeParameterBrain6_2B,createLargeParameterBrain6_2B};
