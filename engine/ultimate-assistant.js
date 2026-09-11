import { chromium } from 'playwright';
import { llmJSON } from './ai/llm.js';
import { groundIntent } from './intelligence/intent-grounder.js';
import { planTask } from './ai/planner.js';
import { verifyPlan, verifyOutcome } from './ai/verifier.js';
import { inspectPage } from './browser/inspector.js';
import { visualFallback } from './browser/visual.js';
import { clickTextOrIndex, fillField } from './browser/actions.js';
import { research } from './research/researcher.js';
import { policyCheck } from './policy/policy.js';
import { classifyQuestion } from './survey/question-classifier.js';
import { allowedAnswer } from './survey/profile-boundary.js';
import { consensus } from './validation/consensus.js';
import { validateField } from './validation/deterministic.js';
import { OutcomeMemory } from './learning/outcome-memory.js';
import { Queue } from './queue/queue.js';
import { Audit } from './storage/audit.js';
import { recover } from './recovery/state-machine.js';

const cfg={
  dashboardUrl:process.env.DASHBOARD_URL||'',
  headless:process.env.HEADLESS!=='false',
  taskTimeout:Number(process.env.TASK_TIMEOUT_MS||45000),
  navigationTimeout:Number(process.env.NAVIGATION_TIMEOUT_MS||30000),
  confidenceThreshold:Number(process.env.CONFIDENCE_THRESHOLD||0.86),
  autoSubmit:process.env.AUTO_SUBMIT==='true',
  researchEnabled:process.env.RESEARCH_ENABLED!=='false',
  researchMaxSources:Number(process.env.RESEARCH_MAX_SOURCES||4),
  allowExternalNavigation:process.env.ALLOW_EXTERNAL_NAVIGATION==='true',
  domainAllowlist:(process.env.DOMAIN_ALLOWLIST||'').split(',').map(s=>s.trim()).filter(Boolean)
};

export class UltimateAssistant{
  constructor(){this.cfg=cfg;this.queue=new Queue(process.env.QUEUE_FILE||'./data/assignments.json');this.audit=new Audit(process.env.AUDIT_FILE||'./data/audit.jsonl');this.memory=new OutcomeMemory(process.env.OUTCOME_FILE||'./data/outcomes.jsonl');this.browser=null;this.context=null;}
  async ensureBrowser(){if(this.browser)return;this.browser=await chromium.launch({headless:this.cfg.headless});this.context=await this.browser.newContext();}
  async close(){if(this.browser)await this.browser.close();this.browser=null;this.context=null;}
  async chat({messages,attachments=[]}){
    const history=Array.isArray(messages)?messages.slice(-40):[];const latest=[...history].reverse().find(m=>m?.role==='user')?.content||'';if(!latest.trim())throw new Error('Message is required');
    const intent=groundIntent({title:latest,description:latest},{text:history.map(m=>m.content||'').join('\n')});
    const questionType=classifyQuestion(latest);const boundary=allowedAnswer(latest,{},{});
    let plan=null,verification=null,researchResults=[];
    const taskLike=/\b(fill|enter|complete|submit|form|field|data entry|browser|website|page|click|select|type|navigate|inspect)\b/i.test(latest);
    if(this.cfg.researchEnabled&&/\b(research|find|look up|latest|compare|sources?|what is|who is|how much)\b/i.test(latest)&&!taskLike){try{await this.ensureBrowser();const p=await this.context.newPage();researchResults=await research(p,[latest],this.cfg.researchMaxSources);await p.close();}catch(e){researchResults=[{error:String(e.message||e)}];}}
    if(taskLike){
      try{const pageModel={url:'tony-chat',title:'TONY',text:history.map(m=>m.content||'').join('\n'),controls:[],links:[],metrics:{controls:0,links:0,textLength:history.map(m=>m.content||'').join('\n').length}};plan=await planTask({objective:intent.objective,pageModel,research:researchResults});verification=await verifyPlan({objective:intent.objective,pageModel,research:researchResults,plan});}catch(e){verification={approved:false,requiresHuman:true,confidence:0,error:String(e.message||e)};}
    }
    const result=await llmJSON({system:`You are TONY, an ultimate AI workspace. Use the supplied evidence and capabilities to answer accurately. You have conversational reasoning, research, browser inspection/action planning, deterministic validation, consensus checking, survey-question classification, sensitive-data boundaries, persistent outcome memory, queues, audit logging, recovery, and visual fallback. Never claim a browser action, submission, research result, or external change happened unless the server actually performed it. Security credentials, MFA/CAPTCHA, passwords, banking/payment information and other sensitive boundaries require human handling. Planning/verification are evidence, not proof. If a tool is unavailable, say so plainly. Return a concise but useful response.`,user:JSON.stringify({messages:history,intent,questionType,boundary,research:researchResults,planning:plan,verification,attachments}),schemaHint:'{reply:string,confidence:number,requiresHuman:boolean,suggestedActions?:string[]}'});
    await this.audit.event('chat_completed',{intent,questionType,confidence:result.confidence??null});
    return {...result,intent,questionType,boundary,research:researchResults,plan,verification};
  }
  async inspect(url){await this.ensureBrowser();if(!this.cfg.allowExternalNavigation&&!this.cfg.dashboardUrl)throw new Error('Set DASHBOARD_URL or explicitly enable external navigation');if(!this.cfg.allowExternalNavigation&&this.cfg.dashboardUrl&&!url.startsWith(this.cfg.dashboardUrl))throw new Error('Navigation blocked by domain policy');const p=await this.context.newPage();p.setDefaultTimeout(this.cfg.taskTimeout);p.setDefaultNavigationTimeout(this.cfg.navigationTimeout);try{await p.goto(url,{waitUntil:'domcontentloaded'});const model=await inspectPage(p);const visual=model.metrics.textLength<150||model.metrics.controls===0?await visualFallback(p,true):null;return {model,visualUsed:!!visual};}finally{await p.close();}}
  async enqueue(input){const a=await this.queue.enqueue(input);await this.audit.event('assignment_queued',{id:a.id,title:a.title,url:a.url});return a;}
  async queueStatus(){return {size:await this.queue.size(),assignments:await this.queue.list()};}
  async auditTail(){return this.audit.tail(100);}
  async memoryHints(domain=''){return this.memory.hints(domain);}
  capabilities(){return {chat:true,research:this.cfg.researchEnabled,browserInspection:true,browserAutomation:true,visualFallback:true,planning:true,verification:true,policy:true,surveyClassifier:true,profileBoundary:true,consensus:true,deterministicValidation:true,outcomeMemory:true,queue:true,audit:true,recovery:true,attachments:true,securityBoundaries:true,autoSubmit:this.cfg.autoSubmit};}
  validate(field,value){return validateField(field,value);}
  agree(candidates){return consensus(candidates);}
  async recover(url){await this.ensureBrowser();const p=await this.context.newPage();try{await p.goto(url,{waitUntil:'domcontentloaded'});return await recover({page:p,dashboardUrl:this.cfg.dashboardUrl,inspect:inspectPage});}finally{await p.close();}}
}
