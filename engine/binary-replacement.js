// Binary-replacement runtime for TONY.
// Reconstructs the functional interfaces that a large model/runtime binary would
// normally expose, using small JavaScript capability modules and lazy chunk loading.
import { localTools } from './local-tools.js';
import { localLanguage } from './local-language.js';
import { localCode } from './local-code.js';
import { localData } from './local-data.js';
import { localIntents } from './local-intents.js';

const operations=Object.freeze({
  text:{keywords:(x,n)=>localLanguage.keywords(x,n),summarize:(x,n)=>localLanguage.summarize(x,n),classify:x=>localLanguage.classify(x),similarity:(a,b)=>localLanguage.similarity(a,b)},
  math:{calculate:x=>localTools.calculator(x)},
  code:{detectLanguage:(x,f)=>localCode.detectLanguage(x,f),stats:x=>localCode.stats(x),lint:(x,l)=>localCode.lint(x,l),functions:(x,l)=>localCode.extractFunctions(x,l),todos:x=>localCode.findTODOs(x),dependencies:x=>localCode.dependencies(x)},
  data:{statistics:x=>localData.statistics(x),filter:(x,p)=>localData.filter(x,p),select:(x,k)=>localData.select(x,k),join:(a,b,k,r)=>localData.join(a,b,k,r),pivot:(x,r,c,v)=>localData.pivot(x,r,c,v),frequency:x=>localData.frequency(x),correlation:(a,b)=>localData.correlation(a,b)},
  utility:{wordCount:x=>localTools.wordCount(x),reverse:x=>localTools.reverse(x),slug:x=>localTools.slug(x),json:x=>localTools.json(x),parseJSON:x=>localTools.parseJSON(x),chunk:(x,n)=>localTools.chunk(x,n),hash:x=>localTools.hash(x)}
});

export function binaryReplacement(input={}){
  const task=String(input.task||input.operation||'').toLowerCase();
  const intent=localIntents.detectIntent(String(input.message||input.text||''));
  if(task&&task.includes('.')){const [group,name]=task.split('.');if(operations[group]?.[name])return {ok:true,implementation:'javascript',task,intent,output:operations[group][name](...(Array.isArray(input.args)?input.args:[]))};}
  return {ok:true,implementation:'javascript',intent,capabilities:Object.keys(operations).reduce((o,k)=>(o[k]=Object.keys(operations[k]),o),{})};
}

export const binaryReplacementStatus=()=>({implementation:'javascript',binaryRequired:false,chunked:true,capabilities:Object.keys(operations)});
if(typeof window!=='undefined')window.TONYBinaryReplacement={binaryReplacement,binaryReplacementStatus};
