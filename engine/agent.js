import { inspectPage } from './browser/inspector.js';
import { visualFallback } from './browser/visual.js';
import { planTask } from './ai/planner.js';
import { verifyPlan, verifyOutcome } from './ai/verifier.js';
import { research } from './research/researcher.js';
import { policyCheck } from './policy/policy.js';
import { fillField } from './browser/actions.js';

export class Agent {
  constructor({page,context,queue,audit,adapter,cfg}) { Object.assign(this,{page,context,queue,audit,adapter,cfg}); }
  async run(){
    await this.adapter.openDashboard(this.page); await this.audit.event('agent_started',{dashboard:this.cfg.dashboardUrl});
    while(true){ const a=await this.queue.claim(); if(a){await this.process(a);continue;} const found=await this.scanAndEnqueue(); if(!found) await new Promise(r=>setTimeout(r,this.cfg.pollInterval)); }
  }
  async scanAndEnqueue(){ await this.adapter.returnDashboard(this.page); const d=await this.adapter.discover(this.page); await this.audit.event('dashboard_scanned',{url:d.model.url,taskCandidates:d.tasks.length}); for(const t of d.tasks.slice(0,20)) await this.queue.enqueue({url:t.href,title:t.text,command:'Complete the task shown on this page'}); return d.tasks.length>0; }
  async process(a){
    try{
      await this.audit.event('assignment_started',{id:a.id,url:a.url}); const before=await this.adapter.openTask(this.page,a); const visualNeeded=before.metrics.textLength<150||before.metrics.controls===0; const visual=visualNeeded?await visualFallback(this.page,true):null;
      const objective=a.command||before.text.slice(0,3000); const rs=this.cfg.researchEnabled?await research(this.page,[objective],this.cfg.researchMaxSources):[]; const plan=await planTask({objective,pageModel:before,research:rs}); const verified=await verifyPlan({objective,pageModel:before,research:rs,plan});
      if(!verified.approved||verified.requiresHuman||(verified.confidence||0)<this.cfg.confidenceThreshold){await this.queue.fail(a.id,new Error('Plan did not pass independent verification'),false);return;}
      for(const c of verified.correctedFields||[]){const f=plan.fields?.find(x=>x.selector===c.selector);if(f)f.value=c.value;} for(const f of plan.fields||[]){await fillField(this.page,f);await this.audit.event('field_reinspected',{id:a.id,selector:f.selector,metrics:(await inspectPage(this.page)).metrics});}
      const afterFill=await inspectPage(this.page); const gate=policyCheck({plan,pageModel:afterFill,cfg:this.cfg}); if(!gate.allowed){await this.queue.fail(a.id,new Error(gate.reasons.join('; ')),false);return;}
      const submit=await this.findSubmit(afterFill); if(!submit)throw new Error('No unambiguous submit control found'); const loc=this.page.locator('input,textarea,select,button,[contenteditable="true"],[role="button"],[role="checkbox"],[role="radio"],[role="combobox"]').nth(submit.index); await loc.scrollIntoViewIfNeeded(); await loc.click(); await this.page.waitForLoadState('domcontentloaded').catch(()=>{});
      const after=await inspectPage(this.page); const outcome=await verifyOutcome({before:afterFill,after,plan}); await this.audit.event('outcome_verified',{id:a.id,outcome}); if(outcome.success)await this.queue.complete(a.id,{outcome,visualUsed:!!visual}); else await this.queue.fail(a.id,new Error(outcome.errors.join('; ')||'Outcome verification failed'),a.attempts<this.cfg.maxAttempts);
    }catch(e){await this.audit.event('assignment_error',{id:a.id,error:String(e.stack||e)});await this.queue.fail(a.id,e,a.attempts<this.cfg.maxAttempts);} finally{await this.adapter.returnDashboard(this.page).catch(()=>{});}
  }
  async findSubmit(m){const i=m.controls.find(c=>/submit|finish|complete|send|save|continue/i.test(`${c.text} ${c.attrs['aria-label']||''} ${c.attrs.name||''} ${c.attrs.id||''}`));return i?{index:i.i}:null;}
}
