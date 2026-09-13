import { chromium } from 'playwright';

/*
 * TonyAI ChatResponse: single-file, browser-native web retrieval.
 *
 * The pipeline intentionally stays inside this file: search-engine query
 * injection, live DOM NodeList inspection, frequency maps, query expansion,
 * duplicate clustering, source-quality scoring, corroboration and ranking.
 * Search evidence can be strong but no search engine can guarantee universal
 * certainty, so confidence is explicitly evidence-based rather than absolute.
 */
const SEARCH_URL='https://html.duckduckgo.com/html/';
const DEFAULT_RESULTS=10,MAX_RESULTS=12,MAX_VARIANTS=4,DEFAULT_TIMEOUT=1800;
const STOP_WORDS=new Set('a an the and or but if then else for to of in on at by with from into over under about as is are was were be been being this that these those it its they them their your you we our what which who whom where when why how can could should would may might must do does did have has had not no nor than too very more most some any all each every both either neither other another such only own same so just now today current latest new get give find search information answer facts sources official documentation'.split(/\s+/));
const TRUSTED_SUFFIXES=new Map([['.gov',1],['.edu',.96],['.ac.uk',.96],['.org',.82],['.int',.98]]);
const TRUSTED_DOMAINS=new Set(['wikipedia.org','developer.mozilla.org','docs.python.org','nodejs.org','developer.chrome.com','web.dev','ietf.org','w3.org','nasa.gov','nih.gov','who.int','un.org']);
const browserPromise=chromium.launch({headless:true});
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const lower=value=>clean(value).toLowerCase();
const tokens=text=>[...new Set((lower(text).match(/[a-z0-9][a-z0-9._:/-]{1,}/g)||[]).filter(x=>x.length>1&&!STOP_WORDS.has(x)))];
const wordSet=text=>new Set(tokens(text));
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));

function frequencyMap(values,limit=40){
 const map=new Map();for(const value of values){const key=clean(value);if(!key||key.length>300)continue;map.set(key,(map.get(key)||0)+1)}
 return [...map.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,limit).map(([value,count])=>({value,count}));
}
function canonicalUrl(raw){
 try{const u=new URL(raw);u.hash='';u.hostname=u.hostname.toLowerCase();u.protocol='https:';for(const key of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid'])u.searchParams.delete(key);if(u.pathname.length>1)u.pathname=u.pathname.replace(/\/+$/,'');return u.toString()}catch{return clean(raw)}
}
function domainOf(url){try{return new URL(url).hostname.replace(/^www\./,'').toLowerCase()}catch{return ''}}
function sourceQuality(url){
 const domain=domainOf(url);if(!domain)return .15;if(TRUSTED_DOMAINS.has(domain))return 1;for(const [suffix,score] of TRUSTED_SUFFIXES)if(domain.endsWith(suffix))return score;
 if(/(^|\.)(docs?|developer|developers|support|help|reference|spec|standards)\./i.test(domain))return .86;
 if(/(^|\.)(news|reuters|apnews|bbc|nytimes|nature|science|arxiv)\./i.test(domain))return .84;
 if(/(^|\.)(reddit|quora|medium|substack)\./i.test(domain))return .58;return .65;
}
function queryVariants(query){
 const q=clean(query),quoted=q.match(/"[^"]+"/g)?.join(' ')||'';
 return [...new Set([q,quoted||q,`${q} facts sources`,`${q} official documentation`].map(clean).filter(Boolean))].slice(0,MAX_VARIANTS);
}
function overlap(a,b){const aa=wordSet(a),bb=wordSet(b);if(!aa.size||!bb.size)return 0;let hits=0;for(const x of aa)if(bb.has(x))hits++;return hits/Math.max(1,Math.min(aa.size,bb.size))}
function dateScore(text){const match=lower(text).match(/\b(20\d{2})\b/);if(!match)return .5;const age=new Date().getUTCFullYear()-Number(match[1]);return age<=0?1:age===1?.9:age===2?.78:age<=5?.6:.35}
function rankResult(result,{queryTokens,commonText,commonClasses,domainCounts}){
 const text=lower(`${result.title} ${result.snippet}`),rt=wordSet(text);let hits=0;for(const token of queryTokens)if(rt.has(token))hits++;
 const lexical=clamp(hits/Math.max(1,queryTokens.size)),phrase=overlap(result.title,result.query||''),domain=domainOf(result.url);
 const commonTextHits=commonText.reduce((n,x)=>n+(x.value.length>5&&text.includes(lower(x.value))?x.count:0),0);
 const classHits=result.classes.reduce((n,c)=>n+(commonClasses.get(c)||0),0);
 const corroboration=clamp(Math.log1p(domainCounts.get(domain)||1)/Math.log(8));
 return lexical*38+phrase*14+corroboration*15+sourceQuality(result.url)*14+dateScore(`${result.title} ${result.snippet}`)*6+clamp(result.snippet.length/180)*5+clamp(result.title.length/90)*3+Math.min(5,commonTextHits/4)+Math.min(3,classHits/20);
}

async function searchOne(page,query,limit,timeoutMs){
 // The request is deliberately injected through the search page rather than
 // only encoded into a URL, preserving the requested browser/DOM workflow.
 await page.goto(SEARCH_URL,{waitUntil:'domcontentloaded',timeout:timeoutMs});
 const input=page.locator('input[name="q"]').first();
 await input.fill(query);await input.press('Enter');
 await page.waitForLoadState('domcontentloaded',{timeout:Math.max(200,timeoutMs-200)}).catch(()=>{});
 return page.evaluate(({limit,query})=>{
  const clean=x=>String(x??'').replace(/\s+/g,' ').trim();const nodes=Array.from(document.querySelectorAll('*'));
  const selectors=['.result','.results_links','article','main a[href]','a.result__a'];const containers=[];
  for(const selector of selectors)for(const node of document.querySelectorAll(selector))if(!containers.includes(node))containers.push(node);
  const results=[];
  for(const node of containers.slice(0,limit*3)){
   const link=node.matches('a[href]')?node:node.querySelector('a.result__a[href],a[href]');if(!link)continue;const url=link.href||'';if(!/^https?:/i.test(url))continue;
   const title=clean(link.textContent||node.querySelector('h1,h2,h3')?.textContent);const snippet=clean(node.querySelector('.result__snippet,.result__body,p')?.textContent||node.textContent).slice(0,800);
   if(!title||results.some(x=>x.url===url))continue;results.push({title,url,snippet,classes:Array.from(node.classList||[]),query});
  }
  const texts=[],classes=[],attributes=[];for(const node of nodes.slice(0,8000)){
   const text=clean(node.textContent);if(text.length>=3&&text.length<=300)texts.push(text);for(const c of node.classList||[])if(c)classes.push(c);for(const attr of node.attributes||[])if(attr.name&&attr.value)attributes.push(`${attr.name}=${clean(attr.value).slice(0,160)}`);
  }
  return{results,texts,classes,attributes,nodeCount:nodes.length,url:location.href};
 },{limit,query});
}
function mergeResults(snapshots){
 const map=new Map(),text=[],classes=[],attributes=[];
 for(const snapshot of snapshots){text.push(...snapshot.texts);classes.push(...snapshot.classes);attributes.push(...snapshot.attributes);for(const result of snapshot.results){const key=canonicalUrl(result.url),prior=map.get(key);if(prior){prior.queries.add(result.query);if(result.snippet.length>prior.snippet.length)prior.snippet=result.snippet;if(result.title.length>prior.title.length)prior.title=result.title;prior.classes=[...new Set([...prior.classes,...result.classes])]}else map.set(key,{...result,url:key,queries:new Set([result.query])})}}
 return{results:[...map.values()],commonText:frequencyMap(text,40),commonClasses:frequencyMap(classes,40),commonAttributes:frequencyMap(attributes,40)};
}
function chooseWinner(results,query){
 const queryTokens=new Set(tokens(query)),domainCounts=new Map();for(const r of results)domainCounts.set(domainOf(r.url),(domainCounts.get(domainOf(r.url))||0)+1);
 const commonText=results.flatMap(r=>tokens(`${r.title} ${r.snippet}`)).reduce((m,x)=>(m.set(x,(m.get(x)||0)+1),m),new Map()),classCounts=new Map();for(const r of results)for(const c of r.classes)classCounts.set(c,(classCounts.get(c)||0)+1);
 const ranked=results.map(r=>({...r,queries:[...r.queries],score:Number(rankResult(r,{queryTokens,commonText:[...commonText.entries()].map(([value,count])=>({value,count})),commonClasses:classCounts,domainCounts}).toFixed(4))})).sort((a,b)=>b.score-a.score||sourceQuality(b.url)-sourceQuality(a.url)||a.title.localeCompare(b.title));
 const top=ranked.slice(0,Math.min(5,ranked.length));const corroboration=top.length?top.filter((x,i)=>top.some((y,j)=>j!==i&&overlap(x.title+' '+x.snippet,y.title+' '+y.snippet)>=.45)).length/top.length:0;
 return{winner:ranked[0]||null,ranked,corroboration,domainAgreement:top.length?new Set(top.map(x=>domainOf(x.url))).size/top.length:0};
}
export async function chatresponse(query,{maxResults=DEFAULT_RESULTS,timeoutMs=DEFAULT_TIMEOUT}={}){
 const q=clean(query);if(!q)throw new Error('Search query is required');const browser=await browserPromise,context=await browser.newContext({locale:'en-US'}),variants=queryVariants(q),pages=await Promise.all(variants.map(()=>context.newPage()));
 try{
  const settled=await Promise.allSettled(variants.map((variant,i)=>searchOne(pages[i],variant,Math.min(Math.max(Number(maxResults)||DEFAULT_RESULTS,4),MAX_RESULTS),timeoutMs)));
  const snapshots=settled.filter(x=>x.status==='fulfilled').map(x=>x.value);if(!snapshots.length)throw new Error('Search engine returned no inspectable DOM results');
  const merged=mergeResults(snapshots),decision=chooseWinner(merged.results,q),winner=decision.winner,queryCoverage=snapshots.length/variants.length,corroborated=clamp(decision.corroboration*.65+decision.domainAgreement*.35);
  const confidence=Number(clamp((winner?sourceQuality(winner.url):0)*.25+(winner?clamp(winner.score/100):0)*.45+queryCoverage*.1+corroborated*.2).toFixed(4));
  return{query:q,answer:winner?.title||'No sufficiently supported result found.',result:winner,results:decision.ranked.slice(0,Math.min(12,merged.results.length)),confidence,definite:confidence>=.9&&corroborated>=.55,evidence:{queryVariants:variants,successfulVariants:snapshots.length,corroboration:corroborated,domainAgreement:decision.domainAgreement,sourceQuality:winner?sourceQuality(winner.url):0},frequency:{commonText:merged.commonText,commonClasses:merged.commonClasses,commonAttributes:merged.commonAttributes},dom:{nodeListCount:snapshots.reduce((n,s)=>n+s.nodeCount,0),inspectedSelectors:['*','.result','.results_links','article','main a[href]','a.result__a'],pagesInspected:snapshots.length},method:'JavaScript search-engine query injection -> multi-query DOM inspection -> NodeList extraction -> frequency maps -> canonicalization -> corroboration -> authority/relevance/freshness ranking -> strongest supported result'};
 }finally{await Promise.all(pages.map(p=>p.close().catch(()=>{})));await context.close()}
}
export default chatresponse;
