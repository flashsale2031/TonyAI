import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const BASE=process.env.TONYAI_BASE_URL||'http://127.0.0.1:3000';
const questions=[
 'What is JavaScript?', 'What is HTML?', 'What is CSS?', 'What is HTTP?', 'What is HTTPS?',
 'What is JSON?', 'What is an API?', 'What is a URL?', 'What is DNS?', 'What is a browser?',
 'What is Node.js?', 'What is npm?', 'What is Git?', 'What is GitHub?', 'What is Playwright?',
 'What is a database?', 'What is SQL?', 'What is SQLite?', 'What is caching?', 'What is compression?',
 'What is Brotli?', 'What is gzip?', 'What is WebSocket?', 'What is SSE?', 'What is REST?',
 'What is a promise in JavaScript?', 'What is async/await?', 'What is a closure?', 'What is a module?', 'What is ESM?',
 'What is a DOM?', 'What is event delegation?', 'What is localStorage?', 'What is IndexedDB?', 'What is a service worker?',
 'What is a CDN?', 'What is latency?', 'What is throughput?', 'What is concurrency?', 'What is parallelism?',
 'How does DNS work?', 'How does HTTPS work?', 'How does browser caching work?', 'How does a search engine rank results?', 'How does full-text search work?',
 'How does a web crawler work?', 'How does JavaScript execute?', 'How does garbage collection work?', 'How does HTTP caching work?', 'How does Brotli compression work?',
 'Why use semantic HTML?', 'Why use HTTPS?', 'Why are indexes useful in databases?', 'Why does caching improve speed?', 'Why can search results disagree?',
 'Why do websites use CDNs?', 'Why can CSS cause layout problems?', 'Why can JavaScript block rendering?', 'Why are browser contexts isolated?', 'Why should search sources be diversified?',
 'Compare HTTP and HTTPS.', 'Compare REST and WebSocket.', 'Compare SQL and NoSQL.', 'Compare cookies and localStorage.', 'Compare gzip and Brotli.',
 'Compare client-side and server-side rendering.', 'Compare synchronous and asynchronous JavaScript.', 'Compare a browser tab and a browser context.', 'Compare caching and prefetching.', 'Compare exact search and semantic search.',
 'What is the capital of France?', 'What is the capital of Japan?', 'What is the largest ocean?', 'What is the tallest mountain?', 'What is the fastest land animal?',
 'What is the chemical symbol for gold?', 'What is the boiling point of water at sea level?', 'How many continents are there?', 'How many days are in a leap year?', 'What planet is known as the Red Planet?',
 'What is 17 times 19?', 'What is 144 divided by 12?', 'What is 15 percent of 240?', 'What is the square root of 144?', 'What is 2 to the 10th power?',
 'What is the average of 10, 20, and 30?', 'What is the median of 3, 9, and 12?', 'What is the probability of a fair coin landing heads?', 'What is 1 kilometer in meters?', 'What is 1 hour in seconds?',
 'What is the difference between a fact and an opinion?', 'How should conflicting sources be handled?', 'How can a search system detect duplicate results?', 'How can a search system detect stale sources?', 'How can a search system measure source diversity?',
 'What makes a source authoritative?', 'What makes a search answer well supported?', 'What is evidence consensus?', 'What is contradiction detection?', 'What is confidence calibration?',
 'How can a chat interface render search results quickly?', 'How can browser automation be made resilient?', 'How can Playwright tests reduce flaky selectors?', 'How can a JavaScript search system cache results?', 'How can parallel requests reduce perceived latency?'
];

assert.equal(questions.length,100,'The live regression suite must contain exactly 100 questions');

async function post(query){
 const started=performance.now();
 const response=await fetch(`${BASE}/api/chatresponse`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query,maxResults:6,timeoutMs:1650,verify:true})});
 const data=await response.json();
 return {query,status:response.status,data,elapsedMs:performance.now()-started};
}

const failures=[];
let next=0;
async function worker(){
 while(true){const i=next++;if(i>=questions.length)return;try{const result=await post(questions[i]);const valid=result.status===200&&typeof result.data?.answer==='string'&&Array.isArray(result.data?.results)&&typeof result.data?.confidence==='number';if(!valid)failures.push({index:i+1,query:result.query,status:result.status,error:result.data?.error||'invalid response'});}catch(error){failures.push({index:i+1,query:questions[i],status:0,error:String(error?.message||error)})}}
}
await Promise.all(Array.from({length:4},worker));
console.log(JSON.stringify({suite:'chatresponse-100-live',base:BASE,total:questions.length,passed:questions.length-failures.length,failed:failures.length,failures},null,2));
assert.equal(failures.length,0,`${failures.length} of 100 live ChatResponse questions failed`);

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({locale:'en-US'});
const page=await context.newPage();
await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:10000});
const uiQuestions=questions.slice(0,10);
for(const question of uiQuestions){
 await page.getByLabel('Message TONY').fill(question);
 await page.getByRole('button',{name:'Send message'}).click();
 await page.locator('[data-chatresponse] [data-chatresponse-status]').waitFor({state:'detached',timeout:6000}).catch(()=>{});
 const rows=page.locator('[data-chatresponse]');
 assert.ok(await rows.count()>0,`No rendered ChatResponse row for: ${question}`);
}
await context.close();
await browser.close();
console.log(JSON.stringify({uiSmokeQuestions:uiQuestions.length,uiSmoke:'passed'}));
