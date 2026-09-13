import test from 'node:test';
import assert from 'node:assert/strict';
import { tonyAIProvider } from '../engine/tonyai-provider.js';

test('native provider has no OpenAI dependency', () => {
  const caps=tonyAIProvider.capabilities();
  assert.equal(caps.name,'tonyai-native');
  assert.equal(caps.external,false);
  assert.equal(caps.openaiDependency,false);
  assert.equal(caps.chat,true);
  assert.equal(caps.imageGeneration,true);
  assert.equal(caps.embeddings,true);
});

test('native chat returns a completion without network access', () => {
  const result=tonyAIProvider.chat({messages:[{role:'user',content:'What is 2 + 2?'}]});
  assert.equal(result.object,'chat.completion');
  assert.equal(result.choices[0].message.role,'assistant');
  assert.ok(result.choices[0].message.content.length>0);
});

test('native image generation returns a deterministic local artifact', () => {
  const result=tonyAIProvider.generateImage({prompt:'A red apple on a white table',size:'1024x1024'});
  assert.equal(result.ok,true);
  assert.equal(result.model,'tonyai-local-image-v1');
  assert.equal(result.size,'1024x1024');
  assert.match(result.image,/^data:image\/svg\+xml;base64,/);
  assert.ok(result.image.length>100);
});

test('native embeddings return a fixed local vector', () => {
  const result=tonyAIProvider.embeddings({input:'TonyAI'});
  assert.equal(result.object,'list');
  assert.equal(result.data[0].embedding.length,64);
  assert.deepEqual(result.data[0].embedding,tonyAIProvider.embeddings({input:'TonyAI'}).data[0].embedding);
});
