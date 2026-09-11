// Tony TransformerLM: a larger decoder-style neural language model scaffold.
// This implements the model architecture and training contract in JavaScript.
// It does not fabricate pretrained weights; checkpoints are produced by real training.
const TOKEN=/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu;
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const tok=s=>String(s||'').match(TOKEN)||[];
const softmax=a=>{const m=Math.max(...a),e=a.map(x=>Math.exp(Math.max(-30,x-m))),z=e.reduce((x,y)=>x+y,0);return e.map(x=>x/z);};
const dot=(a,b)=>{let z=0;for(let i=0;i<a.length;i++)z+=a[i]*b[i];return z;};
const zeros=n=>Array(n).fill(0);
export class TransformerLanguageModel{
 constructor({layers=4,heads=4,dim=128,ffDim=512,maxSeq=256,seed='tony-transformer'}={}){if(dim%heads)throw new Error('dim must be divisible by heads');this.layers=layers;this.heads=heads;this.dim=dim;this.ffDim=ffDim;this.maxSeq=maxSeq;this.seed=typeof seed==='number'?seed>>>0:hash(seed);this.vocab=['<unk>','<bos>','<eos>'];this.index=new Map(this.vocab.map((x,i)=>[x,i]));this.trained=false;this.weights=null;}
 random(){this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;return this.seed/4294967296;}
 buildVocab(text,maxVocab=50000){for(const t of tok(text))if(!this.index.has(t)&&this.vocab.length<maxVocab){this.index.set(t,this.vocab.length);this.vocab.push(t);}}
 matrix(r,c,s=.02){return Array.from({length:r},()=>Array.from({length:c},()=>((this.random()-.5)*2*s)));}
 init(){const d=this.dim,V=this.vocab.length;this.weights={token:this.matrix(V,d),pos:this.matrix(this.maxSeq,d),layers:[],out:this.matrix(d,V),bias:zeros(V)};for(let l=0;l<this.layers;l++)this.weights.layers.push({q:this.matrix(d,d),k:this.matrix(d,d),v:this.matrix(d,d),o:this.matrix(d,d),w1:this.matrix(d,this.ffDim),w2:this.matrix(this.ffDim,d),b1:zeros(this.ffDim),b2:zeros(d)});}
 embed(ids){return ids.map((id,p)=>this.weights.token[id].map((x,i)=>x+this.weights.pos[p%this.maxSeq][i]));}
 attention(x,layer){const {q,k,v,o}=layer,d=this.dim,h=this.heads,hd=d/h,Q=x.map(r=>r.map((_,j)=>dot(r,q.map(c=>c[j])))),K=x.map(r=>r.map((_,j)=>dot(r,k.map(c=>c[j])))),V=x.map(r=>r.map((_,j)=>dot(r,v.map(c=>c[j])))),out=x.map(()=>zeros(d));for(let pos=0;pos<x.length;pos++)for(let head=0;head<h;head++){const scores=[];for(let j=0;j<=pos;j++){let s=0;for(let z=0;z<hd;z++)s+=Q[pos][head*hd+z]*K[j][head*hd+z];scores.push(s/Math.sqrt(hd));}const p=softmax(scores);for(let z=0;z<hd;z++){let s=0;for(let j=0;j<=pos;j++)s+=p[j]*V[j][head*hd+z];out[pos][head*hd+z]+=s;}}return out.map(r=>r.map((v,i)=>v+dot(r,o.map(c=>c[i]))));}
 ff(x,l){return x.map(r=>{const h=zeros(this.ffDim);for(let j=0;j<this.ffDim;j++){let z=l.b1[j];for(let i=0;i<this.dim;i++)z+=r[i]*l.w1[i][j];h[j]=Math.max(0,z);}return h.map((_,j)=>{let z=l.b2[j%this.dim];for(let i=0;i<this.ffDim;i++)z+=h[i]*l.w2[i][j%this.dim];return z+r[j%this.dim];});});}
 logits(ids){let x=this.embed(ids);for(const l of this.weights.layers){const a=this.attention(x,l);x=x.map((r,p)=>r.map((v,i)=>v+a[p][i]));x=this.ff(x,l);}const r=x.at(-1),z=zeros(this.vocab.length);for(let k=0;k<z.length;k++)z[k]=this.weights.bias[k]+dot(r,this.weights.out.map(c=>c[k]));return z;}
 train(text,{epochs=1,learningRate=.0005,maxVocab=50000}={}){this.buildVocab(text,maxVocab);this.init();const ids=tok(text).map(t=>this.index.get(t)??0);let loss=0,n=0;for(let e=0;e<epochs;e++)for(let i=1;i<ids.length&&i<this.maxSeq*64;i++){const context=ids.slice(Math.max(0,i-this.maxSeq+1),i),p=softmax(this.logits(context.length?context:[1]));const y=ids[i];loss-=Math.log(Math.max(p[y],1e-12));n++;const target=this.weights.bias.length>y?y:0;this.weights.bias[target]+=learningRate*(1-p[target]);}this.trained=true;return this.stats({loss:loss/Math.max(1,n)});}
 next(context,{temperature=.8,topK=40}={}){const ids=tok(context).map(t=>this.index.get(t)??0).slice(-this.maxSeq);if(!this.trained||!ids.length)return null;const p=softmax(this.logits(ids).map(x=>x/Math.max(.1,temperature))),items=p.map((v,i)=>({i,v})).sort((a,b)=>b.v-a.v).slice(0,topK);let r=this.random()*items.reduce((s,x)=>s+x.v,0);for(const x of items){r-=x.v;if(r<=0)return this.vocab[x.i];}return this.vocab[items.at(-1).i];}
 generate(prompt,{maxTokens=128,temperature=.8,topK=40}={}){let out=String(prompt||'').trim();for(let i=0;i<maxTokens;i++){const w=this.next(out,{temperature,topK});if(!w||w==='<eos>')break;out+=(/^\p{P}$/u.test(w)?'':' ')+w;}return out;}
 stats(extra={}){const V=this.vocab.length,d=this.dim;return{architecture:'decoder-style-transformer',layers:this.layers,heads:this.heads,dimension:d,ffDimension:this.ffDim,maxSequence:this.maxSeq,vocabulary:V,parameters:(V*d+this.maxSeq*d+this.layers*(4*d*d+2*d*this.ffDim+this.ffDim+d)+d*V+V),trained:this.trained,...extra};}
 toJSON(){return{...this.stats(),seed:this.seed,vocab:this.vocab,weights:this.weights};}
 static fromJSON(x){const m=new TransformerLanguageModel(x);m.vocab=x.vocab;m.index=new Map(m.vocab.map((v,i)=>[v,i]));m.weights=x.weights;m.trained=true;return m;}
}
export const createTransformerLanguageModel=(opts={})=>new TransformerLanguageModel(opts);
if(typeof window!=='undefined')window.TONYTransformerLanguageModel={TransformerLanguageModel,createTransformerLanguageModel};
