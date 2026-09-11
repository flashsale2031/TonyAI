import { chromium } from 'playwright';
import { llmJSON } from './llm.js';
import { groundIntent } from './intelligence/intent-grounder.js';
import { planTask } from './planner.js';
import { verifyPlan, verifyOutcome } from './verifier.js';
import { inspectPage } from './browser/inspector.js';
import { visualFallback } from './browser/visual.js';
import { research } from './research/researcher.js';
import { duckduckgoSearch } from './duckduckgo.js';
import { policyCheck } from './policy/policy.js';
import { classifyQuestion } from './survey/question-classifier.js';
import { allowedAnswer } from './survey/profile-boundary.js';
import { consensus } from './validation/consensus.js';
import { validateField } from './validation/deterministic.js';
import { OutcomeMemory } from './learning/outcome-memory.js';
import { Queue } from './queue/queue.js';
import { Audit } from './storage/audit.js';
import { recover } from './recovery/state-machine.js';
import { localAssistant } from './local-assistant.js';

const cfg={dashboardUrl:process.env.DASHBOARD_URL||'',headless:process.env.HEADLESS!=='false',taskTimeout:Number(process.env.TASK_TIMEOUT_MS||45000),navigationTimeout:Number(process.env.NAVIGATION_TIMEOUT_MS||30000),confidenceThreshold:Number(process.env.CONFIDENCE_THRESHOLD||0.86),autoSubmit:process.env.AUTO_SUBMIT==='true',researchEnabled:process.env.RESEARCH_ENABLED!=='false',researchMaxSources:Number(process.env.RESEARCH_MAX_SOURCES||4),allowExternalNavigation:process.env.ALLOW_EXTERNAL_NAVIGATION==='true',domainAllowlist:(process.env.DOMAIN_ALLOWLIST||'').split(',').map(s=>s.trim()).filter(Boolean),duckduckgoEnabled:process.env.DUCKDUCKGO_ENABLED!=='false',duckduckgoMaxResults:Number(process.env.DUCKDUCKGO_MAX_RESULTS||8)};

export class UltimateAssistant{
 constructor(){this.cfg=cfg;this.queue=new Queue(process.env.QUEUE_FILE||'./data/assignments.json');this.audit=new Audit(process.env.AUDIT_FILE||'./data/audit.jsonl');this.memory=new OutcomeMemory(process.env.OUTCOME_FILE||'./data/outcomes.jsonl');this.browser=null;this.context=null;}
 async ensureBrowser(){if(this.browser)return;this.browser=await chromium.launch({headless:this.cfg.headless});this.context=await this.browser.newContext();}
 async close(){if(this.browser)await this.browser.close();this.browser=null;this.context=null;}
 async openAndInspect(url){await this.ensureBrowser();if(!this.cfg.allowExternalNavigation&&this.cfg.dashboardUrl&&!url.startsWith(this.cfg.dashboardUrl))throw new Error('Navigation blocked by domain policy');if(!this.cfg.allowExternalNavigation&&!this.cfg.dashboardUrl)throw new Error('Set DASHBOARD_URL or enable ALLOW_EXTERNAL_NAVIGATION');const p=await this.context.newPage();p.setDefaultTimeout(this.cfg.taskTimeout);p.setDefaultNavigationTimeout(this.cfg.navigationTimeout);try{await p.goto(url,{waitUntil:'domcontentloaded'});const model=await inspectPage(p);const visual=model.metrics.textLength<150||model.metrics.controls===0?await visualFallback(p,true):null;return {model,visualUsed:!!visual};}finally{await p.close();}}
 async onlineAnswer(query){if(!this.cfg.duckduckgoEnabled)throw new Error('DuckDuckGo online answers are disabled');return duckduckgoSearch(query,{maxResults:this.cfg.duckduckgoMaxResults});}
 async chat({messages,attachments=[]}){
  const history=Array.isArray(messages)?messages.slice(-40):[];const latest=[...history].reverse().find(m=>m?.role==='user')?.content||'';if(!latest.trim())throw new Error('Message is required');
  const intent=groundIntent({title:latest,description:latest},{text:history.map(m=>m.content||'').join('\n')});const questionType=classifyQuestion(latest);const boundary=allowedAnswer(latest,{},{});
  let plan=null,verification=null,researchResults=[],onlineSearch=null,inspection=null,queued=null;
  const urlMatch=latest.match(/https?:\/\/[^\s)]+/i);const targetUrl=urlMatch?.[0]?.replace(/[.,;]+$/,'');
  const taskLike=/\b(fill|enter|complete|submit|form|field|data entry|browser|website|page|click|select|type|navigate|inspect|execute)\b/i.test(latest);
  const wantsQueue=/\b(queue|schedule|run later|worker)\b/i.test(latest);
  const wantsOnline=/\b(search|look up|online|internet|web|latest|today|current|news|source|sources|research|find out|what is|who is|where is|when is|how much|how many|compare)\b/i.test(latest);
  if(process.env.OPENAI_API_KEY&&this.cfg.duckduckgoEnabled&&wantsOnline&&!taskLike){try{onlineSearch=await this.onlineAnswer(latest);researchResults=onlineSearch.results.map(r=>({title:r.title,url:r.url,snippet:r.snippet,source:'DuckDuckGo'}));}catch(e){onlineSearch={error:String(e.message||e)};}}
  if(process.env.OPENAI_API_KEY&&this.cfg.researchEnabled&&/\b(research|find|look up|latest|compare|sources?|what is|who is|how much)\b/i.test(latest)&&!taskLike&&!onlineSearch){try{await this.ensureBrowser();const p=await this.context.newPage();researchResults=await research(p,[latest],this.cfg.researchMaxSources);await p.close();}catch(e){researchResults=[{error:String(e.message||e)}];}}
  if(targetUrl&&(taskLike||wantsQueue))try{inspection=await this.openAndInspect(targetUrl);}catch(e){inspection={error:String(e.message||e)};}
  if(wantsQueue&&targetUrl)queued=await this.enqueue({url:targetUrl,title:latest,command:latest});
  if(taskLike){try{const pageModel=inspection?.model||{url:'tony-chat',title:'TONY',text:history.map(m=>m.content||'').join('\n'),controls:[],links:[],metrics:{controls:0,links:0,textLength:history.map(m=>m.content||'').join('\n').length}};plan=await planTask({objective:intent.objective,pageModel,research:researchResults});verification=await verifyPlan({objective:intent.objective,pageModel,research:researchResults,plan});}catch(e){verification={approved:false,requiresHuman:true,confidence:0,error:String(e.message||e)};}}
  const imageAttachments=(Array.isArray(attachments)?attachments:[]).filter(a=>/^image\//i.test(a?.type||'')&&typeof a?.dataUrl==='string').slice(0,4).map(a=>({name:a.name,type:a.type,dataUrl:a.dataUrl}));
  const safeAttachments=(Array.isArray(attachments)?attachments:[]).slice(0,12).map(a=>({name:a?.name||'attachment',type:a?.type||'application/octet-stream',size:Number(a?.size||0)}));
  let result;
  try{
   result=await llmJSON({system:`You are TONY, an ultimate AI workspace with an optional DuckDuckGo-powered online answer mode. When onlineSearch is supplied, use those current web search results as evidence, cite the source URLs in plain text, distinguish sourced facts from your own reasoning, and say when sources disagree or evidence is weak. Do not claim DuckDuckGo AI Mode itself was accessed; TONY uses DuckDuckGo Search as the web retrieval layer and its own language model for synthesis. Use supplied evidence and capabilities to answer accurately. You have conversational reasoning, research, browser inspection/action planning, deterministic validation, consensus checking, survey-question classification, sensitive-data boundaries, persistent outcome memory, queues, audit logging, recovery, visual fallback, and artifact generation. When the user asks you to create a downloadable file, return a files array with objects containing filename, content, and optional mime. When the user asks for multiple files or a ZIP, set zip:true and optionally provide zipName. Keep generated file content complete and usable. Images attached to this turn are direct visual evidence; analyze them when relevant, but do not infer identity or sensitive traits. Never claim a browser action, submission, research result, or external change happened unless the server actually performed it. Security credentials, MFA/CAPTCHA, passwords, banking/payment information and other sensitive boundaries require human handling. Planning/verification are evidence, not proof. If a tool is unavailable, say so plainly. Return a concise useful response.`,user:{payload:{messages:history,intent,questionType,boundary,onlineSearch,research:researchResults,inspection,planning:plan,verification,queued,attachments:safeAttachments},images:imageAttachments},schemaHint:'{reply:string,confidence:number,requiresHuman:boolean,suggestedActions?:string[],sources?:[{title:string,url:string,snippet?:string}],files?:[{filename:string,content:string,mime?:string}],zip?:boolean,zipName?:string}'});
  }catch(error){
   result={...localAssistant({messages:history}),apiUnavailable:true,apiError:String(error.message||error)};
  }
  await this.audit.event('chat_completed',{intent,questionType,confidence:result.confidence??null,inspected:!!inspection,queued:!!queued,onlineSearch:!!onlineSearch,images:imageAttachments.length,files:Array.isArray(result.files)?result.files.length:0,zip:result.zip===true});
  return {...result,intent,questionType,boundary,onlineSearch,research:researchResults,inspection,plan,verification,queued,attachmentCount:safeAttachments.length};
 }
 async inspect(url){return this.openAndInspect(url);}
 async enqueue(input){const a=await this.queue.enqueue(input);await this.audit.event('assignment_queued',{id:a.id,title:a.title,url:a.url});return a;}
 async queueStatus(){return {size:await this.queue.size(),assignments:await this.queue.list()};}
 async auditTail(){return this.audit.tail(100);}
 async memoryHints(domain=''){return this.memory.hints(domain);}
 capabilities(){return {chat:true,offlineFallback:true,research:this.cfg.researchEnabled,duckduckgoOnlineAnswers:this.cfg.duckduckgoEnabled,duckduckgoMaxResults:this.cfg.duckduckgoMaxResults,browserInspection:true,browserAutomation:true,visualFallback:true,planning:true,verification:true,policy:true,surveyClassifier:true,profileBoundary:true,consensus:true,deterministicValidation:true,outcomeMemory:true,queue:true,audit:true,recovery:true,attachments:true,multimodalImages:true,fileGeneration:true,zipGeneration:true,securityBoundaries:true,autoSubmit:this.cfg.autoSubmit};}
 validate(field,value){return validateField(field,value);}
 agree(candidates){return consensus(candidates);}
 async recover(url){await this.ensureBrowser();const p=await this.context.newPage();try{await p.goto(url,{waitUntil:'domcontentloaded'});return await recover({page:p,dashboardUrl:this.cfg.dashboardUrl,inspect:inspectPage});}finally{await p.close();}}
}
