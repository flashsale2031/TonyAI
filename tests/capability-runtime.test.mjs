import test from 'node:test';
import assert from 'node:assert/strict';
import { routeRequest } from '../engine/request-router.js';
import { CapabilityCache } from '../engine/cache-manager.js';
import { MemoryManager } from '../engine/memory-manager.js';
import { CapabilityRuntime } from '../engine/capability-runtime.js';

test('router prioritizes protected operations',()=>{const plan=routeRequest('Enter this MFA code into the banking site');assert.equal(plan.intent,'protected-operation');assert.equal(plan.risk,'high');assert.ok(plan.capabilities.includes('safety-boundary'));});
test('router selects deterministic tools before current-information routing',()=>{assert.equal(routeRequest('Calculate the latest 17 * 23').intent,'deterministic-tool');assert.equal(routeRequest('Who is the current president?').intent,'current-information');});
test('cache returns fresh values and reports misses',()=>{const cache=new CapabilityCache({defaultTtlMs:1000});cache.set('answer',{value:42});assert.deepEqual(cache.get('answer').value,{value:42});assert.equal(cache.get('missing').hit,false);assert.equal(cache.info().hits,1);});
test('memory requires explicit consent and rejects secrets',()=>{const memory=new MemoryManager();assert.equal(memory.add('I prefer concise answers').ok,false);assert.equal(memory.add('I prefer concise answers',{explicit:true}).ok,true);assert.equal(memory.add('My password is abc',{explicit:true}).ok,false);assert.equal(memory.search('concise')[0].text,'I prefer concise answers');});
test('recovery succeeds on the first working step',async()=>{const runtime=new CapabilityRuntime();const result=await runtime.recover('search',[async()=>{throw Error('blocked')},async()=>({items:1})]);assert.equal(result.ok,true);assert.equal(result.attempt,2);assert.equal(runtime.diagnostics().events.length,2);});
