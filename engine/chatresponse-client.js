/* TonyAI ChatResponse browser bridge. */
(() => {
  if (window.__TonyAIChatResponseInstalled) return;
  window.__TonyAIChatResponseInstalled = true;
  const DUCK_AI_URL = 'https://duck.ai/chat';
  const state = { request: 0, controller: null, cache: new Map() };
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const escapeHtml = value => clean(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const getMessages = () => document.getElementById('messages');
  const getArea = () => document.getElementById('chatArea');
  const scroll = () => requestAnimationFrame(() => { const area = getArea(); if (area) area.scrollTop = area.scrollHeight; });
  const statusHtml = (text, detail='') => `<div data-chatresponse-status style="color:#6b6b6b;font-size:.86rem;padding:4px 0 10px">${escapeHtml(text)}${detail ? ` <span style="opacity:.7">${escapeHtml(detail)}</span>` : ''}</div>`;

  function duckAiUrl(query) {
    const url = new URL(DUCK_AI_URL);
    url.searchParams.set('prompt', '1');
    url.searchParams.set('q', query);
    return url.toString();
  }
  function openDuckAi(query) {
    const url = duckAiUrl(query);
    const tab = window.open(url, '_blank', 'noopener,noreferrer');
    if (!tab) window.location.assign(url);
    return url;
  }
  function appendRow(role, html, marker='') {
    const messages = getMessages();
    if (!messages) return null;
    const row = document.createElement('div');
    row.className = `message ${role}`;
    if (marker) row.dataset.chatresponse = marker;
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = html;
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.classList.add('has-messages');
    const empty = document.getElementById('emptyState');
    if (empty) empty.style.display = 'none';
    scroll();
    return row;
  }
  function sourceCards(result) {
    const sources = Array.isArray(result?.verifiedSources) && result.verifiedSources.length ? result.verifiedSources : (Array.isArray(result?.results) ? result.results.slice(0, 5) : []);
    if (!sources.length) return '';
    return `<div style="display:grid;gap:7px;margin-top:12px">${sources.slice(0,5).map((source,i)=>{const url=clean(source.url||source.source?.finalUrl);const title=clean(source.source?.title||source.title||url);let domain='';try{domain=new URL(url).hostname.replace(/^www\./,'')}catch{}return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="display:block;padding:9px 11px;border:1px solid #e4e4e7;border-radius:10px;text-decoration:none;color:inherit"><strong>${i+1}. ${escapeHtml(title.slice(0,140))}</strong><div style="font-size:.76rem;color:#777;margin-top:3px">${escapeHtml(domain)}</div></a>`}).join('')}</div>`;
  }
  function renderResult(result, elapsed) {
    const confidence = Number(result?.confidence);
    const confidenceText = Number.isFinite(confidence) ? `${Math.round(confidence*100)}% evidence confidence` : 'Evidence search completed';
    const definite = result?.definite ? ' · cross-source agreement' : '';
    const answer = clean(result?.answer || result?.result?.snippet || 'No supported result was returned.');
    const evidence = Array.isArray(result?.evidence?.consensusFacts) ? result.evidence.consensusFacts : [];
    const evidenceHtml = evidence.length ? `<div style="margin-top:12px"><strong style="font-size:.84rem">Evidence</strong><ul style="margin:6px 0 0;padding-left:20px">${evidence.slice(0,3).map(x=>`<li style="margin:4px 0">${escapeHtml(x.sentence||'')}</li>`).join('')}</ul></div>` : '';
    return `<div><div style="font-size:.82rem;color:#666;margin-bottom:6px">ChatResponse live web search · ${escapeHtml(confidenceText+definite)} · ${Math.max(0,Math.round(elapsed))} ms</div><div>${escapeHtml(answer)}</div>${evidenceHtml}${sourceCards(result)}</div>`;
  }
  async function runSearch(query,row,requestId) {
    const key = clean(query).toLowerCase();
    if (state.cache.has(key)) { row.querySelector('.message-bubble').innerHTML = renderResult(state.cache.get(key),0); return; }
    if (state.controller) state.controller.abort();
    state.controller = new AbortController();
    const started = performance.now();
    const bubble = row.querySelector('.message-bubble');
    bubble.innerHTML = statusHtml('Searching live sources…','ChatResponse + DuckDuckGo query expansion');
    try {
      const response = await fetch('/api/chatresponse',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query,maxResults:8,timeoutMs:1650,verify:true}),signal:state.controller.signal});
      const result = await response.json();
      if (requestId !== state.request) return;
      if (!response.ok) throw new Error(result?.error||'ChatResponse search failed');
      state.cache.set(key,result);
      bubble.innerHTML = renderResult(result,performance.now()-started);
      bubble.dataset.searchReady='true';
      scroll();
    } catch (error) {
      if (error?.name==='AbortError'||requestId!==state.request) return;
      bubble.innerHTML = statusHtml('Live search unavailable.',clean(error?.message||error));
    }
  }
  function runLocalChat(query,requestId,row) {
    fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:query}],stream:false})}).then(async response=>{
      if (requestId!==state.request||!response.ok)return;
      const result=await response.json();
      const text=clean(result?.choices?.[0]?.message?.content||result?.answer||'');
      const bubble=row?.querySelector('.message-bubble');
      if(text&&bubble&&requestId===state.request&&!bubble.dataset.searchReady) bubble.insertAdjacentHTML('afterbegin',`<div style="margin-bottom:10px">${escapeHtml(text)}</div>`);
    }).catch(()=>{});
  }
  function submitQuery(query,event) {
    if (event) { event.preventDefault(); event.stopImmediatePropagation(); }
    const text=clean(query);
    if(!text)return false;
    state.request+=1;
    const requestId=state.request;
    const row=appendRow('assistant',statusHtml('Working…','Opening Duck.ai + searching with ChatResponse'),String(requestId));
    if(!row)return false;
    openDuckAi(text);
    runSearch(text,row,requestId);
    runLocalChat(text,requestId,row);
    const input=document.getElementById('messageInput');
    if(input){input.value='';input.style.height='auto';}
    const send=document.getElementById('sendButton');
    if(send)send.disabled=false;
    scroll();
    return true;
  }
  function install() {
    const composer=document.getElementById('composer');
    const input=document.getElementById('messageInput');
    const send=document.getElementById('sendButton');
    if(!composer||!input)return false;
    composer.addEventListener('submit',event=>submitQuery(input.value,event),true);
    if(send) send.addEventListener('click',event=>{ if(clean(input.value)){ event.preventDefault(); event.stopImmediatePropagation(); submitQuery(input.value); } },true);
    window.TonyAIChatResponse={search:query=>{state.request+=1;const row=appendRow('assistant',statusHtml('Searching live sources…'),String(state.request));return row?runSearch(clean(query),row,state.request):Promise.resolve();},openDuckAi,duckAiUrl,clearCache:()=>state.cache.clear()};
    return true;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>install(),{once:true});
  else install();
})();
