// TONY LargeLM Pure v72 700M adapter.
// Pure JavaScript primary generation; no pretrained neural backbone.
import {PureJavaScriptLargeLM600M as BaseLarge} from './large-language-model-pure-600m.js';
import {createLargeParameterBrain700M} from './large-parameter-brain-700m.js';
import {LARGE_JAVASCRIPT_KNOWLEDGE_V42_TEXT,javascriptKnowledgeV42Stats} from './large-javascript-knowledge-v42.js';
export class PureJavaScriptLargeLM700M extends BaseLarge{
 constructor(options={}){super(options);this.knowledgeText=`${this.knowledgeText}\n${LARGE_JAVASCRIPT_KNOWLEDGE_V42_TEXT}`;this.parameterBrain=createLargeParameterBrain700M({seed:0x544f4e59,corpus:this.knowledgeText});this.contextBudget=options.contextBudget||10000000;this.maxTokens=options.maxTokens||38000;this.version='72.0';}
 stats(){return{...super.stats(),architecture:'large-pure-javascript-700.0m-parameter-js-knowledge-v72',version:this.version,javascriptKnowledgeV42:javascriptKnowledgeV42Stats(),numericalBrain:this.parameterBrain.stats(),primaryGeneration:'700.0m-local-parameter-brain-plus-javascript-experts',pretrainedAttached:false,pretrainedRequired:false,neuralBackbone:'none'};}
 async chat(input,options={}){const r=await super.chat(input,options);const b=this.parameterBrain.stats();return{...r,engine:'large-pure-js-v72.0',model:'TONY-LargeLM-Pure-v72.0',parameterCount:b.parameterCount,learnedNumericalParameters:b.parameterCount,pretrainedRequired:false,neuralBackbone:'none'};}
}
export const createPureJavaScriptLargeLanguageModel700M=(options={})=>new PureJavaScriptLargeLM700M(options);
if(typeof window!=='undefined')window.TONYPureJavaScriptLargeLM700M={PureJavaScriptLargeLM700M,createPureJavaScriptLargeLanguageModel700M};
