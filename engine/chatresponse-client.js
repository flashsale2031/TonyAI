/* TonyAI ChatResponse browser bridge.
 *
 * Every chatbox request now has two browser-visible paths:
 *   1. open Duck.ai directly with the exact user text in its prompt URL;
 *   2. run TonyAI ChatResponse in parallel against DuckDuckGo web results.
 *
 * Duck.ai is a separate origin, so the browser cannot safely inject into its
 * DOM after navigation. Its supported prompt/query URL is used instead; this
 * preserves the exact request without requiring cross-origin DOM access.
 */
(() => {
  const DUCK_AI_URL = 'https://duck.ai/chat';
  const state = { request: 0, controller: null, cache: new Map() };
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const escapeHtml = value => clean(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const cacheKey = query => clean(query).toLowerCase();
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
    // Prefer a new tab so ChatResponse can finish in TonyAI. If the browser
    // blocks scripted tabs, fall back to direct navigation in the current tab.
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
    const sources = Array.isArray(result?.verifiedSources) && result.verifiedSources.length
      ? result.verifiedSources : (Array.isArray(result?.results) ? result.results.slice(0, 5) : []);
    if (!sources.length) return '';
    return `<div style="display:grid;gap:7px;margin-top:12px">${sources.slice(0,5).map((source, i) => {
      const url = clean(source.url || source.source?.finalUrl);
      const title = clean(source.source?.title || source.title || url);
      const domain = (() => { try { return new URL(url).hostname.replace(/^www\./,''); } catch { return ''; } })();
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="display:block;padding:9px 11px;border:1px solid #e4e4e7;border-radius:10px;text-decoration:none;color:inherit"><strong>${i + 1}. ${escapeHtml(title.slice(0,140))}</strong><div style="font-size:.76rem;color:#777;margin-top:3px">${escapeHtml(domain)}</div></a>`;
    }).join('')}</div>`;
  }

  function evidenceHtml(result) {
    const evidence = Array.isArray(result?.evidence?.consensusFacts) ? result.evidence.consensusFacts : [];
    if (!evidence.length) return '';
    return `<div style="margin-top:12px"><strong style="font-size:.84rem">Evidence</strong><ul style="margin:6px 0 0;padding-left:20px">${evidence.slice(0,3).map(x => `<li style="margin:4px 0">${escapeHtml(x.sentence || '')}</li>`).join('')}</ul></div>`;
  }

  function renderSearchResult(result, elapsed) {
    const confidence = Number(result?.confidence);
    const confidenceText = Number.isFinite(confidence) ? `${Math.round(confidence * 100)}% evidence confidence` : 'Evidence search completed';
    const definite = result?.definite ? ' · cross-source agreement' : '';
    const answer = clean(result?.answer || result?.result?.snippet || 'No supported result was returned.');
    return `<div><div style="font-size:.82rem;color:#666;margin-bottom:6px">ChatResponse live web search · ${escapeHtml(confidenceText + definite)} · ${Math.max(0, Math.round(elapsed))} ms</div><div>${escapeHtml(answer)}</div>${evidenceHtml(result)}${sourceCards(result)}</div>`;
  }

  async function runSearch(query, row, requestId) {
    const key = cacheKey(query);
    if (state.cache.has(key)) {
      row.querySelector('.message-bubble').innerHTML = renderSearchResult(state.cache.get(key), 0);
      scroll();
      return;
    }
    if (state.controller) state.controller.abort();
    state.controller = new AbortController();
    const started = performance.now();
    const bubble = row.querySelector('.message-bubble');
    bubble.innerHTML = statusHtml('Searching live sources…','ChatResponse + DuckDuckGo query expansion');
    try {
      const response = await fetch('/api/chatresponse', {
        method:'POST', headers:{'content-type':'application/json'},
        body:JSON.stringify({query,maxResults:8,timeoutMs:1650,verify:true}),
        signal:state.controller.signal,
        keepalive:false
      });
      const result = await response.json();
      if (requestId !== state.request) return;
      if (!response.ok) throw new Error(result?.error || 'ChatResponse search failed');
      state.cache.set(key, result);
      bubble.innerHTML = renderSearchResult(result, performance.now() - started);
      bubble.dataset.searchReady = 'true';
      scroll();
    } catch (error) {
      if (error?.name === 'AbortError' || requestId !== state.request) return;
      bubble.innerHTML = statusHtml('Live search unavailable.', clean(error?.message || error));
    }
  }

  function runParallelLocalChat(query, requestId, searchRow) {
    fetch('/api/chat', {
      method:'POST', headers:{'content-type':'application/json'},
      body:JSON.stringify({messages:[{role:'user',content:query}],stream:false}),
      keepalive:false
    }).then(async response => {
      if (requestId !== state.request || !response.ok) return;
      const result = await response.json();
      const text = clean(result?.choices?.[0]?.message?.content || result?.answer || '');
      if (!text || requestId !== state.request) return;
      const bubble = searchRow?.querySelector('.message-bubble');
      if (bubble && !bubble.dataset.searchReady) bubble.insertAdjacentHTML('afterbegin', `<div style="margin-bottom:10px">${escapeHtml(text)}</div>`);
    }).catch(() => {});
  }

  function handleSubmit(event) {
    const input = document.getElementById('messageInput');
    const query = clean(input?.value);
    if (!query) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    state.request += 1;
    const requestId = state.request;
    const messages = getMessages();
    if (!messages) return;
    appendRow('user', escapeHtml(query));
    const searchRow = appendRow('assistant', statusHtml('Working…','Opening Duck.ai + searching with ChatResponse'), String(requestId));

    // Start both paths from the same exact chatbox text. Duck.ai receives it
    // through its prompt URL while ChatResponse searches for supporting answers.
    openDuckAi(query);
    runSearch(query, searchRow, requestId);
    runParallelLocalChat(query, requestId, searchRow);

    input.value = '';
    input.style.height = 'auto';
    const send = document.getElementById('sendButton');
    if (send) send.disabled = false;
    scroll();
  }

  function install() {
    const composer = document.getElementById('composer');
    if (!composer) return;
    composer.addEventListener('submit', handleSubmit, true);
    window.TonyAIChatResponse = {
      search: query => { state.request += 1; const row = appendRow('assistant', statusHtml('Searching live sources…'), String(state.request)); return runSearch(clean(query), row, state.request); },
      openDuckAi,
      duckAiUrl,
      clearCache: () => state.cache.clear()
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true}); else install();
})();
