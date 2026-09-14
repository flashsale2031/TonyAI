import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const BASE='http://127.0.0.1:3000';
const source=fs.readFileSync(new URL('./chatbox-100-live.mjs',import.meta.url),'utf8');
const declaration=source.indexOf('const questions');
const arrayStart=source.indexOf('[',declaration);
function matchingArrayEnd(text,start){let d=0,q=null,e=false;for(let i=start;i<text.length;i++){const c=text[i];if(q){if(e)e=false;else if(c==='\\')e=true;else if(c===q)q=null;continue;}if(c==='"'||c==="'"||c==='`'){q=c;continue;}if(c==='[')d++;else if(c===']'&&--d===0)return i;}return-1;}
const end=matchingArrayEnd(source,arrayStart);
const parsed=Function(`return (${source.slice(arrayStart,end+1)})`)();
if(!Array.isArray(parsed)||parsed.length<100)throw new Error('Canonical suite has fewer than 100 questions');
const questions=parsed.slice(0,100);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(){for(let i=0;i<150;i++){try{if((await fetch(`${BASE}/health`,{signal:AbortSignal.timeout(1000)})).ok)return;}catch{}await sleep(200);}throw new Error('TonyAI server did not become ready');}
const ignored=new Set(['what','does','this','that','with','from','into','when','where','which','about','explain','define','difference','between','should','would','could','there','their','than','then','have','your','will','most','some','used','using','make','more','less']);
const words=s=>String(s).toLowerCase().match(/[a-z0-9]+/g)||[];
function validate(q,a){a=String(a).trim().toLowerCase();if(a.length<12)return'answer too short';if(/live search unavailable|search unavailable|unable to search|no results available/.test(a))return'search failure';const c=[...new Set(words(q).filter(w=>w.length>=4&&!ignored.has(w)))];return c.length&&!c.some(w=>a.includes(w))?'answer has no query-term overlap':null;}
const server=spawn(process.execPath,['server.js'],{cwd:process.cwd(),stdio:'inherit',env:{...process.env,PORT:'3000'} });
let browser;let totalPassed=0;const failures=[];
try{
 await ready();
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({locale:'en-US'});
 context.setDefaultTimeout(12000);context.setDefaultNavigationTimeout(15000);await context.setExtraHTTPHeaders({'Accept-Encoding':'identity'});
 await context.route('https://duck.ai/**',r=>r.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Duck.ai CI</title>'}));
 for(let part=0;part<10;part++){
   const page=await context.newPage();
   await page.goto(`${BASE}/index.html`,{waitUntil:'domcontentloaded'});
   const input=page.locator('#messageInput');
   if(await input.count()!==1)throw new Error(`Part ${part+1}/10: chatbox input missing`);
   await page.addScriptTag({url:`${BASE}/engine/chatresponse-client.js`});
   await page.waitForFunction(()=>Boolean(window.TonyAIChatResponse?.search&&window.TonyAIChatResponse?.duckAiUrl));
   let partPassed=0;
   for(let offset=0;offset<10;offset++){
     const index=part*10+offset;const q=String(questions[index]);
     try{
       await input.fill(q);const before=await page.locator('[data-chatresponse]').count();
       const duck=await page.evaluate(text=>window.TonyAIChatResponse.duckAiUrl(text),q);
       const expected=new URL('https://duck.ai/chat');expected.searchParams.set('prompt','1');expected.searchParams.set('q',q);
       if(duck!==expected.toString())throw new Error('Duck.ai URL mismatch');
       await page.evaluate(text=>{window.TonyAIChatResponse.search(text);return true;},q);
       await page.waitForFunction(({count})=>document.querySelectorAll('[data-chatresponse]').length>count,{count:before});
       const row=page.locator('[data-chatresponse]').last();
       await row.locator('.message-bubble').waitFor({state:'visible',timeout:5000});
       await page.waitForFunction(()=>{const r=document.querySelector('[data-chatresponse]:last-of-type');const b=r?.querySelector('.message-bubble');return Boolean(b?.dataset.searchReady||b?.dataset.localReady);},{timeout:5000});
       const answer=await row.innerText();const error=validate(q,answer);if(error)throw new Error(`${error}\nA: ${answer}`);
       partPassed++;totalPassed++;console.log(`DUCKAI_PART ${part+1}/10 TEST ${offset+1}/10 PASS (global ${totalPassed}/100)`);
     }catch(error){failures.push({index:index+1,part:part+1,question:q,error:String(error?.message||error)});console.error(`DUCKAI_PART ${part+1}/10 TEST ${offset+1}/10 FAIL`);console.error(failures.at(-1));}
   }
   console.log(`DUCKAI_PART_RESULT ${part+1}/10 ${partPassed}/10 PASS`);
   await page.close();
 }
 if(failures.length){console.error(`DUCKAI_TEST_RESULT ${totalPassed}/100 PASS; ${failures.length}/100 FAIL`);process.exitCode=1;}
 else console.log('DUCKAI_TEST_RESULT 100/100 PASS');
}finally{await browser?.close().catch(()=>{});server.kill('SIGTERM');await sleep(250);if(!server.killed)server.kill('SIGKILL');}
