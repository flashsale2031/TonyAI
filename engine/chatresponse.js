import { chromium } from 'playwright';

/*
 * TonyAI ChatResponse v2: single-file evidence search and verification engine.
 *
 * Uses only Playwright (already present in TonyAI). The pipeline is deliberately
 * self-contained: query planning -> multi-query discovery -> DOM extraction ->
 * canonicalization -> source-page verification -> structured-data extraction ->
 * evidence sentence extraction -> independent-source consensus -> contradiction
 * detection -> authority/relevance/freshness scoring -> calibrated confidence.
 *
 * "Definite" is never treated as magical certainty. It means the available live
 * evidence crosses a strict agreement threshold. Search engines and websites
 * can be incomplete, stale, wrong, or unavailable.
 */
const SEARCH_URL='https://html.duckduckgo.com/html/';
const DEFAULT_RESULTS=10,MAX_RESULTS=12,MAX_VARIANTS=4,DEFAULT_TIMEOUT=1800;
const VERIFY_LIMIT=5,MAX_SOURCE_TEXT=24000,MAX_SENTENCES=160;
const STOP_WORDS=new Set('a an the and or but if then else for to of in on at by with from into over under about as is are was were be been being this that these those it its they them their your you we our what which who whom where when why how can could should would may might must do does did have has had not no nor than too very more most some any all each every both either neither other another such only own same so just now today current latest new get give find search information answer facts sources official documentation'.split(/\s+/));
const TRUSTED_DOMAINS=new Set(['wikipedia.org','developer.mozilla.org','docs.python.org','nodejs.org','developer.chrome.com','web.dev','ietf.org','w3.org','nasa.gov','nih.gov','who.int','un.org','github.com','developer.apple.com','learn.microsoft.com','support.google.com']);
const TRUSTED_SUFFIXES=new Map([['.gov',1],['.edu',.96],['.ac.uk',.96],['.int',.98],['.gov.uk',.99],['.gc.ca',.99]]);
const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
const lower=v=>clean(v).toLowerCase();
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
const tokens=text=>[...new Set((lower(text).match(/[a-z0-9][a-z0-9._:/-]{1,}/g)||[]).filter(x=>x.length>1&&!STOP_WORDS.has(x)))];
const wordSet=text=>new Set(tokens(text));
function canonicalUrl(raw){try{const u=new URL(raw);u.hash='';u.protocol='https:';u.hostname=u.hostname.toLowerCase();for(const k of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid','msclkid'])u.searchParams.delete(k);if(u.pathname.length>1)u.pathname=u.pathname.replace(/\/+$/,'');return u.toString()}catch{return clean(raw)}}
function domainOf(url){try{return new URL(url).hostname.replace(/^www\./,'').toLowerCase()}catch{return ''}}
function sourceQuality(url){const d=domainOf(url);if(!d)return .1;if(TRUSTED_DOMAINS.has(d))return 1;for(const [s,v] of TRUSTED_SUFFIXES)if(d.endsWith(s))return v;if(/(^|\.)(docs?|developer|developers|support|help|reference|spec|standards|manual)\./i.test(d))return .9;if(/(^|\.)(reuters|apnews|bbc|nytimes|nature|science|arxiv|npr)\./i.test(d))return .86;if(/(^|\.)(reddit|quora|medium|substack)\./i.test(d))return .5;return .66}
function frequency(values,limit=40){const m=new Map();for(const v of values){const k=clean(v);if(k&&k.length<=320)m.set(k,(m.get(k)||0)+1)}return [...m.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,limit).map(([value,count])=>({value,count}))}
function overlap(a,b){const A=wordSet(a),B=wordSet(b);if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.max(1,Math.min(A.size,B.size))}
function queryVariants(query){const q=clean(query);const quoted=(q.match(/"[^"]+"/g)||[]).join(' ');const words=tokens(q);const variants=[q,quoted||q,`${q} official source`,`${q} facts evidence`];if(words.length>=2){variants.push(`${words.slice(0,8).join(' ')} official`,`${words.slice(0,8).join(' ')} documentation`)}return [...new Set(variants.map(clean).filter(Boolean))].slice(0,MAX_VARIANTS)}
function dateScore(text){const years=[...(lower(text).matchAll(/\b(19\d{2}|20\d{2})\b/g))].map(x=>Number(x[1])).filter(y=>y>=1900&&y<=new Date().getUTCFullYear()+1);if(!years.length)return .5;const age=Math.max(0,new Date().getUTCFullYear()-Math.max(...years));return age===0?1:age===1?.93:age===2?.86:age<=5?.7:age<=10?.5:.3}
function sentenceSplit(text){return clean(text).split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map(clean).filter(s=>s.length>=35&&s.length<=700).slice(0,MAX_SENTENCES)}
function evidenceSentences(text,query){const qt=new Set(tokens(query));return sentenceSplit(text).map(sentence=>{const st=wordSet(sentence);let hit=0;for(const t of qt)if(st.has(t))hit++;return{sentence,coverage:qt.size?hit/qt.size:0,quality:clamp(sentence.length/260)}}).filter(x=>x.coverage>0).sort((a,b)=>b.coverage*2+b.quality-a.coverage*2-a.quality).slice(0,20)}
function normalizeFact(s){return lower(s).replace(/https?:\/\/\S+/g,'').replace(/\b\d[\d,.%+-]*\b/g,'#').replace(/[^a-z0-9# ]/g,' ').replace(/\s+/g,' ').trim()}
function numericSignature(s){return [...lower(s).matchAll(/\b\d[\d,.]*(?:%|[a-z]+)?\b/g)].map(x=>x[0]).join('|')}
function extractDate(meta){for(const x of meta){if(/date(published|modified)|article:published_time|pubdate/i.test(x.key)&&x.value)return x.value}return ''}
function rankDiscovery(r,query){const qt=new Set(tokens(query)),rt=wordSet(`${r.title} ${r.snippet}`);let hit=0;for(const t of qt)if(rt.has(t))hit++;const lexical=qt.size?hit/qt.size:0;return lexical*48+sourceQuality(r.url)*22+dateScore(`${r.title} ${r.snippet}`)*8+clamp(r.snippet.length/220)*8+clamp(r.title.length/100)*4+r.queries.length*3}

async function searchOne(page,query,limit,timeoutMs){
 await page.goto(SEARCH_URL,{waitUntil:'domcontentloaded',timeout:timeoutMs});
 const input=page.locator('input[name="q"]').first();await input.fill(query);await input.press('Enter');
 await page.waitForLoadState('domcontentloaded',{timeout:Math.max(200,timeoutMs-150)}).catch(()=>{});
 return page.evaluate(({limit,query})=>{
  const clean=x=>String(x??'').replace(/\s+/g,' ').trim(), containers=[];
  for(const selector of ['.result','.results_links','article','main a[href]','a.result__a'])for(const node of document.querySelectorAll(selector))if(!containers.includes(node))containers.push(node);
  const results=[];
  for(const node of containers.slice(0,limit*3)){
   const link=node.matches('a[href]')?node:node.querySelector('a.result__a[href],a[href]');if(!link||!/^https?:/i.test(link.href||''))continue;
   const title=clean(link.textContent||node.querySelector('h1,h2,h3')?.textContent),snippet=clean(node.querySelector('.result__snippet,.result__body,p')?.textContent||node.textContent).slice(0,900);if(!title)continue;
   if(results.some(x=>x.url===link.href))continue;results.push({title,url:link.href,snippet,classes:[...(node.classList||[])],query});
  }
  return{results,nodeCount:document.querySelectorAll('*').length,url:location.href};
 },{limit,query});
}
function mergeDiscovery(snaps){const map=new Map();for(const s of snaps)for(const r of s.results){const key=canonicalUrl(r.url),old=map.get(key);if(!old)map.set(key,{...r,url:key,queries:new Set([r.query])});else{old.queries.add(r.query);if(r.title.length>old.title.length)old.title=r.title;if(r.snippet.length>old.snippet.length)old.snippet=r.snippet;old.classes=[...new Set([...old.classes,...r.classes])]}}return[...map.values()].map(r=>({...r,queries:[...r.queries]}))}

async function inspectSource(page,result,query,timeoutMs){
 try{
  await page.goto(result.url,{waitUntil:'domcontentloaded',timeout:Math.max(700,timeoutMs)});
  const data=await page.evaluate(({maxText})=>{
   const clean=x=>String(x??'').replace(/\s+/g,' ').trim(),text=node=>clean(node?.innerText||node?.textContent||'');
   const meta=[];for(const n of document.querySelectorAll('meta[name],meta[property],link[rel="canonical"]')){const key=n.getAttribute('name')||n.getAttribute('property')||n.getAttribute('rel')||'';const value=n.getAttribute('content')||n.getAttribute('href')||'';if(key&&value)meta.push({key,value:clean(value).slice(0,500)})}
   const jsonld=[];for(const n of document.querySelectorAll('script[type="application/ld+json"]')){try{jsonld.push(JSON.parse(n.textContent))}catch{}}
   const roots=[...document.querySelectorAll('article,main,[role="main"],[itemprop="articleBody"]')];const root=roots.sort((a,b)=>text(b).length-text(a).length)[0]||document.body;let body=text(root).slice(0,maxText);
   if(body.length<800)body=text(document.body).slice(0,maxText);
   const headings=[...document.querySelectorAll('h1,h2,h3')].map(text).filter(Boolean).slice(0,40);
   const canonical=document.querySelector('link[rel="canonical"]')?.href||location.href;
   return{title:clean(document.title),description:meta.find(x=>/description/i.test(x.key))?.value||'',meta,jsonld,body,headings,canonical,url:location.href};
  },{maxText:MAX_SOURCE_TEXT});
  const structured=JSON.stringify(data.jsonld||[]).slice(0,12000);const metadata=[...data.meta,{key:'jsonld',value:structured}];
  const facts=evidenceSentences(`${data.title} ${data.description} ${data.headings.join('. ')} ${data.body}`,query);
  const published=extractDate(metadata);
  return{...result,source:{title:data.title,description:data.description,canonical:canonicalUrl(data.canonical||result.url),finalUrl:canonicalUrl(data.url||result.url),headings:data.headings,meta:metadata.slice(0,80),published,bodyLength:data.body.length},facts,verified:true};
 }catch(error){return{...result,verified:false,source:{error:clean(error?.message||error)},facts:[]}}
}
function independentDomainCount(items){return new Set(items.map(x=>domainOf(x.url)).filter(Boolean)).size}
function consensus(items,query){const groups=new Map();for(const item of items)for(const fact of item.facts){const key=normalizeFact(fact.sentence);if(key.length<30)continue;const g=groups.get(key)||{sentence:fact.sentence,domains:new Set(),sources:[],coverage:0,numbers:new Set()};g.domains.add(domainOf(item.url));g.sources.push(item.url);g.coverage=Math.max(g.coverage,fact.coverage);const sig=numericSignature(fact.sentence);if(sig)g.numbers.add(sig);groups.set(key,g)}return[...groups.values()].map(g=>({...g,domainCount:g.domains.size,sourceCount:g.sources.length,agreement:clamp(g.domainCount/3)*.7+clamp(g.sourceCount/4)*.3})).sort((a,b)=>b.agreement*2+b.coverage-a.agreement*2-a.coverage).slice(0,12)}
function contradictions(items,query){const facts=items.flatMap(i=>i.facts.map(f=>({...f,url:i.url,domain:domainOf(i.url),numbers:numericSignature(f.sentence)}))).filter(f=>f.numbers);const out=[];for(let i=0;i<facts.length;i++)for(let j=i+1;j<facts.length;j++){if(facts[i].domain===facts[j].domain||facts[i].numbers===facts[j].numbers)continue;const o=overlap(facts[i].sentence,facts[j].sentence);if(o>=.5)out.push({a:facts[i].sentence,b:facts[j].sentence,similarity:o,domains:[facts[i].domain,facts[j].domain]})}return out.slice(0,10)}
function finalRanking(items,query){const consensusFacts=consensus(items,query),topConsensus=consensusFacts[0],contradictionsFound=contradictions(items,query);return{consensusFacts,contradictionsFound,topConsensus}}

export async function chatresponse(query,{maxResults=DEFAULT_RESULTS,timeoutMs=DEFAULT_TIMEOUT,verify=true}={}){
 const started=Date.now(),q=clean(query);if(!q)throw new Error('Search query is required');
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({locale:'en-US',javaScriptEnabled:true});context.setDefaultTimeout(Math.max(500,timeoutMs));context.setDefaultNavigationTimeout(Math.max(700,timeoutMs));
 const variants=queryVariants(q),pages=await Promise.all(variants.map(()=>context.newPage()));
 try{
  const discovery=await Promise.allSettled(variants.map((v,i)=>searchOne(pages[i],v,Math.min(Math.max(Number(maxResults)||DEFAULT_RESULTS,4),MAX_RESULTS),timeoutMs)));
  const snaps=discovery.filter(x=>x.status==='fulfilled').map(x=>x.value);if(!snaps.length)throw new Error('Search engine returned no inspectable DOM results');
  let results=mergeDiscovery(snaps).sort((a,b)=>rankDiscovery(b,q)-rankDiscovery(a,q));
  const initial=results.slice(0,Math.min(VERIFY_LIMIT,results.length));
  let verified=[];
  if(verify&&initial.length){const sourcePages=await Promise.all(initial.map(()=>context.newPage()));try{const settled=await Promise.allSettled(initial.map((r,i)=>inspectSource(sourcePages[i],r,q,timeoutMs)));verified=settled.filter(x=>x.status==='fulfilled').map(x=>x.value)}finally{await Promise.all(sourcePages.map(p=>p.close().catch(()=>{})))}}
  const successful=verified.filter(x=>x.verified),final=finalRanking(successful,q),domains=independentDomainCount(successful);
  const best=final.topConsensus;
  const winner=successful.sort((a,b)=>{const af=a.facts.reduce((n,f)=>n+f.coverage,0),bf=b.facts.reduce((n,f)=>n+f.coverage,0);return sourceQuality(b.url)*30+bf*35+dateScore(`${b.title} ${b.source?.published||''}`)*10-(sourceQuality(a.url)*30+af*35+dateScore(`${a.title} ${a.source?.published||''}`)*10)})[0]||results[0]||null;
  const sourceAgreement=best?best.agreement:0,coverage=clamp(snaps.length/variants.length),verification=initial.length?successful.length/initial.length:0,independence=clamp(domains/4),contradictionPenalty=clamp(final.contradictionsFound.length/4)*.35;
  const evidenceStrength=clamp(sourceAgreement*.38+verification*.18+independence*.16+coverage*.08+(winner?sourceQuality(winner.url):0)*.12+dateScore(`${winner?.title||''} ${winner?.source?.published||''}`)*.08-contradictionPenalty);
  const confidence=Number(evidenceStrength.toFixed(4));
  const answer=best?.sentence||winner?.source?.description||winner?.snippet||winner?.title||'No sufficiently supported result found.';
  const definite=Boolean(best&&best.domainCount>=2&&sourceAgreement>=.72&&final.contradictionsFound.length===0&&confidence>=.86);
  return{
   query:q,answer,result:winner,results:results.slice(0,Math.min(12,results.length)),verifiedSources:successful,
   confidence,definite,
   evidence:{queryVariants:variants,successfulVariants:snaps.length,verifiedSources:successful.length,independentDomains:domains,consensus:sourceAgreement,topConsensus:best?.sentence||'',contradictions:final.contradictionsFound,sourceQuality:winner?sourceQuality(winner.url):0},
   method:'multi-query browser search -> live DOM extraction -> canonical URL clustering -> direct source-page verification -> article/main-body extraction -> metadata/JSON-LD inspection -> query-matched evidence sentences -> independent-domain consensus -> numeric conflict detection -> authority/relevance/freshness ranking',
   dom:{pagesInspected:snaps.length+successful.length,nodeListCount:snaps.reduce((n,s)=>n+s.nodeCount,0),verifiedNodeSources:successful.length},
   performance:{elapsedMs:Date.now()-started,discoveryPages:variants.length,verificationPages:initial.length},
   limitations:['No search engine can guarantee universal truth.','A high confidence score means the retrieved evidence agrees; it is not a mathematical proof.','Sources blocked by robots, authentication, paywalls, network errors, or anti-bot systems may not be verifiable.']
  };
 }finally{await Promise.all(pages.map(p=>p.close().catch(()=>{})));await context.close();await browser.close().catch(()=>{})}
}
export default chatresponse;
