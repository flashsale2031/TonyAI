import test from 'node:test';
import assert from 'node:assert/strict';
import { localAssistant } from '../engine/local-assistant.js';

const cases = [
  ['Hello', 'Hello'],
  ['Who are you?', 'TONY'],
  ['What can you do?', 'local chat assistant'],
  ['What is 2 + 2?', '4'],
  ['Calculate 12 * 8', '96'],
  ['What is 15% of 200?', '30'],
  ['What is the capital of France?', 'Paris'],
  ['Which planet is known as the Red Planet?', 'Mars'],
  ['How many days are in a leap year?', '366'],
  ['Convert 5 kilometers to miles.', '3.10686'],
  ['Convert 32 Fahrenheit to Celsius.', '0'],
  ['What is the temperature in China right now?', 'live weather'],
  ['What time is it in Tokyo?', 'live time'],
  ['What are the latest news headlines?', 'live web'],
  ['Define ephemeral.', 'temporary'],
  ['What is the opposite of hot?', 'cold'],
  ['Write a short thank-you note.', 'Thank you'],
  ['Summarize: TonyAI is a local assistant.', 'paste the text'],
  ['Thanks for your help.', 'welcome'],
  ['Explain photosynthesis in one sentence.', 'photosynthesis']
];

test('offline assistant answers 20 representative questions', () => {
  for (const [question, expected] of cases) {
    const result = localAssistant({ messages: [{ role: 'user', content: question }] });
    assert.match(result.reply.toLowerCase(), new RegExp(expected.toLowerCase()), question);
  }
});
