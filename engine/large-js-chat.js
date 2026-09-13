import { largeJavaScriptLM } from './large-js-lm.js';
import { localBrain } from './local-brain.js';
import { replicate } from './replicated-engine.js';
import { duckduckgoSearch } from './duckduckgo.js';
import { generateArtifacts } from './file-generator.js';
import { containsProtectedOperation } from './safetyboundaries.js';

const clean=s=>String(s??'').trim();
const wants=(s,re)=>re.test(s);

async function imageTool(prompt,options={}){
  const key=process.env.OPENAI_API_KEY;
  if(!key)return {ok:false,error:'Image generation requires OPENAI_API_KEY; the language backbone remains local JavaScript.'};
  const base=(process.env.OPENAI_BASE_URL||'https://api.openai.com/v1').replace(/\/$/,'');
  const payload={model:process.env.OPENAI_IMAGE_MODEL||'gpt-image-2',prompt:clean(prompt),size:options.size||'1024x1024',quality:options.quality||'auto',background:options.background||'auto',output_format:options.output_format||'png'};
  const r=await fetch(`${base}/images/generations`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${key}`},body:JSON.stringify(payload)});
  const d=await r.json();if(!r.ok)throw new Error(d?.error?.message||`Image generation failed (${r.status})`);
  const item=d?.data?.[0];if(!item?.b64_json)throw new Error('Image provider returned no image data');
  return {ok:true,image:`data:image/${payload.output_format};base64,${item.b64_json}`,model:payload.model,size:payload.size};
}

function sourcesText(results=[]){return results.map((r,i)=>`[${i+1}] ${r.title}\n${r.url}\n${r.snippet||''}`).join('\n\n');}

export async function largeJSChat({messages=[],attachments=[]}={},assistant=null){
  const history=Array.isArray(messages)?messages.slice(-40):[];
  const latest=clean([...history].reverse().find(m=>m?.role==='user')?.content);
  if(!latest)throw new Error('Message is required');
  largeJavaScriptLM.context.push(...latest.split(/\s+/));largeJavaScriptLM.context=largeJavaScriptLM.context.slice(-largeJavaScriptLM.maxContext);

  const protectedRequest=containsProtectedOperation(latest);
  const toolResults=[];let reply=null;let confidence=.45;let sources=[];let artifacts=null;
  if(protectedRequest){return {reply:'I can explain or validate a protected operation, but I will not execute or expose passwords, authentication factors, payment/banking credentials, or private secrets.',confidence:.98,source:'large-js-safety',requiresHuman:true,largeJavaScriptLM:true,parameterCapacity:450_000_000_000};}

  const deterministic=replicate({message:latest},{allowModel:false});
  if(!deterministic.requiresModel){reply=deterministic.reply;confidence=deterministic.confidence;toolResults.push({tool:'replicated-engine',operation:deterministic.operation});}
  if(!reply){const local=localBrain.answer(latest);if(local.source!=='local'&&local.confidence>.7){reply=local.reply;confidence=local.confidence;toolResults.push({tool:'local-brain',operation:local.source});}}

  const url=latest.match(/https?:\/\/[^\s)]+/i)?.[0]?.replace(/[.,;]+$/,'');
  if(assistant&&url&&wants(latest,/\b(inspect|browser|website|page|navigate|recover)\b/i)){
    try{const inspection=await assistant.inspect(url);toolResults.push({tool:'browser-inspection',result:inspection});reply=reply||`Inspected ${url} locally and collected the page model.`;confidence=Math.max(confidence,.82);}catch(e){toolResults.push({tool:'browser-inspection',error:String(e.message||e)});}
  }
  if(assistant&&url&&wants(latest,/\bqueue|schedule|run later|worker\b/i)){
    try{const queued=await assistant.enqueue({url,title:latest,command:latest});toolResults.push({tool:'queue',result:queued});reply=reply||`Queued the requested task for ${url}.`;confidence=Math.max(confidence,.86);}catch(e){toolResults.push({tool:'queue',error:String(e.message||e)});}
  }
  if(assistant&&wants(latest,/\bvalidate\b/i)){
    toolResults.push({tool:'validation',result:'Use /api/validate with the field schema and value for deterministic validation.'});
  }
  if(assistant&&wants(latest,/\bconsensus|agree|majority\b/i)){
    toolResults.push({tool:'consensus',result:'Use /api/consensus with candidate values for deterministic agreement scoring.'});
  }
  if(wants(latest,/\b(search|look up|latest|today|current|news|research|online|internet|sources?)\b/i)){
    try{const web=await duckduckgoSearch(latest,{maxResults:12});sources=web.results;toolResults.push({tool:'DuckDuckGo',count:sources.length});if(sources.length){const evidence=sourcesText(sources);largeJavaScriptLM.addKnowledge([{id:`web-${Date.now()}`,text:evidence,source:'DuckDuckGo Search'}]);largeJavaScriptLM.learn(evidence,{passes:1,rate:.003});reply=reply?`${reply}\n\nCurrent web evidence:\n${evidence}`:`Current web evidence:\n${evidence}`;confidence=Math.max(confidence,.7);}}
    catch(e){toolResults.push({tool:'DuckDuckGo',error:String(e.message||e)});}
  }
  if(wants(latest,/\b(generate|create|make|draw|edit)\b.*\b(image|picture|logo|icon|illustration)\b/i)){
    try{const image=await imageTool(latest);toolResults.push({tool:'image-generation',ok:image.ok,error:image.error});if(image.ok){artifacts={images:[image]};reply=reply||'The requested image was generated by the configured external image tool; the text response remains generated by TONY’s JavaScript backbone.';confidence=Math.max(confidence,.8);}}
    catch(e){toolResults.push({tool:'image-generation',error:String(e.message||e)});}
  }
  if(!reply){
    const generated=largeJavaScriptLM.generate(latest,{maxTokens:256,temperature:.58});
    reply=generated&&generated!==latest?generated:'I can solve this with TONY’s local JavaScript tools. Add local knowledge or enable the relevant external tool for live evidence.';
    confidence=Math.max(confidence,.35);
  }
  const files=Array.isArray(attachments)&&attachments.length?[]:[];
  return {reply,confidence,requiresHuman:false,source:'large-js-primary',largeJavaScriptLM:true,primaryGenerationBackbone:'pure-javascript-sparse-neural-symbolic',pretrainedModel:false,externalNeuralModel:false,parameterCapacity:450_000_000_000,toolResults,sources,artifacts,attachmentCount:files.length,stats:largeJavaScriptLM.stats()};
}
