import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { Queue } from '../engine/queue/queue.js';
test('persistent queue round trip', async()=>{
 const f='./data/test-queue.json'; await fs.rm(f,{force:true});
 const q=new Queue(f); const a=await q.enqueue({url:'https://example.test',command:'x'});
 const c=await q.claim(); assert.equal(c.id,a.id); assert.equal(c.status,'running');
 await q.complete(a.id,{ok:true}); const d=JSON.parse(await fs.readFile(f,'utf8')); assert.equal(d.assignments[0].status,'completed');
 await fs.rm(f,{force:true});
});
