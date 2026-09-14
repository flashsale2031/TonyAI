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
    if (!existing || scoreOf(source) > scoreOf(existing)) {
      byUrl.set(source.url, source);
    }
  }

  const source = selectMostCredibleSource([...byUrl.values()]);
  if (!source) return result;

  const content = sourceContent(source, pages);
  const answer = content || String(source.snippet || source.description || source.title || result.answer || '').trim();
  const selectedSource = {
    ...source,
    score: scoreOf(source),
    extractedContent: content,
    contentMode: content ? 'detailed-source-claims' : 'search-metadata'
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
