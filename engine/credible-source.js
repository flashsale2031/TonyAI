function scoreOf(source) {
  const value = source?.score?.total ?? source?.score ?? source?.evidenceScore ?? source?.credibilityScore;
  const score = Number(value);
  return Number.isFinite(score) ? score : 0;
}

export function selectMostCredibleSource(sources = []) {
  const candidates = Array.isArray(sources) ? sources.filter(source => source && typeof source.url === 'string' && source.url) : [];
  if (!candidates.length) return null;
  return candidates
    .map((source, index) => ({ source, index, score: scoreOf(source) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0].source;
}

function sourceContent(source, pages = []) {
  if (Array.isArray(source?.claims) && source.claims.length) {
    return source.claims.map(claim => typeof claim === 'string' ? claim : claim?.text).filter(Boolean).join('\n\n');
  }
  const page = Array.isArray(pages) ? pages.find(item => item?.url === source?.url) : null;
  if (Array.isArray(page?.claims) && page.claims.length) {
    return page.claims.map(claim => typeof claim === 'string' ? claim : claim?.text).filter(Boolean).join('\n\n');
  }
  if (typeof source?.text === 'string' && source.text.trim()) return source.text.trim();
  if (typeof page?.text === 'string' && page.text.trim()) return page.text.trim();
  return '';
}

export function selectMostCredibleResponse(result = {}) {
  const pages = Array.isArray(result.pages) ? result.pages : [];
  const sources = [
    ...(Array.isArray(result.verifiedSources) ? result.verifiedSources : []),
    ...(Array.isArray(result.results) ? result.results : []),
    ...pages
  ];
  const byUrl = new Map();
  for (const source of sources) {
    if (!source || typeof source.url !== 'string' || !source.url) continue;
    const existing = byUrl.get(source.url);
    const sourceHasContent = Boolean(sourceContent(source, pages));
    const existingHasContent = Boolean(existing && sourceContent(existing, pages));
    const sourceOwnContent = (Array.isArray(source.claims) && source.claims.length) || (typeof source.text === 'string' && source.text.trim());
    const existingOwnContent = existing && ((Array.isArray(existing.claims) && existing.claims.length) || (typeof existing.text === 'string' && existing.text.trim()));
    if (!existing || scoreOf(source) > scoreOf(existing) || (scoreOf(source) === scoreOf(existing) && sourceHasContent && (!existingHasContent || sourceOwnContent && !existingOwnContent))) byUrl.set(source.url, source);
  }

  const source = selectMostCredibleSource([...byUrl.values()]);
  if (!source) return result;

  const content = sourceContent(source, pages);
  const answer = content || String(source.snippet || source.description || source.title || result.answer || '').trim();
  const selectedSource = {
    ...source,
    score: scoreOf(source),
    extractedContent: content,
    contentMode: content ? 'detailed-source-content' : 'search-metadata',
    // The chatbox currently renders source.snippet in its source card. Point that
    // field at inspected webpage content so the UI cannot fall back to the
    // DuckDuckGo snippet when a real page was successfully inspected.
    snippet: content || source.snippet || '',
    description: content || source.description || ''
  };

  return {
    ...result,
    answer,
    result: selectedSource,
    results: [selectedSource],
    verifiedSources: [selectedSource],
    selectedSource: {
      title: selectedSource.title || '',
      url: selectedSource.url,
      score: scoreOf(selectedSource),
      extractedContent: content,
      contentMode: selectedSource.contentMode
    }
  };
}
