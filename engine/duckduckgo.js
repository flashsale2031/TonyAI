const ENDPOINT='https://html.duckduckgo.com/html/';
const BING_ENDPOINT='https://www.bing.com/search';
const USER_AGENT='Mozilla/5.0 (compatible; TonyAI/1.1; +https://github.com/flashsale2031/TonyAI)';

function decodeHtml(value=''){
  return String(value)
    .replace(/<[^>]+>/g,' ')
    .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'")
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)))
    .replace(/\s+/g,' ').trim();
}

function absoluteUrl(value,base){try{const url=new URL(decodeHtml(value),base);const redirected=url.searchParams.get('uddg');return redirected?decodeURIComponent(redirected):url.toString();}catch{return '';}}

function extractDuckDuckGoResults(html,maxResults=8){
  const out=[];
  const blockRe=/<div[^>]+class="[^"]*result[^\"]*"[^>]*>([\s\S]*?)(?=<div[^>]+class="[^"]*result[^\"]*"|<div[^>]+class="results_links|$)/gi;
  let match;
  while((match=blockRe.exec(html))&&out.length<maxResults){
    const block=match[1];
    const link=block.match(/<a[^>]+class="[^"]*result__a[^\"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if(!link)continue;
    const snippet=block.match(/class="[^"]*result__snippet[^\"]*"[^>]*>([\s\S]*?)<\/a?>/i);
    const url=absoluteUrl(link[1],ENDPOINT);
    const title=decodeHtml(link[2]);
    if(!/^https?:\/\//i.test(url))continue;
    out.push({title,url,snippet:decodeHtml(snippet?.[1]||'')});
  }
  return out;
}

function extractBingResults(html,maxResults=8){
  const out=[];const blockRe=/<li[^>]+class=["'][^"']*b_algo[^"']*["'][^>]*>([\s\S]*?)(?=<li[^>]+class=["'][^"']*b_algo|<\/ol>|$)/gi;let match;
  while((match=blockRe.exec(html))&&out.length<maxResults){const block=match[1];const link=block.match(/<h2[^>]*>\s*<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);if(!link)continue;const snippet=block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);const url=absoluteUrl(link[1],BING_ENDPOINT);if(!/^https?:\/\//i.test(url))continue;out.push({title:decodeHtml(link[2]),url,snippet:decodeHtml(snippet?.[1]||'')});}
  return out;
}

async function fetchText(url,timeoutMs){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);try{const res=await fetch(url,{signal:controller.signal,headers:{'user-agent':USER_AGENT,accept:'text/html,application/xhtml+xml'}});if(!res.ok)throw new Error(`Search provider returned ${res.status}`);return await res.text();}finally{clearTimeout(timer);}}

export async function duckduckgoSearch(query,{maxResults=8,region='wt-wt',safeSearch='moderate',timeoutMs=10000}={}){
  const q=String(query||'').trim();
  if(!q)throw new Error('Search query is required');
  const limit=Math.min(Math.max(Number(maxResults)||8,1),12);
  const url=`${ENDPOINT}?q=${encodeURIComponent(q)}&kl=${encodeURIComponent(region)}&kp=${safeSearch==='off'?-2:1}`;
  try{const html=await fetchText(url,timeoutMs);const results=extractDuckDuckGoResults(html,limit);if(results.length)return {query:q,provider:'DuckDuckGo',results,source:'DuckDuckGo Search'};}catch{}
  const bingUrl=`${BING_ENDPOINT}?q=${encodeURIComponent(q)}&setlang=en-us&form=QBLH`;
  const html=await fetchText(bingUrl,timeoutMs);const results=extractBingResults(html,limit);
  if(!results.length)throw new Error('No results were returned by the configured search providers');
  return {query:q,provider:'Bing',results,source:'Bing Search'};
}

export {extractDuckDuckGoResults,extractBingResults};
