import test from 'node:test';
import assert from 'node:assert/strict';
import { tonyAIProvider } from '../engine/tonyai-provider.js';

test('native provider has no external model dependency',()=>{
 const caps=tonyAIProvider.capabilities();
 assert.equal(caps.name,'tonyai-native');assert.equal(caps.external,false);assert.equal(caps.openaiDependency,false);
 assert.equal(caps.chat,true);assert.equal(caps.imageGeneration,true);assert.equal(caps.embeddings,true);assert.equal(caps.externalImageModel,false);assert.equal(caps.externalLanguageModel,false);
 assert.equal(caps.zeroRuntimeDependencies,true);assert.equal(caps.exactStatistics,true);assert.equal(caps.multiLayerImageCompositing,true);
});

test('native chat performs exact arithmetic locally',()=>{
 const result=tonyAIProvider.chat({messages:[{role:'user',content:'What is (17 * 23) + 4?'}]});
 assert.equal(result.object,'chat.completion');assert.equal(result.choices[0].message.role,'assistant');assert.match(result.choices[0].message.content,/395/);
});

test('native chat computes statistics locally',()=>{
 const mean=tonyAIProvider.chat({messages:[{role:'user',content:'What is the mean of 2, 4, 6, 8?'}]});
 const median=tonyAIProvider.chat({messages:[{role:'user',content:'What is the median of 1, 3, 7, 9, 12?'}]});
 assert.equal(mean.choices[0].message.content,'5');assert.equal(median.choices[0].message.content,'7');
});

test('native chat summarizes supplied text locally',()=>{
 const result=tonyAIProvider.chat({messages:[{role:'user',content:'Summarize: TONY validates inputs. TONY preserves provenance. TONY uses deterministic tools. TONY avoids external neural models.'}]});
 assert.ok(result.choices[0].message.content.length>20);assert.doesNotMatch(result.choices[0].message.content,/needs a language model|use an external model/i);
});

test('native image generation creates a richer deterministic multi-layer scene',()=>{
 const prompt='A futuristic cyberpunk city at night with mountains, a lake, a robot and a rocket';
 const result=tonyAIProvider.generateImage({prompt,size:'1024x1024'});
 assert.equal(result.ok,true);assert.equal(result.model,'tonyai-procedural-image-v3');assert.equal(result.renderer,'procedural-svg-compositor-v3');assert.equal(result.size,'1024x1024');
 assert.match(result.image,/^data:image\/svg\+xml;base64,/);assert.ok(result.image.length>4000);assert.ok(result.features.includes('multi-layer-depth'));assert.ok(result.features.includes('deterministic-variants'));
 const again=tonyAIProvider.generateImage({prompt,size:'1024x1024'});assert.equal(result.image,again.image);
 const variant=tonyAIProvider.generateImage({prompt,size:'1024x1024',variant:1});assert.notEqual(result.image,variant.image);
});

test('native image generation supports multiple scene families',()=>{
 for(const prompt of ['snowy mountain lake','enchanted forest with dragon','desert dunes','abstract neon geometric pattern','portrait of a person','coffee cafe']){
  const result=tonyAIProvider.generateImage({prompt,size:'768x768'});assert.equal(result.ok,true);assert.equal(result.size,'768x768');assert.match(result.image,/^data:image\/svg\+xml;base64,/);
 }
});

test('native embeddings return a deterministic 128-value vector',()=>{
 const result=tonyAIProvider.embeddings({input:'TonyAI'});assert.equal(result.object,'list');assert.equal(result.data[0].embedding.length,128);
 assert.deepEqual(result.data[0].embedding,tonyAIProvider.embeddings({input:'TonyAI'}).data[0].embedding);
});
