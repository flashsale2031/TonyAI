// TONY LargeLM Pure v71 600M adapter.
// Pure JavaScript primary generation; no pretrained neural backbone.
import {PureJavaScriptLargeLM400M as BaseLarge} from './large-language-model-pure-400m.js';
import {createLargeParameterBrain600M} from './large-parameter-brain-600m.js';
import {LARGE_JAVASCRIPT_KNOWLEDGE_V40_TEXT,javascriptKnowledgeV40Stats} from './large-javascript-knowledge-v40.js';
import {LARGE_JAVASCRIPT_KNOWLEDGE_V41_TEXT,javascriptKnowledgeV41Stats} from './large-javascript-knowledge-v41.js';
export class PureJavaScriptLargeLM600M extends BaseLarge{
 constructor(options={}){super(options);this.knowledgeText=`${this.knowledgeText}\n${LARGE_JAVASCRIPT_KNOWLEDGE_V40_TEXT}\n${LARGE_JAVASCRIPT_KNOWLEDGE_V41_TEXT}`;this.parameterBrain=createLargeParameterBrain600M({seed:0x544f4e59,corpus:this.knowledgeText});this.contextBudget=options.contextBudget||8200000;this.version='71.0';}
 stats(){return{...super.stats(),architecture:'large-pure-javascript-600.0m-parameter-js-knowledge-v71',version:this.version,javascriptKnowledgeV40:javascriptKnowledgeV40Stats(),javascriptKnowledgeV41:javascriptKnowledgeV41Stats(),numericalBrain:this.parameterBrain.stats(),primaryGeneration:'600.0m-local-parameter-brain-plus-javascript-experts',pretrainedAttached:false,pretrainedRequired:false,neuralBackbone:'none'};}
 async chat(input,options={}){const r=await super.chat(input,options);const b=this.parameterBrain.stats();return{...r,engine:'large-pure-js-v71.0',model:'TONY-LargeLM-Pure-v71.0',parameterCount:b.parameterCount,learnedNumericalParameters:b.parameterCount,pretrainedRequired:false,neuralBackbone:'none'};}
}
export const createPureJavaScriptLargeLanguageModel600M=(options={})=>new PureJavaScriptLargeLM600M(options);
if(typeof window!=='undefined')window.TONYPureJavaScriptLargeLM600M={PureJavaScriptLargeLM600M,createPureJavaScriptLargeLanguageModel600M};
