import { CapabilityCache } from './cache-manager.js';
import { MemoryManager } from './memory-manager.js';
import { routeRequest } from './request-router.js';

export class CapabilityRuntime{
 constructor(){this.cache=new CapabilityCache();this.memory=new MemoryManager();this.events=[];this.maxEvents=500;}
 route(text){const plan=routeRequest(text);this.record('route',{intent:plan.intent,risk:plan.risk});return plan;}
 record(type,data={}){this.events.push({type,data:JSON.parse(JSON.stringify(data)),at:new Date().toISOString()});if(this.events.length>this.maxEvents)this.events.splice(0,this.events.length-this.maxEvents);}
 diagnostics(){return {events:this.events.slice(-100),cache:this.cache.info(),memoryCount:this.memory.list().length};}
 async recover(label,steps=[],{onError}={}){let last;for(let index=0;index<steps.length;index++){const step=steps[index];try{const value=await step();this.record('recovery-success',{label,attempt:index+1});return {ok:true,value,attempt:index+1};}catch(error){last=error;this.record('recovery-failure',{label,attempt:index+1,error:String(error?.message||error)});onError?.(error,index);}}return {ok:false,error:String(last?.message||last||`${label} failed`),attempt:steps.length};}
}
export const capabilityRuntime=new CapabilityRuntime();
