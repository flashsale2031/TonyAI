const ENDPOINT='https://html.duckduckgo.com/html/';

function decodeHtml(value=''){
  return String(value)
    .replace(/<[^>]+>/g,' ')
    .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'")
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/\s+/g,' ').trim();
}

function extractResults(html, maxResults=8){
  const out=[];
  const blockRe=/<div[^>]+class="[^"]*result[^\"]*"[^>]*>([\s\S]*?)(?=<div[^>]+class="[^"]*result[^\"]*"|<div[^>]+class="results_links|$)/gi;
  let match;
  while((match=blockRe.exec(html))&&out.length<maxResults){
    const block=match[1];
    const link=block.match(/<a[^>]+class="[^"]*result__a[^\"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if(!link)continue;
    const snippet=block.match(/class="[^"]*result__snippet[^\"]*"[^>]*>([\s\S]*?)<\/a?>/i);
    const url=decodeHtml(link[1]);
    const title=decodeHtml(link[2]);
    if(!/^https?:\/\//i.test(url))continue;
    out.push({title,url,snippet:decodeHtml(snippet?.[1]||'')});
  }
  return out;
}

export async function duckduckgoSearch(query,{maxResults=8,region='wt-wt',safeSearch='moderate'}={}){
  const q=String(query||'').trim();
  if(!q)throw new Error('Search query is required');
  const url=`${ENDPOINT}?q=${encodeURIComponent(q)}&kl=${encodeURIComponent(region)}&kp=${safeSearch==='off'?-2:1}`;
  const res=await fetch(url,{headers:{'user-agent':'TONYAI/1.0 (DuckDuckGo online answer integration)','accept':'text/html'}});
  if(!res.ok)throw new Error(`DuckDuckGo search failed (${res.status})`);
  const html=await res.text();
  const results=extractResults(html,Math.min(Math.max(Number(maxResults)||8,1),12));
  return {query:q,provider:'DuckDuckGo',results,source:'DuckDuckGo Search'};
}
