// Local workflow engine for common assistant tasks.
import { localTools } from './local-tools.js';
import { localLanguage } from './local-language.js';
import { detectIntent } from './local-intents.js';
export class LocalWorkflowEngine{
 constructor(){this.handlers=new Map();}
 register(name,fn){this.handlers.set(name,fn);return this;}
 run(input){const text=String(input?.message??input??'').trim();const intent=detectIntent(text);if(intent.name==='calculator'){const expr=text.replace(/^.*?calculate\s*/i,'').replace(/^.*?compute\s*/i,'');try{return {intent,handled:true,reply:String(localTools.calculator(expr)),confidence:.99};}catch{}}
 if(intent.name==='summarize')return {intent,handled:true,reply:localLanguage.summarize(text.replace(/.*?summarize\s*/i,'')||text),confidence:.9};
 if(intent.name==='rewrite')return {intent,handled:true,reply:'Local rewrite mode is ready. Provide the text and desired tone; no model call is needed for the workflow itself.',confidence:.75};
 if(intent.name==='file')return {intent,handled:false,reason:'file generation can be handled by TONY file tools'};
 if(intent.name==='web')return {intent,handled:false,reason:'current information should use configured web retrieval'};
 const custom=this.handlers.get(intent.name);if(custom)return {intent,handled:true,reply:custom(text),confidence:.8};return {intent,handled:false,reason:'general language generation requires a model'};}
}
export const localWorkflows=new LocalWorkflowEngine();
if(typeof window!=='undefined')window.TONYLocalWorkflows=localWorkflows;
