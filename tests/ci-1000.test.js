import test from 'node:test';
import assert from 'node:assert/strict';
import { tonyAIProvider } from '../engine/tonyai-provider.js';

const cases = [];
const add = (name, fn) => cases.push([name, fn]);

for (let i = 1; i <= 300; i++) {
  const a = i + 2;
  const b = (i % 17) + 3;
  const c = i % 11;
  add(`arithmetic-${i}`, () => {
    const expected = a * b + c;
    const result = tonyAIProvider.chat({ messages: [{ role: 'user', content: `What is (${a} * ${b}) + ${c}?` }] });
    assert.equal(result.choices[0].message.content, String(expected));
  });
}

for (let i = 1; i <= 200; i++) {
  const values = [i, i + 2, i + 4, i + 6];
  const expected = String(i + 3);
  add(`statistics-mean-${i}`, () => {
    const result = tonyAIProvider.chat({ messages: [{ role: 'user', content: `What is the mean of ${values.join(', ')}?` }] });
    assert.equal(result.choices[0].message.content, expected);
  });
}

for (let i = 1; i <= 100; i++) {
  const text = `TonyAI test phrase ${i} with deterministic output`;
  add(`word-count-${i}`, () => {
    const result = tonyAIProvider.chat({ messages: [{ role: 'user', content: `word count: ${text}` }] });
    const parsed = JSON.parse(result.choices[0].message.content);
    assert.equal(parsed.words, text.split(/\s+/).length);
    assert.equal(parsed.characters, text.length);
  });
}

for (let i = 1; i <= 100; i++) {
  const text = `reverse-case-${i}`;
  add(`reverse-${i}`, () => {
    const result = tonyAIProvider.chat({ messages: [{ role: 'user', content: `reverse: ${text}` }] });
    assert.equal(result.choices[0].message.content, [...text].reverse().join(''));
  });
}

for (let i = 1; i <= 100; i++) {
  const text = `TonyAI Native Case ${i}`;
  add(`slug-${i}`, () => {
    const result = tonyAIProvider.chat({ messages: [{ role: 'user', content: `slug: ${text}` }] });
    assert.equal(result.choices[0].message.content, `tonyai-native-case-${i}`);
  });
}

for (let i = 1; i <= 100; i++) {
  const text = `TonyAI preserves deterministic behavior in test ${i}. Native tools execute locally. Results remain reproducible.`;
  add(`summary-${i}`, () => {
    const result = tonyAIProvider.chat({ messages: [{ role: 'user', content: `Summarize: ${text}` }] });
    const output = result.choices[0].message.content;
    assert.ok(output.length > 10);
    assert.doesNotMatch(output, /needs a language model|external model/i);
  });
}

for (let i = 1; i <= 50; i++) {
  const text = `embedding-stability-${i}`;
  add(`embedding-${i}`, () => {
    const first = tonyAIProvider.embeddings({ input: text });
    const second = tonyAIProvider.embeddings({ input: text });
    assert.equal(first.data[0].embedding.length, 128);
    assert.deepEqual(first.data[0].embedding, second.data[0].embedding);
    assert.equal(first.model, 'tonyai-native-embedding-v3');
  });
}

for (let i = 1; i <= 50; i++) {
  const prompt = `deterministic native scene ${i} with a futuristic city at night, lake and mountains`;
  add(`image-${i}`, () => {
    const first = tonyAIProvider.generateImage({ prompt, size: '512x512', variant: i % 5 });
    const second = tonyAIProvider.generateImage({ prompt, size: '512x512', variant: i % 5 });
    assert.equal(first.ok, true);
    assert.equal(first.size, '512x512');
    assert.match(first.image, /^data:image\/svg\+xml;base64,/);
    assert.equal(first.image, second.image);
  });
}

assert.equal(cases.length, 1000);
for (const [name, fn] of cases) test(name, fn);
