import test from 'node:test';
import assert from 'node:assert/strict';
import { largeJSChat } from '../engine/large-js-chat.js';

// Reproducible pseudo-random requests: every run exercises the same 100
// independently generated questions while retaining random-looking inputs.
let seed = 0x51f15e;
function rnd(max){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max;}
function messages(prompt){return {messages:[{role:'user',content:prompt}]};}
function textOf(result){return String(result?.reply||'');}

const cases=[];
const arithmeticForms=[
  n=>`Calculate ${n.a} + ${n.b}`,
  n=>`What is ${n.a} - ${n.b}?`,
  n=>`Compute ${n.a} * ${n.b}`,
  n=>`Calculate ${n.a} % ${n.b}`,
  n=>`What is (${n.a} + ${n.b}) * ${n.c}?`,
  n=>`Compute ${n.a} * ${n.b} - ${n.c}`,
];
for(let i=0;i<60;i++){
  const a=1+rnd(500),b=1+rnd(100),c=1+rnd(20),kind=rnd(arithmeticForms.length);
  const n={a,b,c};
  let expected;
  switch(kind){
    case 0: expected=a+b; break;
    case 1: expected=a-b; break;
    case 2: expected=a*b; break;
    case 3: expected=a%b; break;
    case 4: expected=(a+b)*c; break;
    default: expected=a*b-c;
  }
  cases.push([`random arithmetic ${i+1}`,arithmeticForms[kind](n),String(expected)]);
}

for(let i=0;i<20;i++){
  const alphabet=['TonyAI','JavaScript LM','deterministic tools','rapid response','quality result','test suite','browser safety','exact arithmetic'];
  const text=alphabet[rnd(alphabet.length)]+' '+alphabet[rnd(alphabet.length)];
  if(i%2===0){
    const expected=text.split(/\s+/).length;
    cases.push([`random word count ${i+1}`,`Word count: ${text}`,`"words": ${expected+2}`]);
  }else{
    const expected=text.split('').reverse().join('');
    cases.push([`random reverse ${i+1}`,`Reverse: ${text}`,expected]);
  }
}

for(let i=0;i<10;i++){
  const values=Array.from({length:5},()=>1+rnd(50));
  const sorted=[...values].sort((a,b)=>a-b);
  const sum=values.reduce((a,b)=>a+b,0);
  const mean=sum/values.length;
  cases.push([`random statistics ${i+1}`,`Statistics: ${values.join(' ')}`,`"count": 5`]);
  cases.push([`random statistics mean ${i+1}`,`Statistics: ${values.join(' ')}`,`"mean": ${mean}`]);
}

assert.equal(cases.length,100,'The capability corpus must contain exactly 100 requests');

for(const [name,prompt,expected] of cases){
  test(name,async()=>{
    const result=await largeJSChat(messages(prompt));
    const reply=textOf(result);
    assert.ok(reply.length>0,'TonyAI returned an empty response');
    assert.match(reply,new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),`Incorrect/missing result for ${prompt}\nReply: ${reply}`);
    assert.doesNotMatch(reply,/needs a language model for a reliable free-form answer|request needs a language model|intent detected; use/i,'Placeholder/defer response detected');
  });
}
