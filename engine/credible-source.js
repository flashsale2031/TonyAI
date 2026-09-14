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

export function selectMostCredibleResponse(result = {}) {
  const sources = [
    ...(Array.isArray(result.verifiedSources) ? result.verifiedSources : []),
    ...(Array.isArray(result.results) ? result.results : [])
  ];
  const unique = [...new Map(sources.map(source => [source.url, source])).values()];
  const source = selectMostCredibleSource(unique);
  if (!source) return result;

  const answer = String(source.snippet || source.description || source.title || result.answer || '').trim();
  return {
    ...result,
    answer,
    result: source,
    results: [source],
    verifiedSources: [source],
    selectedSource: {
      title: source.title || '',
      url: source.url,
      score: scoreOf(source)
    }
  };
}
