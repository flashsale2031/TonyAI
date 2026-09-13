import { chromium } from 'playwright';

const SEARCH_URL='https://html.duckduckgo.com/html/';
const STOP_WORDS=new Set(['the','and','for','with','that','this','from','your','what','where','when','which','about','into','have','has','are','was','were','will','how','why','who','does','can','not','you','its','our','their','more','than','then','also','only','over','under','www','com']);
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const tokens=text=>clean(text).toLowerCase().match(/[a-z0-9][a-z0-9._-]{2,}/g)?.filter(token=>!STOP_WORDS.has(token))||[];
const browserPromise=chromium.launch({headless:true});

function frequencyMap(values){
 const map=new Map();
 for(const value of values){const key=clean(value);if(!key)continue;map.set(key,(map.get(key)||0)+1);}
 return [...map.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([value,count])=>({value,count}));
}

function rankResult(result,commonText,commonClasses,queryTokens){
 const textTokens=tokens(`${result.title} ${result.snippet}`);
 const tokenHits=textTokens.reduce((sum,token)=>sum+(queryTokens.has(token)?1:0),0);
 const commonTextHits=commonText.filter(x=>x.value&&clean(`${result.title} ${result.snippet}`).toLowerCase().includes(x.value.toLowerCase())).reduce((sum,x)=>sum+x.count,0);
 const classHits=result.classes.reduce((sum,name)=>sum+(commonClasses.find(x=>x.value===name)?.count||0),0);
 return tokenHits*100+commonTextHits*10+classHits;
}

export async function chatresponse(query,{maxResults=8,timeoutMs=1800}={}){
 const q=clean(query);if(!q)throw new Error('Search query is required');
 const browser=await browserPromise;
 const context=await browser.newContext();
 const page=await context.newPage();
 try{
  await page.goto(SEARCH_URL,{waitUntil:'domcontentloaded',timeout:timeoutMs});
  const input=page.locator('input[name="q"]').first();
  await input.fill(q);
  await input.press('Enter');
  await page.waitForLoadState('domcontentloaded',{timeout:Math.max(250,timeoutMs-250)}).catch(()=>{});
  const snapshot=await page.evaluate((limit)=>{
   const nodes=Array.from(document.querySelectorAll('a,button,span,p,div,h1,h2,h3'));
   const results=Array.from(document.querySelectorAll('.result, .results_links, article')).slice(0,limit).map(node=>{
    const link=node.querySelector('a.result__a, a[href]');
    const snippet=node.querySelector('.result__snippet, .result__body, p');
    const classes=Array.from(node.classList||[]);
    return{title:clean(link?.textContent||node.querySelector('h2,h3')?.textContent),url:link?.href||'',snippet:clean(snippet?.textContent||''),classes};
   }).filter(item=>item.title&&/^https?:/i.test(item.url));
   const texts=nodes.map(node=>clean(node.textContent)).filter(text=>text.length>=3&&text.length<=240).slice(0,2000);
   const classes=nodes.flatMap(node=>Array.from(node.classList||[])).filter(Boolean).slice(0,4000);
   return{results,texts,classes,nodeCount:nodes.length};
  },Math.min(Math.max(Number(maxResults)||8,1),12));
  const commonText=frequencyMap(snapshot.texts).slice(0,25);
  const commonClasses=frequencyMap(snapshot.classes).slice(0,25);
  const queryTokens=new Set(tokens(q));
  const ranked=snapshot.results.map(result=>({...result,score:rankResult(result,commonText,commonClasses,queryTokens)})).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title));
  const winner=ranked[0]||null;
  return{query:q,provider:'DuckDuckGo DOM',result:winner,results:ranked,frequency:{commonText,commonClasses},dom:{nodeListCount:snapshot.nodeCount,inspectedSelectors:['a','button','span','p','div','h1','h2','h3']},method:'JavaScript browser search -> injected query -> DOM NodeList inspection -> frequency map -> most common ranked result'};
 }finally{await context.close();}
}

export default chatresponse;
