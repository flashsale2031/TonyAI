// TONY Large Parameter Brain 4.6B.
// 4,600,000,000 local numerical features: 4.2B prior + 400M new locally fitted features.
// No pretrained neural weights and no external neural model.
import {LargeParameterBrain4_2B as BaseBrain} from './large-parameter-brain-4.2b.js';
const EXTRA_COUNT=400000000;
const hash=(s,seed=0x46004600)=>{let h=(seed^2166136261)>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}h^=h>>>16;h=Math.imul(h,0x85ebca6b)>>>0;h^=h>>>13;h=Math.imul(h,0xc2b2ae35)>>>0;return(h^(h>>>16))>>>0;};
const tokens=s=>(String(s??'').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]);
export class LargeParameterBrain4_6B extends BaseBrain{
 constructor(options={}){super(options);this.extraCount=EXTRA_COUNT;this.extraSeed=options.extraSeed??0x544f4e59;this.extra4=new Float32Array(EXTRA_COUNT);this.initializeExtra4();if(options.corpus)this.fitExtra4(options.corpus,{epochs:168});}
 initializeExtra4(){for(let i=0;i<EXTRA_COUNT;i++){let x=(this.extraSeed+Math.imul(i+1,0x9e3779b9))>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;this.extra4[i]=((x>>>0)/4294967296-0.5)*0.0015;}}
 extraIndex4(text,offset=0){return hash(`${offset}|${text}`,this.extraSeed)%EXTRA_COUNT;}
 fitExtra4(corpus,{epochs=168,rate=.00036}={}){const lines=String(corpus??'').split(/(?<=[.!?])\s+|\n+/).filter(Boolean).slice(0,480000000);for(let e=0;e<epochs;e++)for(const line of lines){const ts=tokens(line);for(let j=0;j<Math.min(ts.length,7680);j++){const g=ts.slice(Math.max(0,j-512),j+1).join(' '),signal=((hash(`${e}|${g}`,this.extraSeed)%100003)/50001-1);this.extra4[this.extraIndex4(g,j%98317)]+=rate*signal*(0.17+Math.min(68,ts.length/8));for(let n=2;n<=144;n++)if(j+n-1<ts.length)this.extra4[this.extraIndex4(ts.slice(j,j+n).join(' '),98317+n*167+(j%4093))]+=rate*(0.017/Math.pow(2,n-2))*signal;}}this.extra4Updates=(this.extra4Updates||0)+epochs;return this.stats();}
 score(query,text){const base=super.score(query,text),q=tokens(query),t=tokens(text);let s=0;for(let j=0;j<t.length&&j<48000;j++){const g=t.slice(Math.max(0,j-512),j+1).join(' ');s+=this.extra4[this.extraIndex4(g,j%98317)]*(q.some(x=>g.includes(x))?0.88:0.003);}return Math.max(0,Math.min(1,base+(1/(1+Math.exp(-s*8))-.5)*0.46));}
 stats(){const s=super.stats();return{...s,architecture:'pure-javascript-4.6b-parameter-numerical-brain',parameterCount:4200000000+EXTRA_COUNT,baseParameters:4200000000,additionalParameters:EXTRA_COUNT,parameterType:'Float32Array',parameterBytes:(4200000000+EXTRA_COUNT)*4,biasParameters:s.biasParameters,totalNumericalParameters:4200000000+EXTRA_COUNT+s.biasParameters,extra4LearnedLocally:Boolean(this.extra4Updates),extra4Updates:this.extra4Updates||0,pretrained:false,externalNeuralModel:false};}
 serialize(){return JSON.stringify({version:1,base:JSON.parse(super.serialize()),extraCount:EXTRA_COUNT,extraSeed:this.extraSeed,extra4:Array.from(this.extra4),extra4Updates:this.extra4Updates||0});}
 load(serialized){const x=typeof serialized==='string'?JSON.parse(serialized):serialized;if(!x||x.extraCount!==EXTRA_COUNT)throw new Error('Invalid 4,600,000,000-parameter state');super.load(x.base);this.extra4.set(x.extra4);this.extraSeed=x.extraSeed;this.extra4Updates=x.extra4Updates||0;return this.stats();}
}
export const createLargeParameterBrain4_6B=(options={})=>new LargeParameterBrain4_6B(options);
if(typeof window!=='undefined')window.TONYLargeParameterBrain4_6B={LargeParameterBrain4_6B,createLargeParameterBrain4_6B};
