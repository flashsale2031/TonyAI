// TONY LargeLM Pure v73 800M adapter.
// Pure JavaScript primary generation; no pretrained neural backbone.
import {PureJavaScriptLargeLM600M as BaseLarge} from './large-language-model-pure-600m.js';
import {createLargeParameterBrain800M} from './large-parameter-brain-800m.js';
import {LARGE_JAVASCRIPT_KNOWLEDGE_V42_TEXT,javascriptKnowledgeV42Stats} from './large-javascript-knowledge-v42.js';
export class PureJavaScriptLargeLM800M extends BaseLarge{
 constructor(options={}){super(options);this.knowledgeText=`${this.knowledgeText}\n${LARGE_JAVASCRIPT_KNOWLEDGE_V42_TEXT}`;this.parameterBrain=createLargeParameterBrain800M({seed:0x544f4e59,corpus:this.knowledgeText});this.contextBudget=options.contextBudget||11000000;this.version='73.0';}
 stats(){return{...super.stats(),architecture:'large-pure-javascript-800.0m-parameter-js-knowledge-v73',version:this.version,javascriptKnowledgeV42:javascriptKnowledgeV42Stats(),numericalBrain:this.parameterBrain.stats(),primaryGeneration:'800.0m-local-parameter-brain-plus-javascript-experts',pretrainedAttached:false,pretrainedRequired:false,neuralBackbone:'none'};}
 async chat(input,options={}){const r=await super.chat(input,options);const b=this.parameterBrain.stats();return{...r,engine:'large-pure-js-v73.0',model:'TONY-LargeLM-Pure-v73.0',parameterCount:b.parameterCount,learnedNumericalParameters:b.parameterCount,pretrainedRequired:false,neuralBackbone:'none'};}
}
export const createPureJavaScriptLargeLanguageModel800M=(options={})=>new PureJavaScriptLargeLM800M(options);
if(typeof window!=='undefined')window.TONYPureJavaScriptLargeLM800M={PureJavaScriptLargeLM800M,createPureJavaScriptLargeLanguageModel800M};
