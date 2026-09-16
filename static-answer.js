(() => {
  'use strict';
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  const domainOf = url => { try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; } };
  const tokenise = value => clean(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || [];
  const STOP = new Set('a an and are as at be by for from how i in is it latest me of on or the today to was what when who with current now does do tell please'.split(' '));
  const intentTerms = query => tokenise(query).filter(term => term.length > 2 && !STOP.has(term));
  const authority = domain => {
    if (/\.gov$|\.gov\./.test(domain)) return 34;
    if (/whitehouse\.gov$|congress\.gov$|supremecourt\.gov$/.test(domain)) return 44;
    if (/\.edu$/.test(domain)) return 24;
    if (/reuters\.com$|apnews\.com$|bbc\.com$|npr\.org$/.test(domain)) return 20;
    if (/wikipedia\.org$/.test(domain)) return -8;
    return 0;
  };
  function scoreResult(result, query) {
    const text = `${result.title || ''} ${result.snippet || ''} ${result.url || ''}`;
    const terms = intentTerms(query);
    const haystack = tokenise(text);
    const overlap = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
    const titleTokens = tokenise(result.title);
    const titleOverlap = terms.reduce((sum, term) => sum + (titleTokens.includes(term) ? 1 : 0), 0);
    const domain = domainOf(result.url);
    const current = /\b(current|latest|today|now|president|prime minister|ceo|governor|mayor)\b/i.test(query);
    const official = /\b(official|white house|government|president|administration|press secretary)\b/i.test(text);
    const stalePenalty = /wikipedia\.org$/.test(domain) && current ? 18 : 0;
    return overlap * 8 + titleOverlap * 13 + authority(domain) + (official && current ? 18 : 0) - stalePenalty;
  }
  function rankResults(rows, query) {
    return (Array.isArray(rows) ? rows : []).map((row, index) => ({ ...row, score: scoreResult(row, query), _index: index }))
      .sort((a, b) => b.score - a.score || a._index - b._index).map(({ _index, ...row }) => row);
  }
  function directAnswer(query, rows) {
    const q = clean(query);
    const ranked = rankResults(rows, q);
    if (/\bwho\s+(?:is|was)\s+(?:the\s+)?(?:current\s+)?president\b|\bcurrent\s+president\b/i.test(q)) {
      const evidence = ranked.find(row => /\bpresident\b/i.test(`${row.title} ${row.snippet}`));
      const match = evidence && `${evidence.title} ${evidence.snippet}`.match(/\bPresident\s+((?:[A-Z][\w'.-]*\s+){1,4}[A-Z][\w'.-]*)/);
      if (match) return { text: `The current president is ${clean(match[1]).replace(/[.,;:]+$/, '')}.`, source: evidence, ranked };
    }
    return null;
  }
  function parse(text) {
    const source = String(text || '').replace(/\r/g, '');
    const pattern = /^\s*\d+\.\s+##\s+\[\*\*(.*?)\*\*\]\((https?:\/\/[^)]+)\)\s*\n([^\n]*)/gm;
    return [...source.matchAll(pattern)].map(match => ({ title: clean(match[1]), url: match[2], snippet: clean(match[3]) }));
  }
  function escapeHtml(value) { return clean(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char])); }
  window.TonyStaticAnswer = { parse, rankResults, directAnswer, escapeHtml };
})();
