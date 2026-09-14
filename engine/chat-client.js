(() => {
  const form=document.getElementById('composer'),input=document.getElementById('messageInput'),send=document.getElementById('sendButton'),messages=document.getElementById('messages'),empty=document.getElementById('emptyState');
  if(!form||!input||!send||!messages)return;
  if(window.__TonyAIWebOnlyInstalled)return;
  window.__TonyAIWebOnlyInstalled=true;
  const history=[];const cache=new Map();let requestId=0;
  const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
  const esc=s=>clean(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const scroll=()=>requestAnimationFrame(()=>{const area=document.getElementById('chatArea');if(area)area.scrollTop=area.scrollHeight});
  const add=(html,role)=>{if(empty)empty.style.display='none';messages.classList.add('has-messages');const item=document.createElement('article');item.className='message '+role;const bubble=document.createElement('div');bubble.className='message-bubble';bubble.innerHTML=html;item.appendChild(bubble);messages.appendChild(item);scroll();return bubble};
  const status=t=>`<div style="color:#6b6b6b;font-size:.86rem">${esc(t)}</div>`;
  const noAnswer=(detail='')=>`${status('No verified web answer was found.')}${detail?`<div style="color:#777;font-size:.8rem;margin-top:5px">${esc(detail)}</div>`:''}`;
  const domain=url=>{try{return new URL(url).hostname.replace(/^www\./,'')}catch{return''}};
  const sourceCards=sources=>`<div style="display:grid;gap:7px;margin-top:12px">${sources.slice(0,6).map((s,i)=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="display:block;padding:9px 11px;border:1px solid #e4e4e7;border-radius:10px;text-decoration:none;color:inherit"><strong>${i+1}. ${esc(s.title||s.url)}</strong><div style="font-size:.76rem;color:#777;margin-top:3px">${esc(domain(s.url))}</div>${s.snippet?`<div style="font-size:.8rem;color:#666;margin-top:4px">${esc(s.snippet)}</div>`:''}</a>`).join('')}</div>`;
  const parseSearch=text=>{
    const lines=String(text||'').split('\n').map(clean).filter(Boolean);const out=[];let current=null;
    for(const line of lines){const m=line.match(/^\[([^\]]{2,220})\]\((https?:\/\/[^)]+)\)/);if(m){current={title:m[1],url:m[2],snippet:''};out.push(current);continue}if(current&&line!==current.title&&!/^#+\s/.test(line)&&current.snippet.length<500)current.snippet=clean((current.snippet+' '+line)).slice(0,500)}
    return out.filter((v,i,a)=>v.url&&!a.slice(0,i).some(x=>x.url===v.url)).slice(0,8);
  };
  const staticSearch=async query=>{
    const target='https://r.jina.ai/http://html.duckduckgo.com/html/?q='+encodeURIComponent(query);
    const response=await fetch(target,{headers:{accept:'text/plain'},cache:'no-store'});if(!response.ok)throw new Error('Web search request failed ('+response.status+')');
    const results=parseSearch(await response.text());if(!results.length)throw new Error('The web search returned no readable sources.');return {answer:results.slice(0,4).map((r,i)=>`${i+1}. ${r.title}${r.snippet?' — '+r.snippet:''}`).join('\n'),results};
  };
  const serverSearch=async query=>{const response=await fetch('/api/search',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query,maxResults:10}),cache:'no-store'});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Server web search unavailable');const sources=Array.isArray(data.verifiedSources)&&data.verifiedSources.length?data.verifiedSources:(Array.isArray(data.results)?data.results:[]);if(!clean(data.answer)||!sources.length)throw new Error('Server search returned no verified sourced answer.');return {answer:clean(data.answer),results:sources,confidence:data.confidence};};
  const searchWeb=async query=>{const key=clean(query).toLowerCase();if(cache.has(key))return cache.get(key);let result;try{result=await serverSearch(query)}catch{result=await staticSearch(query)}cache.set(key,result);return result};
  const submit=async event=>{
    event?.preventDefault();event?.stopImmediatePropagation();const query=clean(input.value);if(!query||send.dataset.busy==='1')return;
    send.dataset.busy='1';const id=++requestId;add(esc(query),'user');history.push({role:'user',content:query});input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));const bubble=add(status('Searching the web… DuckDuckGo live sources'),'assistant');
    try{const result=await searchWeb(query);if(id!==requestId)return;const confidence=Number(result.confidence);const meta=Number.isFinite(confidence)?`Web searched · ${Math.round(confidence)}% evidence confidence`:'Web searched · live sources';bubble.innerHTML=`<div style="font-size:.82rem;color:#666;margin-bottom:7px">${esc(meta)}</div><div style="white-space:pre-wrap">${esc(result.answer)}</div>${sourceCards(result.results)}`;history.push({role:'assistant',content:result.answer})}
    catch(error){if(id===requestId)bubble.innerHTML=noAnswer(error.message)}finally{send.dataset.busy='0';send.disabled=false;input.focus();scroll()}
  };
  form.addEventListener('submit',submit,true);input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit(e)}});
  window.TonyAIWebSearch={search:query=>searchWeb(clean(query)),clearCache:()=>cache.clear()};
})();
