import test from 'node:test';
import assert from 'node:assert/strict';
import { tonyAIProvider } from '../engine/tonyai-provider.js';

test('native provider has no OpenAI dependency',()=>{
 const caps=tonyAIProvider.capabilities();
 assert.equal(caps.name,'tonyai-native');assert.equal(caps.external,false);assert.equal(caps.openaiDependency,false);
 assert.equal(caps.chat,true);assert.equal(caps.imageGeneration,true);assert.equal(caps.embeddings,true);assert.equal(caps.externalImageModel,false);assert.equal(caps.externalLanguageModel,false);
});

test('native chat performs exact arithmetic locally',()=>{
 const result=tonyAIProvider.chat({messages:[{role:'user',content:'What is (17 * 23) + 4?'}]});
 assert.equal(result.object,'chat.completion');assert.equal(result.choices[0].message.role,'assistant');assert.match(result.choices[0].message.content,/395/);
});

test('native chat summarizes supplied text locally',()=>{
 const result=tonyAIProvider.chat({messages:[{role:'user',content:'Summarize: TONY validates inputs. TONY preserves provenance. TONY uses deterministic tools. TONY avoids external neural models.'}]});
 assert.ok(result.choices[0].message.content.length>20);assert.doesNotMatch(result.choices[0].message.content,/needs a language model|use an external model/i);
});

test('native image generation creates a richer deterministic scene',()=>{
 const result=tonyAIProvider.generateImage({prompt:'A futuristic city at night with mountains and a lake',size:'1024x1024'});
 assert.equal(result.ok,true);assert.equal(result.model,'tonyai-procedural-image-v2');assert.equal(result.renderer,'procedural-svg-scene-v2');assert.equal(result.size,'1024x1024');
 assert.match(result.image,/^data:image\/svg\+xml;base64,/);assert.ok(result.image.length>1000);
 const again=tonyAIProvider.generateImage({prompt:'A futuristic city at night with mountains and a lake',size:'1024x1024'});
 assert.equal(result.image,again.image);
});

test('native embeddings return a deterministic 128-value vector',()=>{
 const result=tonyAIProvider.embeddings({input:'TonyAI'});assert.equal(result.object,'list');assert.equal(result.data[0].embedding.length,128);
 assert.deepEqual(result.data[0].embedding,tonyAIProvider.embeddings({input:'TonyAI'}).data[0].embedding);
});
