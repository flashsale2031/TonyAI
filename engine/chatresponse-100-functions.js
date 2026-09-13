import { chatresponse as baseChatresponse } from './chatresponse.js';

/*
 * TonyAI ChatResponse v3 search toolkit.
 *
 * This additive module keeps the existing Playwright search engine intact while
 * exposing 100 deterministic search-quality functions for query planning,
 * normalization, source scoring, evidence comparison, consensus, confidence,
 * diagnostics, and result shaping.
 *
 * No external neural model or search API is required by this module.
 */

const STOP_WORDS=new Set('a an the and or but if then else for to of in on at by with from into over under about as is are was were be been being this that these those it its they them their your you we our what which who whom where when why how can could should would may might must do does did have has had not no nor than too very more most some any all each every both either neither other another such only own same so just now today current latest new get give find search information answer facts sources official documentation'.split(/\s+/));
const TRUSTED=new Set(['wikipedia.org','developer.mozilla.org','docs.python.org','nodejs.org','developer.chrome.com','web.dev','ietf.org','w3.org','nasa.gov','nih.gov','who.int','un.org','github.com','developer.apple.com','learn.microsoft.com','support.google.com']);
const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
const lower=v=>clean(v).toLowerCase();

export function normalizeText(v){return clean(v).normalize('NFKC')}
export function normalizeWhitespace(v){return String(v??'').replace(/\s+/g,' ').trim()}
export function stripHtml(v){return clean(String(v??'').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' '))}
export function stripUrls(v){return clean(v).replace(/https?:\/\/\S+|www\.\S+/gi,'')}
export function stripPunctuation(v){return clean(v).replace(/[^\p{L}\p{N}\s]/gu,' ')}
export function toLower(v){return lower(v)}
export function safeNumber(v,fallback=0){const n=Number(v);return Number.isFinite(n)?n:fallback}
export function clamp(n,min=0,max=1){return Math.max(min,Math.min(max,safeNumber(n,min)))}
export function unique(values=[]){return [...new Set(values)]}
export function chunk(values=[],size=10){const n=Math.max(1,size),out=[];for(let i=0;i<values.length;i+=n)out.push(values.slice(i,i+n));return out}
export function tokens(v){return unique((lower(v).match(/[\p{L}\p{N}][\p{L}\p{N}._:/-]{1,}/gu)||[]).filter(x=>x.length>1))}
export function tokenSet(v){return new Set(tokens(v))}
export function wordCount(v){return tokens(v).length}
export function charCount(v){return String(v??'').length}
export function sentenceCount(v){return sentences(v).length}
export function sentences(v){return clean(v).split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map(clean).filter(Boolean)}
export function paragraphs(v){return String(v??'').split(/\n\s*\n/).map(clean).filter(Boolean)}
export function ngrams(v,n=2){const t=tokens(v),out=[];for(let i=0;i<=t.length-n;i++)out.push(t.slice(i,i+n).join(' '));return unique(out)}
export function bigrams(v){return ngrams(v,2)}
export function trigrams(v){return ngrams(v,3)}
export function stopWordSet(){return new Set(STOP_WORDS)}
export function removeStopWords(v){return tokens(v).filter(t=>!STOP_WORDS.has(t))}
export function importantTokens(v){return removeStopWords(v).filter(t=>t.length>=3).sort((a,b)=>b.length-a.length)}
export function keywordDensity(v,keyword){const t=tokens(v),k=tokens(keyword);if(!t.length||!k.length)return 0;const s=new Set(k);return t.filter(x=>s.has(x)).length/t.length}
export function queryFingerprint(v){return importantTokens(v).sort().join('|')}
export function queryLanguage(v){const s=clean(v);if(/[\u4e00-\u9fff]/.test(s))return 'zh';if(/[\u3040-\u30ff]/.test(s))return 'ja';if(/[\uac00-\ud7af]/.test(s))return 'ko';if(/[\u0400-\u04ff]/.test(s))return 'ru';if(/[\u0600-\u06ff]/.test(s))return 'ar';return 'en'}
export function queryIntent(v){const s=lower(v);if(/\b(how|steps|guide|tutorial)\b/.test(s))return 'how-to';if(/\b(why|reason|cause)\b/.test(s))return 'explanation';if(/\b(compare|versus|vs\.?|difference)\b/.test(s))return 'comparison';if(/\b(best|top|recommend)\b/.test(s))return 'recommendation';if(/\?$/.test(s)||/^(what|who|when|where|which)\b/.test(s))return 'question';return 'lookup'}
export function queryType(v){return queryIntent(v)}
export function questionTerms(v){return tokens(v).filter(x=>['what','who','when','where','which','why','how','is','are','can','does'].includes(x))}
export function quotedTerms(v){return (String(v??'').match(/"[^"]+"/g)||[]).map(x=>x.slice(1,-1))}
export function querySpellingVariants(v){const q=clean(v),m=new Map([['colour','color'],['favourite','favorite'],['optimise','optimize'],['organisation','organization'],['centre','center']]);let a=[q];for(const [x,y] of m){if(lower(q).includes(x))a.push(q.replace(new RegExp(x,'ig'),y));if(lower(q).includes(y))a.push(q.replace(new RegExp(y,'ig'),x))}return unique(a)}
export function querySynonyms(v){const map={car:['automobile','vehicle'],usa:['united states','us'],ai:['artificial intelligence'],phone:['smartphone','mobile'],js:['javascript'],docs:['documentation']};return unique([clean(v),...tokens(v).flatMap(t=>map[t]||[])])}
export function queryOperators(v){const q=clean(v);return unique([q,`"${q}"`,`${q} official`,`${q} site:gov`,`${q} documentation`])}
export function queryFreshnessVariants(v){const q=clean(v);return [`${q} latest`,`${q} 2026`,`${q} recent`,`${q} current`]}
export function queryOfficialVariants(v){const q=clean(v);return [`${q} official`,`${q} official source`,`${q} primary source`,`${q} government`]}
export function queryDocsVariants(v){const q=clean(v);return [`${q} documentation`,`${q} reference`,`${q} specification`,`${q} manual`]}
export function queryEvidenceVariants(v){const q=clean(v);return [`${q} facts`,`${q} evidence`,`${q} sources`,`${q} verified`]}
export function queryQuestionVariants(v){const q=clean(v);return [`what is ${q}`,`how does ${q} work`,`${q} explained`,`${q} facts`]}
export function queryExpansion(v){return unique([clean(v),...querySpellingVariants(v),...querySynonyms(v),...queryOperators(v),...queryOfficialVariants(v),...queryDocsVariants(v),...queryEvidenceVariants(v)]).slice(0,20)}
export function queryPlan(v){return {query:clean(v),language:queryLanguage(v),intent:queryIntent(v),fingerprint:queryFingerprint(v),variants:queryExpansion(v)}}

export function canonicalUrl(raw){try{const u=new URL(raw);u.hash='';u.protocol='https:';u.hostname=u.hostname.toLowerCase();for(const k of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid','msclkid'])u.searchParams.delete(k);if(u.pathname.length>1)u.pathname=u.pathname.replace(/\/+$/,'');return u.toString()}catch{return clean(raw)}}
export function domainOf(url){try{return new URL(url).hostname.replace(/^www\./,'').toLowerCase()}catch{return ''}}
export function rootDomain(url){const d=domainOf(url),p=d.split('.');return p.length>2?p.slice(-2).join('.'):d}
export function pathOf(url){try{return new URL(url).pathname}catch{return ''}}
export function isHttps(url){try{return new URL(url).protocol==='https:'}catch{return false}}
export function isIpHost(url){return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(domainOf(url))}
export function isTrustedDomain(url){return TRUSTED.has(rootDomain(url))||TRUSTED.has(domainOf(url))}
export function sourceType(url){const d=domainOf(url);if(/\.gov(?:\.|$)|\.edu(?:\.|$)|\.ac\.uk$/.test(d))return 'institutional';if(/docs?|developer|reference|spec|standards/.test(pathOf(url)))return 'documentation';if(/reuters|apnews|bbc|nytimes|npr/.test(d))return 'news';if(/reddit|quora|medium|substack/.test(d))return 'community';return 'web'}
export function sourceQuality(url){const d=domainOf(url);if(!d)return .1;if(isTrustedDomain(url))return 1;if(/\.gov(?:\.|$)|\.gov\.uk$|\.gc\.ca$/.test(d))return 1;if(/\.edu(?:\.|$)|\.ac\.uk$/.test(d))return .96;if(/docs?|developer|reference|spec|standards/.test(d))return .9;if(/reuters|apnews|bbc|nytimes|nature|science|arxiv|npr/.test(d))return .86;if(/reddit|quora|medium|substack/.test(d))return .5;return .66}
export function authorityScore(source){const q=typeof source==='string'?sourceQuality(source):safeNumber(source?.quality,.5);return clamp(q)}
export function titleScore(title,query){return termCoverage(title,query)*.75+phraseMatch(title,query)*.25}
export function snippetScore(snippet,query){return termCoverage(snippet,query)*.8+phraseMatch(snippet,query)*.2}
export function urlScore(url,query){return termCoverage(`${domainOf(url)} ${pathOf(url)}`,query)}
export function headingScore(headings,query){return termCoverage(Array.isArray(headings)?headings.join(' '):headings,query)}
export function metadataScore(meta,query){return termCoverage(JSON.stringify(meta??''),query)}
export function freshnessScore(text){const y=extractYears(text);if(!y.length)return .5;const age=Math.max(0,new Date().getUTCFullYear()-Math.max(...y));return age===0?1:age===1?.93:age===2?.86:age<=5?.7:age<=10?.5:.3}
export function relevanceScore(source,query){return clamp(titleScore(source?.title||'',query)*.35+snippetScore(source?.snippet||'',query)*.25+urlScore(source?.url||'',query)*.1+headingScore(source?.headings||[],query)*.15+freshnessScore(`${source?.published||''} ${source?.text||''}`)*.15)}
export function spamScore(source){const text=lower(JSON.stringify(source??''));let s=0;if(/casino|viagra|payday|click here|buy now/.test(text))s+=.35;if((text.match(/https?:/g)||[]).length>30)s+=.25;if(wordCount(text)>0&&unique(tokens(text)).length/wordCount(text)<.12)s+=.25;return clamp(s)}
export function boilerplateScore(text){const p=paragraphs(text);if(p.length<2)return 0;const repeats=p.length-unique(p.map(x=>x.slice(0,120))).length;return clamp(repeats/Math.max(1,p.length))}
export function contentDensity(text){const s=stripHtml(text);return clamp(wordCount(s)/Math.max(1,charCount(s)/6)/100)}

export function phraseMatch(a,b){const x=lower(a),y=lower(b);if(!x||!y)return 0;if(x.includes(y)||y.includes(x))return 1;return jaccard(x,y)}
export function termCoverage(text,query){const q=importantTokens(query),t=tokenSet(text);if(!q.length)return 0;let n=0;for(const x of q)if(t.has(x))n++;return n/q.length}
export function jaccard(a,b){const A=tokenSet(a),B=tokenSet(b);if(!A.size&&!B.size)return 1;let i=0;for(const x of A)if(B.has(x))i++;return i/Math.max(1,new Set([...A,...B]).size)}
export function dice(a,b){const A=tokenSet(a),B=tokenSet(b);let i=0;for(const x of A)if(B.has(x))i++;return 2*i/Math.max(1,A.size+B.size)}
export function cosineLike(a,b){const A=tokenSet(a),B=tokenSet(b);let i=0;for(const x of A)if(B.has(x))i++;return i/Math.sqrt(Math.max(1,A.size*B.size))}
export function numericSignature(v){return (lower(v).match(/\b\d[\d,.]*(?:%|[a-z]+)?\b/g)||[]).join('|')}
export function dateSignature(v){return (lower(v).match(/\b(?:19|20)\d{2}[-/]\d{1,2}(?:[-/]\d{1,2})?\b/g)||[]).join('|')}
export function extractYears(v){return unique((String(v??'').match(/\b(19\d{2}|20\d{2})\b/g)||[]).map(Number))}
export function extractNumbers(v){return (String(v??'').match(/[-+]?\d[\d,.]*(?:%|[a-z]+)?/gi)||[])}
export function extractEmails(v){return (String(v??'').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)||[]).map(lower)}

export function sentenceFacts(text,query){return sentences(text).map(sentence=>({sentence,coverage:termCoverage(sentence,query),numeric:numericSignature(sentence),date:dateSignature(sentence)})).filter(x=>x.coverage>0).sort((a,b)=>b.coverage-a.coverage)}
export function factKey(v){return stripPunctuation(lower(v)).replace(/\b\d[\d,.%+-]*\b/g,'#').replace(/\s+/g,' ').trim()}
export function factSimilarity(a,b){return jaccard(factKey(a),factKey(b))}
export function factAgreement(facts=[]){if(!facts.length)return 0;const keys=unique(facts.map(f=>factKey(f.sentence||f)));return clamp((facts.length-keys.length)/Math.max(1,facts.length-1))}
export function exactAgreement(a,b){return factKey(a)===factKey(b)?1:0}
export function semanticAgreement(a,b){return factSimilarity(a,b)}
export function numericAgreement(a,b){const x=numericSignature(a),y=numericSignature(b);return !x&&!y?1:x===y?1:0}
export function temporalAgreement(a,b){const x=dateSignature(a),y=dateSignature(b);return !x&&!y?1:x===y?1:0}
export function contradictionScore(a,b){const sim=factSimilarity(a,b);if(sim<.45)return 0;const n=numericAgreement(a,b),d=temporalAgreement(a,b);return clamp(sim*(1-n*.7-d*.3))}
export function consensusScore(items=[]){if(!items.length)return 0;const domains=domainDiversity(items),agree=items.length>1?factAgreement(items.map(x=>x.sentence||x)):1;return clamp(.55*clamp(domains/3)+.45*agree)}

export function domainDiversity(items=[]){return new Set(items.map(x=>domainOf(x.url||x)).filter(Boolean)).size}
export function sourceDiversity(items=[]){return domainDiversity(items)}
export function crowdingPenalty(items=[]){const counts=new Map();for(const x of items){const d=rootDomain(x.url||x);counts.set(d,(counts.get(d)||0)+1)}let p=0;for(const n of counts.values())if(n>2)p+=(n-2)/Math.max(1,items.length);return clamp(p)}
export function independenceScore(items=[]){return clamp(domainDiversity(items)/4)}
export function evidenceScore(source,query){return clamp(relevanceScore(source,query)*.55+sourceQuality(source?.url||'')*.25+freshnessScore(source?.published||source?.text||'')*.1+(1-spamScore(source))*.1)}
export function confidenceScore(evidence={}){return Number(clamp(evidence.score??evidence.confidence??0).toFixed(4))}
export function confidenceLabel(score){const s=safeNumber(score);return s>=.86?'very-high':s>=.72?'high':s>=.5?'medium':s>=.3?'low':'very-low'}
export function definiteGate({confidence=0,domains=0,contradictions=0,agreement=0}={}){return safeNumber(confidence)>=.86&&domains>=2&&contradictions===0&&safeNumber(agreement)>=.72}
export function answerFromEvidence(items=[],query=''){const ranked=[...items].map(x=>({...x,_score:evidenceScore(x,query)})).sort((a,b)=>b._score-a._score);return ranked[0]?.facts?.[0]?.sentence||ranked[0]?.snippet||ranked[0]?.title||''}
export function safeAnswer(answer,fallback='No sufficiently supported result found.'){const s=clean(answer);return s||fallback}

export function dedupeByUrl(items=[]){const m=new Map();for(const x of items){const k=canonicalUrl(x.url||'');if(k&&!m.has(k))m.set(k,x)}return [...m.values()]}
export function dedupeByFact(items=[]){const m=new Map();for(const x of items){const k=factKey(x.sentence||x.title||'');if(k&&!m.has(k))m.set(k,x)}return [...m.values()]}
export function sortByScore(items=[],score=(x)=>x.score??0){return [...items].sort((a,b)=>safeNumber(score(b))-safeNumber(score(a)))}
export function topK(items=[],k=5){return items.slice(0,Math.max(0,k))}
export function mergeSources(items=[]){const domains=new Map();for(const x of items){const d=rootDomain(x.url||'');if(!d)continue;const old=domains.get(d)||{domain:d,sources:[],facts:[]};old.sources.push(x);if(x.facts)old.facts.push(...x.facts);domains.set(d,old)}return [...domains.values()]}
export function summarizeEvidence(items=[],query=''){const ranked=sortByScore(items,x=>evidenceScore(x,query));return ranked.slice(0,5).map(x=>({title:x.title,url:canonicalUrl(x.url||''),domain:domainOf(x.url||''),score:Number(evidenceScore(x,query).toFixed(4)),fact:x.facts?.[0]?.sentence||x.snippet||''}))}
export function buildDiagnostics(items=[],query=''){return{query:clean(query),results:items.length,domains:domainDiversity(items),independence:independenceScore(items),crowding:crowdingPenalty(items),topEvidence:summarizeEvidence(items,query)}}
export function performanceStats(started=Date.now(),extra={}){return{elapsedMs:Math.max(0,Date.now()-safeNumber(started,Date.now())),...extra}}
export function methodLabel(){return 'tonyai-chatresponse-v3-100-function-search-toolkit'}
export function createSearchToolkit(){return Object.freeze({normalizeText,normalizeWhitespace,stripHtml,stripUrls,stripPunctuation,toLower,safeNumber,clamp,unique,chunk,tokens,tokenSet,wordCount,charCount,sentenceCount,sentences,paragraphs,ngrams,bigrams,trigrams,stopWordSet,removeStopWords,importantTokens,keywordDensity,queryFingerprint,queryLanguage,queryIntent,queryType,questionTerms,quotedTerms,querySpellingVariants,querySynonyms,queryOperators,queryFreshnessVariants,queryOfficialVariants,queryDocsVariants,queryEvidenceVariants,queryQuestionVariants,queryExpansion,queryPlan,canonicalUrl,domainOf,rootDomain,pathOf,isHttps,isIpHost,isTrustedDomain,sourceType,sourceQuality,authorityScore,titleScore,snippetScore,urlScore,headingScore,metadataScore,freshnessScore,relevanceScore,spamScore,boilerplateScore,contentDensity,phraseMatch,termCoverage,jaccard,dice,cosineLike,numericSignature,dateSignature,extractYears,extractNumbers,extractEmails,sentenceFacts,factKey,factSimilarity,factAgreement,exactAgreement,semanticAgreement,numericAgreement,temporalAgreement,contradictionScore,consensusScore,domainDiversity,sourceDiversity,crowdingPenalty,independenceScore,evidenceScore,confidenceScore,confidenceLabel,definiteGate,answerFromEvidence,safeAnswer,dedupeByUrl,dedupeByFact,sortByScore,topK,mergeSources,summarizeEvidence,buildDiagnostics,performanceStats,methodLabel})}
export async function chatresponse(query,options={}){const result=await baseChatresponse(query,options);return{...result,searchToolkit:createSearchToolkit(),toolkitFunctionCount:100,toolkitMethod:methodLabel()}}
export const toolkit=createSearchToolkit();
export default chatresponse;
