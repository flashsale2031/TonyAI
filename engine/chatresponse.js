import { chromium } from 'playwright';

/*
 * TonyAI ChatResponse: single-file, browser-native web retrieval.
 *
 * Design goals:
 * - inject the user's request into a real search engine page;
 * - inspect the live DOM NodeList with page.evaluate();
 * - build frequency maps for text, classes, domains and tokens;
 * - run several query formulations for recall;
 * - canonicalize and cluster duplicate pages;
 * - score relevance, corroboration, source quality and freshness;
 * - return the strongest corroborated result rather than blindly trusting
 *   the first search result.
 *
 * This file deliberately contains no model, API client, database, scraper
 * package, or TonyAI module dependency beyond the repository's Playwright
 * dependency. It is not possible to guarantee historical or universal
 * certainty from search results alone, so confidence is evidence-based.
 */

const SEARCH_URL='https://html.duckduckgo.com/html/';
const DEFAULT_RESULTS=10;
const MAX_RESULTS=12;
const MAX_VARIANTS=4;
const DEFAULT_TIMEOUT=1800;
const STOP_WORDS=new Set('a an the and or but if then else for to of in on at by with from into over under about as is are was were be been being this that these those it its they them their your you we our what which who whom where when why how can could should would may might must do does did have has had not no nor than too very more most some any all each every both either neither other another such only own same so just now today current latest new get give find search information answer'.split(/\s+/));
const LOW_VALUE_CLASSES=new Set(['','result','results','result__body','result__a','result__snippet','results_links','no-js','js','active','hidden']);
const TRUSTED_SUFFIXES=new Map([['.gov',1.0],['.edu',.96],['.ac.uk',.96],['.org',.82],['.int',.98]]);
const TRUSTED_DOMAINS=new Set(['wikipedia.org','developer.mozilla.org','docs.python.org','nodejs.org','developer.chrome.com','web.dev','ietf.org','w3.org','nasa.gov','nih.gov','who.int','un.org']);
const browserPromise=chromium.launch({headless:true});

const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const lower=value=>clean(value).toLowerCase();
const tokens=text=>[...new Set((lower(text).match(/[a-z0-9][a-z0-9._:/-]{1,}/g)||[]).filter(x=>x.length>1&&!STOP_WORDS.has(x)))];
const wordSet=text=>new Set(tokens(text));
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));

function frequencyMap(values,limit=40){
 const map=new Map();
 for(const value of values){const key=clean(value);if(!key||key.length>300)continue;map.set(key,(map.get(key)||0)+1);}
 return [...map.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,limit).map(([value,count])=>({value,count}));
}

function canonicalUrl(raw){
 try{
  const u=new URL(raw);u.hash='';u.hostname=u.hostname.toLowerCase();u.protocol='https:';
  u.searchParams.delete('utm_source');u.searchParams.delete('utm_medium');u.searchParams.delete('utm_campaign');u.searchParams.delete('utm_term');u.searchParams.delete('utm_content');u.searchParams.delete('fbclid');u.searchParams.delete('gclid');
  if(u.pathname.length>1)u.pathname=u.pathname.replace(/\/+$/,'');
  return u.toString();
 }catch{return clean(raw);}
}

function domainOf(url){try{return new URL(url).hostname.replace(/^www\./,'').toLowerCase()}catch{return '';}}
function sourceQuality(url){
 const domain=domainOf(url);if(!domain)return .15;
 if(TRUSTED_DOMAINS.has(domain))return 1;
 for(const [suffix,score] of TRUSTED_SUFFIXES)if(domain.endsWith(suffix))return score;
 if(/(^|\.)(docs?|developer|developers|support|help|reference|spec|standards)\./i.test(domain))return .86;
 if(/(^|\.)(news|reuters|apnews|bbc|nytimes|nature|science|arxiv)\./i.test(domain))return .84;
 if(/(^|\.)(reddit|quora|medium|substack)\./i.test(domain))return .58;
 return .65;
}

function queryVariants(query){
 const q=clean(query);const quoted=q.match(/"[^"]+"/g)?.join(' ')||'';
 const variants=[q,quoted?quoted:q,`${q} facts sources`,`${q} official documentation`];
 return [...new Set(variants.map(clean).filter(Boolean))].slice(0,MAX_VARIANTS);
}

function overlap(a,b){
 const aa=wordSet(a),bb=wordSet(b);if(!aa.size||!bb.size)return 0;
 let hits=0;for(const x of aa)if(bb.has(x))hits++;
 return hits/Math.max(1,Math.min(aa.size,bb.size));
}

function dateScore(text){
 const s=lower(text);const year=new Date().getUTCFullYear();
 const match=s.match(/\b(20\d{2})\b/);if(!match)return .5;
 const age=year-Number(match[1]);if(age<=0)return 1;if(age===1)return .9;if(age===2)return .78;if(age<=5)return .6;return .35;
}

function rankResult(result,{queryTokens,commonText,commonClasses,domainCounts}){
 const text=lower(`${result.title} ${result.snippet}`);const rt=wordSet(text);
 let hits=0;for(const token of queryTokens)if(rt.has(token))hits++;
 const lexical=clamp(hits/Math.max(1,queryTokens.size));
 const phrase=overlap(result.title, result.query||'');
 const commonTextHits=commonText.reduce((n,x)=>n+(x.value.length>5&&text.includes(lower(x.value))?x.count:0),0);
 const classHits=result.classes.reduce((n,c)=>n+(commonClasses.get(c)||0),0);
 const domain=domainOf(result.url);const corroboration=Math.log1p(domainCounts.get(domain)||1)/Math.log(8);
 const authority=sourceQuality(result.url);
 const freshness=dateScore(`${result.title} ${result.snippet}`);
 const snippetQuality=clamp(result.snippet.length/180);
 const titleQuality=clamp(result.title.length/90);
 return lexical*38+phrase*14+clamp(corroboration)*15+authority*14+freshness*6+snippetQuality*5+titleQuality*3+Math.min(5,commonTextHits/4)+Math.min(3,classHits/20);
}

async function searchOne(page,query,limit,timeoutMs){
 await page.goto(`${SEARCH_URL}?q=${encodeURIComponent(query)}`,{waitUntil:'domcontentloaded',timeout:timeoutMs});
 await page.waitForLoadState('domcontentloaded',{timeout:Math.max(200,timeoutMs-200)}).catch(()=>{});
 return page.evaluate(({limit,query})=>{
  const clean=x=>String(x??'').replace(/\s+/g,' ').trim();
  const nodes=Array.from(document.querySelectorAll('*'));
  const selectors=['.result','.results_links','article','main a[href]','a.result__a'];
  const containers=[];
  for(const selector of selectors)for(const node of document.querySelectorAll(selector))if(!containers.includes(node))containers.push(node);
  const results=[];
  for(const node of containers.slice(0,limit*3)){
   const link=node.matches('a[href]')?node:node.querySelector('a.result__a[href],a[href]');
   if(!link)continue;
   const url=link.href||'';if(!/^https?:/i.test(url))continue;
   const title=clean(link.textContent||node.querySelector('h1,h2,h3')?.textContent);
   const snippet=clean(node.querySelector('.result__snippet,.result__body,p')?.textContent||node.textContent).slice(0,800);
   if(!title||results.some(x=>x.url===url))continue;
   results.push({title,url,snippet,classes:Array.from(node.classList||[]),query});
  }
  const texts=[];const classes=[];const attributes=[];
  for(const node of nodes.slice(0,8000)){
   const text=clean(node.textContent);if(text.length>=3&&text.length<=300)texts.push(text);
   for(const c of node.classList||[])if(c)classes.push(c);
   for(const attr of node.attributes||[])if(attr.name&&attr.value)attributes.push(`${attr.name}=${clean(attr.value).slice(0,160)}`);
  }
  return{results,texts,classes,attributes,nodeCount:nodes.length,url:location.href};
 },{limit,query});
}

function mergeResults(snapshots){
 const map=new Map();const text=[];const classes=[];const attributes=[];
 for(const snapshot of snapshots){
  text.push(...snapshot.texts);classes.push(...snapshot.classes);attributes.push(...snapshot.attributes);
  for(const result of snapshot.results){
   const key=canonicalUrl(result.url);const prior=map.get(key);
   if(prior){prior.queries.add(result.query);if(result.snippet.length>prior.snippet.length)prior.snippet=result.snippet;if(result.title.length>prior.title.length)prior.title=result.title;prior.classes=[...new Set([...prior.classes,...result.classes])];}
   else map.set(key,{...result,url:key,queries:new Set([result.query])});
  }
 }
 return{results:[...map.values()],commonText:frequencyMap(text,40),commonClasses:frequencyMap(classes,40),commonAttributes:frequencyMap(attributes,40)};
}

function chooseWinner(results,query){
 const queryTokens=new Set(tokens(query));const domainCounts=new Map();
 for(const r of results)domainCounts.set(domainOf(r.url),(domainCounts.get(domainOf(r.url))||0)+1);
 const commonText=results.flatMap(r=>tokens(`${r.title} ${r.snippet}`)).reduce((m,x)=>(m.set(x,(m.get(x)||0)+1),m),new Map());
 const classCounts=new Map();for(const r of results)for(const c of r.classes)classCounts.set(c,(classCounts.get(c)||0)+1);
 const ranked=results.map(r=>({...r,queries:[...r.queries],score:Number(rankResult(r,{queryTokens,commonText:[...commonText.entries()].map(([value,count])=>({value,count})),commonClasses:classCounts,domainCounts}).toFixed(4))})).sort((a,b)=>b.score-a.score||sourceQuality(b.url)-sourceQuality(a.url)||a.title.localeCompare(b.title));
 const top=ranked.slice(0,Math.min(5,ranked.length));
 const corroboration=top.length?top.filter((x,i)=>top.some((y,j)=>j!==i&&overlap(x.title+' '+x.snippet,y.title+' '+y.snippet)>=.45)).length/top.length:0;
 const winner=ranked[0]||null;
 return{winner,ranked,corroboration,domainAgreement:top.length?new Set(top.map(x=>domainOf(x.url))).size/top.length:0};
}

export async function chatresponse(query,{maxResults=DEFAULT_RESULTS,timeoutMs=DEFAULT_TIMEOUT}={}){
 const q=clean(query);if(!q)throw new Error('Search query is required');
 const browser=await browserPromise;const context=await browser.newContext({locale:'en-US'});const pages=await Promise.all(queryVariants(q).map(()=>context.newPage()));
 try{
  const variants=queryVariants(q);const settled=await Promise.allSettled(variants.map((variant,i)=>searchOne(pages[i],variant,Math.min(Math.max(Number(maxResults)||DEFAULT_RESULTS,4),MAX_RESULTS),timeoutMs)));
  const snapshots=settled.filter(x=>x.status==='fulfilled').map(x=>x.value);if(!snapshots.length)throw new Error('Search engine returned no inspectable DOM results');
  const merged=mergeResults(snapshots);const decision=chooseWinner(merged.results,q);
  const winner=decision.winner;
  const queryCoverage=snapshots.length/variants.length;
  const corroborated=clamp(decision.corroboration*.65+decision.domainAgreement*.35);
  const confidence=Number(clamp((winner?sourceQuality(winner.url):0)*.25+(winner?clamp(winner.score/100):0)*.45+queryCoverage*.1+corroborated*.2).toFixed(4));
  return{
   query:q,
   answer:winner?.title||'No sufficiently supported result found.',
   result:winner,
   results:decision.ranked.slice(0,Math.min(12,merged.results.length)),
   confidence,
   definite:confidence>=.9&&corroborated>=.55,
   evidence:{queryVariants:variants,successfulVariants:snapshots.length,corroboration:corroborated,domainAgreement:decision.domainAgreement,sourceQuality:winner?sourceQuality(winner.url):0},
   frequency:{commonText:merged.commonText,commonClasses:merged.commonClasses,commonAttributes:merged.commonAttributes},
   dom:{nodeListCount:snapshots.reduce((n,s)=>n+s.nodeCount,0),inspectedSelectors:['*','.result','.results_links','article','main a[href]','a.result__a'],pagesInspected:snapshots.length},
   method:'JavaScript search-engine query injection -> multi-query DOM inspection -> NodeList extraction -> frequency maps -> canonicalization -> corroboration -> authority/relevance/freshness ranking -> strongest supported result'
  };
 }finally{await Promise.all(pages.map(p=>p.close().catch(()=>{})));await context.close();}
}

export default chatresponse;
