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

const answerChecks=[
 [/javascript/i,/programming|language|script/],[/html/i,/markup|document|web/],[/css/i,/style|stylesheet/],[/http/i,/protocol|request|response/],[/https/i,/secure|tls|encryption/],
 [/json/i,/format|data|object/],[/api/i,/interface|application|program/],[/url/i,/address|resource|web/],[/dns/i,/domain|name|address/],[/browser/i,/web|page|render/],
 [/node\.js|node/i,/javascript|runtime|server/],[/npm/i,/package|node|registry/],[/git/i,/version|control|repository/],[/github/i,/repository|code|git/],[/playwright/i,/browser|test|automation/],
 [/database/i,/data|store|query/],[/sql/i,/query|database|relational/],[/sqlite/i,/database|embedded|file/],[/caching/i,/cache|stored|reuse/],[/compression/i,/size|data|smaller/],
 [/brotli/i,/compression|compress/],[/gzip/i,/compression|compress/],[/websocket/i,/connection|real.?time|bidirectional/],[/sse/i,/server|event|stream/],[/rest/i,/resource|http|api/],
 [/promise/i,/async|future|settle/],[/async\/await/i,/asynchronous|promise|await/],[/closure/i,/function|scope|variable/],[/module/i,/code|import|export/],[/esm/i,/module|import|export/],
 [/dom/i,/document|object|tree/],[/event delegation/i,/event|parent|listener/],[/localstorage/i,/browser|storage|key/],[/indexeddb/i,/database|browser|storage/],[/service worker/i,/worker|cache|browser/],
 [/cdn/i,/content|network|server/],[/latency/i,/time|delay/],[/throughput/i,/data|rate/],[/concurrency/i,/tasks|simultaneous|overlap/],[/parallelism/i,/parallel|simultaneous|execution/],
 [/dns/i,/domain|server|address/],[/https/i,/tls|secure|encryption/],[/cache/i,/cache|browser|stored/],[/search engine/i,/rank|result|query/],[/full.?text search/i,/text|index|search/],
 [/web crawler/i,/page|crawl|link/],[/javascript/i,/engine|execute|runtime/],[/garbage collection/i,/memory|object|unreachable/],[/http caching/i,/cache|header|response/],[/brotli/i,/compression|dictionary|size/],
 [/semantic html/i,/meaning|structure|accessibility/],[/https/i,/security|encryption|tls/],[/index/i,/query|database|lookup/],[/cache/i,/reuse|speed|stored/],[/search results/i,/source|query|rank/],
 [/cdn/i,/content|server|network/],[/css/i,/layout|style|render/],[/javascript/i,/render|blocking|main/],[/browser contexts/i,/isolation|browser|state/],[/sources/i,/divers|independent|source/],
 [/http|https/i,/protocol|secure|tls/],[/rest|websocket/i,/resource|connection|http/],[/sql|nosql/i,/database|relational|document/],[/cookies|localstorage/i,/storage|browser|cookie/],[/gzip|brotli/i,/compression|size/],
 [/client.?side|server.?side/i,/render|server|browser/],[/synchronous|asynchronous/i,/async|blocking|wait/],[/browser tab|browser context/i,/page|isolation|context/],[/caching|prefetching/i,/cache|download|ahead/],[/exact search|semantic search/i,/meaning|match|query/],
 [/paris|france/i,/paris/i],[/tokyo|japan/i,/tokyo/i],[/pacific/i,/ocean/i],[/everest|mount/i,/everest|mount/i],[/cheetah/i,/animal|speed|cheetah/],
 [/gold/i,/au|gold/],[/boiling point/i,/100|celsius|water/],[/continents/i,/7|seven/],[/leap year/i,/366/],[/red planet/i,/mars/i],
 [/17 times 19/i,/323/],[/144 divided by 12/i,/12/],[/15 percent of 240/i,/36/],[/square root of 144/i,/12/],[/2 to the 10th/i,/1024/],
 [/average/i,/20/],[/median/i,/9/],[/fair coin/i,/50|half|0\.5/],[/kilometer/i,/1000/],[/hour/i,/3600/],
 [/fact and an opinion/i,/fact|opinion/],[/conflicting sources/i,/source|evidence|compare/],[/duplicate results/i,/duplicate|url|similar/],[/stale sources/i,/date|fresh|old/],[/source diversity/i,/domain|source|divers/],
 [/authoritative/i,/authority|expert|primary|source/],[/well supported/i,/evidence|source|support/],[/evidence consensus/i,/agreement|source|evidence/],[/contradiction detection/i,/conflict|contradict|compare/],[/confidence calibration/i,/confidence|probability|calibr/],
 [/render search results/i,/render|result|stream|fast/],[/browser automation/i,/retry|locator|wait|browser/],[/playwright tests/i,/locator|selector|wait/],[/search system cache/i,/cache|result|reuse/],[/parallel requests/i,/parallel|latency|concurrent/]
];
assert.equal(answerChecks.length,100,'Each question must have a response-content validator');

async function post(query){
 const started=performance.now();
 const response=await fetch(`${BASE}/api/chatresponse`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query,maxResults:6,timeoutMs:1650,verify:true})});
 const data=await response.json();
 return {query,status:response.status,data,elapsedMs:performance.now()-started};
}

const failures=[];let next=0;
async function worker(){
 while(true){
  const i=next++;if(i>=questions.length)return;
  try{
   const result=await post(questions[i]);
   const answer=String(result.data?.answer||'');
   const basic=result.status===200&&answer.length>20&&Array.isArray(result.data?.results)&&result.data.results.length>0&&typeof result.data?.confidence==='number';
   const [qPattern,aPattern]=answerChecks[i];
   const semantic=qPattern.test(result.query)&&aPattern.test(answer);
   if(!basic||!semantic)failures.push({index:i+1,query:result.query,status:result.status,error:!basic?'invalid/empty ChatResponse':`answer failed validator: ${answer.slice(0,240)}`});
  }catch(error){failures.push({index:i+1,query:questions[i],status:0,error:String(error?.message||error)})}
 }
}
await Promise.all(Array.from({length:4},worker));
console.log(JSON.stringify({suite:'chatresponse-100-live',base:BASE,total:questions.length,passed:questions.length-failures.length,failed:failures.length,failures},null,2));
assert.equal(failures.length,0,`${failures.length} of 100 ChatResponse questions failed`);

// Full browser/chatbox validation: every one of the 100 questions is submitted
// through the real composer, opens Duck.ai with the exact request, and renders a
// non-empty ChatResponse answer in the TonyAI chat history.
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({locale:'en-US'});
await context.route('https://duck.ai/**',route=>route.abort());
const page=await context.newPage();
const duckFailures=[];
const renderFailures=[];
const duckPopups=[];
page.on('popup',popup=>duckPopups.push(popup));
await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:10000});

for(let i=0;i<questions.length;i++){
 const question=questions[i];
 const beforeRows=await page.locator('[data-chatresponse]').count();
 await page.getByLabel('Message TONY').fill(question);
 await page.getByRole('button',{name:'Send message'}).click();

 let popup=null;
 for(let attempt=0;attempt<20 && !popup;attempt++){
  popup=duckPopups.shift()||null;
  if(!popup)await page.waitForTimeout(25);
 }
 if(!popup){duckFailures.push({index:i+1,query:question,error:'Duck.ai popup was not opened'});}
 else{
  const expected=new URL('https://duck.ai/chat');expected.searchParams.set('prompt','1');expected.searchParams.set('q',question);
  const actual=popup.url();
  if(actual!==expected.toString())duckFailures.push({index:i+1,query:question,error:'Duck.ai URL did not contain exact chatbox text',expected:expected.toString(),actual});
  await popup.close().catch(()=>{});
 }

 const row=page.locator(`[data-chatresponse="${i+1}"]`);
 try{
  await row.waitFor({state:'attached',timeout:3000});
  await row.locator('.message-bubble').waitFor({state:'attached',timeout:1000});
  await page.waitForFunction(el=>{
   const text=(el?.innerText||'').trim();
   const status=el?.querySelector('[data-chatresponse-status]');
   return text.length>20 && !status && !/live search unavailable/i.test(text);
  },await row.elementHandle(),{timeout:7000});
  const rendered=(await row.innerText()).trim();
  if(rendered.length<20)renderFailures.push({index:i+1,query:question,error:'Rendered answer is empty'});
 }catch(error){renderFailures.push({index:i+1,query:question,error:`ChatResponse did not render: ${error.message}`});}
 const rows=await page.locator('[data-chatresponse]').count();
 if(rows!==beforeRows+1)renderFailures.push({index:i+1,query:question,error:`Expected ${beforeRows+1} ChatResponse rows, found ${rows}`});
}

await context.close();
await browser.close();
console.log(JSON.stringify({suite:'duckai-chatbox-100',total:100,duckAiPassed:100-duckFailures.length,duckAiFailed:duckFailures.length,renderPassed:100-renderFailures.length,renderFailed:renderFailures.length,duckFailures,renderFailures},null,2));
assert.equal(duckFailures.length,0,`${duckFailures.length} of 100 Duck.ai injection tests failed`);
assert.equal(renderFailures.length,0,`${renderFailures.length} of 100 TonyAI rendering tests failed`);
console.log(JSON.stringify({suite:'duckai-chatbox-100',status:'PASS',total:100,duckAiPassed:100,renderPassed:100}));
