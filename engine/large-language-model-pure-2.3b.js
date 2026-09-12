// TONY LargeLM Pure v78 2.3B adapter.
// Pure JavaScript primary generation; no pretrained neural backbone.
import {PureJavaScriptLargeLM800M as BaseLarge} from './large-language-model-pure-800m.js';
import {createLargeParameterBrain2_3B} from './large-parameter-brain-2.3b.js';
import {LARGE_JAVASCRIPT_KNOWLEDGE_V47_TEXT,javascriptKnowledgeV47Stats} from './large-javascript-knowledge-v47.js';
export class PureJavaScriptLargeLM2_3B extends BaseLarge{
 constructor(options={}){super(options);this.knowledgeText=`${this.knowledgeText}\n${LARGE_JAVASCRIPT_KNOWLEDGE_V47_TEXT}`;this.parameterBrain=createLargeParameterBrain2_3B({seed:0x544f4e59,corpus:this.knowledgeText});this.contextBudget=options.contextBudget||22000000;this.version='78.0';}
 stats(){return{...super.stats(),architecture:'large-pure-javascript-2.3b-parameter-js-knowledge-v78',version:this.version,javascriptKnowledgeV47:javascriptKnowledgeV47Stats(),numericalBrain:this.parameterBrain.stats(),primaryGeneration:'2.3b-local-parameter-brain-plus-javascript-experts',pretrainedAttached:false,pretrainedRequired:false,neuralBackbone:'none'};}
 async chat(input,options={}){const r=await super.chat(input,options);const b=this.parameterBrain.stats();return{...r,engine:'large-pure-js-v78.0',model:'TONY-LargeLM-Pure-v78.0',parameterCount:b.parameterCount,learnedNumericalParameters:b.parameterCount,pretrainedRequired:false,neuralBackbone:'none'};}
}
export const createPureJavaScriptLargeLanguageModel2_3B=(options={})=>new PureJavaScriptLargeLM2_3B(options);
if(typeof window!=='undefined')window.TONYPureJavaScriptLargeLM2_3B={PureJavaScriptLargeLM2_3B,createPureJavaScriptLargeLanguageModel2_3B};
