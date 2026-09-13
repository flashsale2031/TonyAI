import test from 'node:test';
import assert from 'node:assert/strict';
import { largeJSChat } from '../engine/large-js-chat.js';

const prompts = [
  'Generate an image of a red apple on a white table', 'Create a picture of a futuristic city at sunset', 'Make an image of a small cabin beside a lake', 'Draw a friendly robot reading a book', 'Generate a logo for a fictional coffee shop', 'Create an illustration of a rocket launching into space', 'Make a picture of a golden retriever in a park', 'Draw a minimalist mountain landscape', 'Generate an image of a blue bicycle by the ocean', 'Create a picture of a glass greenhouse full of plants', 'Make an illustration of a dragon flying over a castle', 'Generate a product image of a white sneaker', 'Create a picture of a cozy library with tall shelves', 'Draw a cartoon-style astronaut on the moon', 'Generate an image of a tropical beach with palm trees', 'Create a simple app icon shaped like a star', 'Make a picture of a train crossing a bridge', 'Draw a watercolor-style garden with flowers', 'Generate an image of a futuristic electric car', 'Create an illustration of a night sky with a bright comet'
];

for (const [index, prompt] of prompts.entries()) {
  test(`native image generation request ${index + 1}/20`, async () => {
    const result = await largeJSChat({ messages: [{ role: 'user', content: prompt }] });
    assert.equal(result.toolResults.at(-1)?.tool, 'image-generation');
    assert.equal(result.toolResults.at(-1)?.ok, true);
    assert.ok(Array.isArray(result.artifacts?.images));
    assert.equal(result.artifacts.images.length, 1);
    assert.equal(result.artifacts.images[0].model, 'tonyai-local-image-v1');
    assert.equal(result.artifacts.images[0].size, '1024x1024');
    assert.match(result.artifacts.images[0].image, /^data:image\/svg\+xml;base64,/);
    assert.ok(String(result.reply).trim().length > 0);
    assert.doesNotMatch(String(result.reply), /needs a language model for a reliable free-form answer|request needs a language model|intent detected; use/i);
  });
}
