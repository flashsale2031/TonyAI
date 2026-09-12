// TONY LargeLM Pure v76 1.4B adapter.
// Pure JavaScript primary generation; no pretrained neural backbone.
import {PureJavaScriptLargeLM800M as BaseLarge} from './large-language-model-pure-800m.js';
import {createLargeParameterBrain1_4B} from './large-parameter-brain-1.4b.js';
import {LARGE_JAVASCRIPT_KNOWLEDGE_V44_TEXT,javascriptKnowledgeV44Stats} from './large-javascript-knowledge-v44.js';
import {LARGE_JAVASCRIPT_KNOWLEDGE_V45_TEXT,javascriptKnowledgeV45Stats} from './large-javascript-knowledge-v45.js';
export class PureJavaScriptLargeLM1_4B extends BaseLarge{
 constructor(options={}){super(options);this.knowledgeText=`${this.knowledgeText}\n${LARGE_JAVASCRIPT_KNOWLEDGE_V44_TEXT}\n${LARGE_JAVASCRIPT_KNOWLEDGE_V45_TEXT}`;this.parameterBrain=createLargeParameterBrain1_4B({seed:0x544f4e59,corpus:this.knowledgeText});this.contextBudget=options.contextBudget||17000000;this.version='76.0';}
 stats(){return{...super.stats(),architecture:'large-pure-javascript-1.4b-parameter-js-knowledge-v76',version:this.version,javascriptKnowledgeV44:javascriptKnowledgeV44Stats(),javascriptKnowledgeV45:javascriptKnowledgeV45Stats(),numericalBrain:this.parameterBrain.stats(),primaryGeneration:'1.4b-local-parameter-brain-plus-javascript-experts',pretrainedAttached:false,pretrainedRequired:false,neuralBackbone:'none'};}
 async chat(input,options={}){const r=await super.chat(input,options);const b=this.parameterBrain.stats();return{...r,engine:'large-pure-js-v76.0',model:'TONY-LargeLM-Pure-v76.0',parameterCount:b.parameterCount,learnedNumericalParameters:b.parameterCount,pretrainedRequired:false,neuralBackbone:'none'};}
}
export const createPureJavaScriptLargeLanguageModel1_4B=(options={})=>new PureJavaScriptLargeLM1_4B(options);
if(typeof window!=='undefined')window.TONYPureJavaScriptLargeLM1_4B={PureJavaScriptLargeLM1_4B,createPureJavaScriptLargeLanguageModel1_4B};
