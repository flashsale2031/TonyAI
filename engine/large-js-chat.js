import { largeJavaScriptLM } from './large-js-lm.js';
import { localBrain } from './local-brain.js';
import { replicate } from './replicated-engine.js';
import { duckduckgoSearch } from './duckduckgo.js';
import { containsProtectedOperation } from './safetyboundaries.js';

const clean=s=>String(s??'').trim();
const wants=(s,re)=>re.test(s);
async function imageTool(prompt,options={}){
 const key=process.env.OPENAI_API_KEY;if(!key)return{ok:false,error:'Image generation requires OPENAI_API_KEY; the language backbone remains local JavaScript.'};
 const base=(process.env.OPENAI_BASE_URL||'https://api.openai.com/v1').replace(/\/$/,'');
 const payload={model:process.env.OPENAI_IMAGE_MODEL||'gpt-image-2',prompt:clean(prompt),size:options.size||'1024x1024',quality:options.quality||'auto',background:options.background||'auto',output_format:options.output_format||'png'};
 const r=await fetch(`${base}/images/generations`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${key}`},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw new Error(d?.error?.message||`Image generation failed (${r.status})`);const item=d?.data?.[0];if(!item?.b64_json)throw new Error('Image provider returned no image data');return{ok:true,image:`data:image/${payload.output_format};base64,${item.b64_json}`,model:payload.model,size:payload.size};
}
function sourcesText(results=[]){return results.map((r,i)=>`[${i+1}] ${r.title}\n${r.url}\n${r.snippet||''}`).join('\n\n');}
function toolSummary(results=[]){return results.map(x=>({tool:x.tool,summary:x.summary||x.result?.reply||x.result?.message||x.result||x.error||'completed'}));}
function parseValidationRequest(text){
 const m=text.match(/(?:validate|check)\s+(?:field\s+)?([\w.-]+)\s*(?:=|:|with\s+value|value)\s*([\s\S]+)$/i);if(!m)return null;
 let value=m[2].trim();try{value=JSON.parse(value)}catch{}
 return{field:m[1],value};
}
function parseConsensusRequest(text){
 const m=text.match(/(?:consensus|majority|agree)[^:]*:\s*([\s\S]+)$/i);if(!m)return null;
 let candidates;try{candidates=JSON.parse(m[1])}catch{candidates=m[1].split(/\s*,\s*/).filter(Boolean)}
 return Array.isArray(candidates)?candidates:null;
}

export async function largeJSChat({messages=[],attachments=[]}={},assistant=null){
 const history=Array.isArray(messages)?messages.slice(-40):[];const latest=clean([...history].reverse().find(m=>m?.role==='user')?.content);if(!latest)throw new Error('Message is required');
 largeJavaScriptLM.context.push(...latest.split(/\s+/));largeJavaScriptLM.context=largeJavaScriptLM.context.slice(-largeJavaScriptLM.maxContext);
 if(containsProtectedOperation(latest))return{reply:'I can explain or validate a protected operation, but I will not execute or expose passwords, authentication factors, payment/banking credentials, or private secrets.',confidence:.98,source:'large-js-safety',requiresHuman:true,largeJavaScriptLM:true,parameterCapacity:450_000_000_000};
 const toolResults=[];let reply=null;let confidence=.45;let sources=[];let artifacts=null;
 try{const deterministic=replicate({message:latest},{allowModel:false});if(!deterministic.requiresModel){reply=deterministic.reply;confidence=deterministic.confidence;toolResults.push({tool:'replicated-engine',operation:deterministic.operation,summary:deterministic.reply});}}catch(e){toolResults.push({tool:'replicated-engine',error:String(e.message||e)});}
 if(!reply){try{const local=localBrain.answer(latest);if(local.source!=='local'&&local.confidence>.7){reply=local.reply;confidence=local.confidence;toolResults.push({tool:'local-brain',operation:local.source,summary:local.reply});}}catch(e){toolResults.push({tool:'local-brain',error:String(e.message||e)});}}
 const url=latest.match(/https?:\/\/[^\s)]+/i)?.[0]?.replace(/[.,;]+$/,'');
 if(assistant&&url&&wants(latest,/\b(inspect|browser|website|page|navigate|recover)\b/i)){try{const inspection=await assistant.inspect(url);toolResults.push({tool:'browser-inspection',result:inspection,summary:`Inspected ${url} and collected a page model.`});confidence=Math.max(confidence,.82);}catch(e){toolResults.push({tool:'browser-inspection',error:String(e.message||e)});}}
 if(assistant&&url&&wants(latest,/\bqueue|schedule|run later|worker\b/i)){try{const queued=await assistant.enqueue({url,title:latest,command:latest});toolResults.push({tool:'queue',result:queued,summary:`Queued the requested task for ${url}.`});confidence=Math.max(confidence,.86);}catch(e){toolResults.push({tool:'queue',error:String(e.message||e)});}}
 const validation=parseValidationRequest(latest);
 if(validation&&assistant){try{const result=assistant.validate(validation.field,validation.value);toolResults.push({tool:'validation',result,summary:`Validation result for ${validation.field}: ${JSON.stringify(result)}`});reply=`Validation result for ${validation.field}: ${JSON.stringify(result)}`;confidence=Math.max(confidence,.97);}catch(e){toolResults.push({tool:'validation',error:String(e.message||e)});}}
 const consensusCandidates=parseConsensusRequest(latest);
 if(consensusCandidates&&assistant){try{const result=assistant.agree(consensusCandidates);toolResults.push({tool:'consensus',result,summary:`Consensus result: ${JSON.stringify(result)}`});reply=`Consensus result: ${JSON.stringify(result)}`;confidence=Math.max(confidence,.97);}catch(e){toolResults.push({tool:'consensus',error:String(e.message||e)});}}
 if(wants(latest,/\b(search|look up|latest|today|current|news|research|online|internet|sources?)\b/i)){try{const web=await duckduckgoSearch(latest,{maxResults:12});sources=web.results||[];if(sources.length){const evidence=sourcesText(sources);largeJavaScriptLM.addKnowledge([{id:`web-${Date.now()}`,text:evidence,source:'DuckDuckGo Search'}]);largeJavaScriptLM.learn(evidence,{passes:1,rate:.003});toolResults.push({tool:'DuckDuckGo',count:sources.length,summary:`Retrieved ${sources.length} current web sources.`});confidence=Math.max(confidence,.7);}else toolResults.push({tool:'DuckDuckGo',count:0,summary:'No current web results were returned.'});}catch(e){toolResults.push({tool:'DuckDuckGo',error:String(e.message||e)});}}
 if(wants(latest,/\b(generate|create|make|draw|edit)\b.*\b(image|picture|logo|icon|illustration)\b/i)){try{const image=await imageTool(latest);toolResults.push({tool:'image-generation',ok:image.ok,error:image.error,summary:image.ok?'Image artifact generated by the optional external image tool.':image.error});if(image.ok){artifacts={images:[image]};confidence=Math.max(confidence,.8);}}catch(e){toolResults.push({tool:'image-generation',error:String(e.message||e)});}}
 const synthesized=largeJavaScriptLM.synthesize(latest,{retrieved:largeJavaScriptLM.retrieve(latest,6),toolResults:toolSummary(toolResults),sources});
 if(!reply&&synthesized)reply=synthesized;else if(!reply)reply=largeJavaScriptLM.generate(latest,{maxTokens:256,temperature:.38});
 return{reply,confidence,requiresHuman:false,source:'large-js-primary',largeJavaScriptLM:true,primaryGenerationBackbone:'pure-javascript-sparse-neural-symbolic',pretrainedModel:false,externalNeuralModel:false,externalGenerationAPI:false,parameterCapacity:450_000_000_000,toolResults,sources,artifacts,attachmentCount:Array.isArray(attachments)?attachments.length:0,stats:largeJavaScriptLM.stats()};
}
