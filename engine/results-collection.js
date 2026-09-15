import { buildPageSearchProfile, extractAnswerForType } from './response-types-runtime.js';

const DEFAULT_LIMIT = 8;
const MAX_CANDIDATES = 32;
const STOP_WORDS = new Set(['the','a','an','is','are','was','were','what','when','where','who','how','why','does','do','of','to','for','in','on','and','or','with','from','about','please','can','could','would','should']);

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const normalizeUrl = value => {
  try {
    const url = new URL(String(value || '').trim());
    url.hash = '';
    url.hostname = url.hostname.toLowerCase();
    return url.toString().replace(/\/$/, '');
  } catch { return clean(value); }
};
const tokens = value => [...new Set(clean(value).toLowerCase().split(/[^a-z0-9%°.-]+/).filter(x => x.length > 2 && !STOP_WORDS.has(x)))];
const tokenSet = value => new Set(tokens(value));

function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./i, '').toLowerCase(); } catch { return ''; }
}

function characteristicScore(text, characteristics) {
  const lower = clean(text).toLowerCase();
  return (characteristics || []).reduce((score, characteristic) => {
    const term = clean(characteristic).toLowerCase();
    if (!term) return score;
    return score + (lower.includes(term) ? (term.length >= 6 ? 5 : 3) : 0);
  }, 0);
}

function lexicalScore(query, text) {
  const q = tokenSet(query); const body = tokenSet(text);
  let hits = 0; for (const token of q) if (body.has(token)) hits += 1;
  return q.size ? hits / q.size : 0;
}

function sourceAuthority(url) {
  const host = domainOf(url);
  if (!host) return 0;
  if (/\.gov$|\.gov\.[a-z]{2}$|\.mil$/.test(host)) return 12;
  if (/\.edu$|\.ac\.[a-z]{2}$/.test(host)) return 10;
  if (/wikipedia\.org$/.test(host)) return 6;
  return 2;
}

function freshnessScore(page = {}) {
  const dateText = clean(page.published || page.date || page.modified || page.description);
  const match = dateText.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (!match) return 0;
  const ageDays = Math.max(0, (Date.now() - Date.parse(`${match[1]}-${match[2]}-${match[3]}`)) / 86400000);
  return Math.max(0, 10 - Math.min(10, ageDays / 365));
}

export function buildResultRecord(raw = {}, profile = buildPageSearchProfile('')) {
  const type = profile.type;
  const url = normalizeUrl(raw.url || raw.source?.url);
  const pageText = [raw.title, raw.description, raw.text, raw.content, ...(raw.facts || [])].filter(Boolean).join(' ');
  const characteristics = [...new Set([...(profile.characteristics || []), ...(type.characteristics || [])])];
  const extraction = raw.extraction || extractAnswerForType(pageText, profile.type?.name || '', type);
  const characteristicHits = characteristicScore(pageText, characteristics);
  const lexical = lexicalScore(profile.query || '', pageText);
  const authority = sourceAuthority(url);
  const freshness = freshnessScore(raw);
  const evidence = Number(raw.evidenceScore ?? raw.credibilityScore ?? raw.score?.total ?? 0);
  const extractionScore = Number(extraction.matchScore || 0);
  const score = characteristicHits * 4 + lexical * 30 + authority + freshness + Math.min(30, evidence) + Math.min(50, extractionScore);
  return {
    id: url || `result-${Math.random().toString(36).slice(2)}`,
    url,
    domain: domainOf(url),
    title: clean(raw.title || raw.source?.title || url),
    description: clean(raw.description || raw.source?.description),
    facts: Array.isArray(raw.facts) ? raw.facts.map(clean).filter(Boolean) : extraction.facts || [],
    extraction,
    characteristics,
    matchedCharacteristics: characteristics.filter(c => pageText.toLowerCase().includes(clean(c).toLowerCase())),
    scores: { total: score, characteristicHits, lexical, authority, freshness, evidence, extraction: extractionScore },
    collectedAt: new Date().toISOString()
  };
}

export class ResultsCollection {
  constructor(question, options = {}) {
    this.question = clean(question);
    this.profile = options.profile || { ...buildPageSearchProfile(this.question), query: this.question };
    this.limit = Math.max(1, Math.min(DEFAULT_LIMIT, Number(options.limit) || DEFAULT_LIMIT));
    this.results = new Map();
    this.revision = 0;
  }

  collect(items = []) {
    for (const item of items) this.add(item);
    return this.rebuild();
  }

  add(item) {
    const record = buildResultRecord(item, this.profile);
    if (!record.url) return null;
    const previous = this.results.get(record.url);
    if (!previous || record.scores.total > previous.scores.total || record.facts.length > previous.facts.length) this.results.set(record.url, record);
    this.revision += 1;
    return record;
  }

  merge(collection) {
    const items = collection instanceof ResultsCollection ? collection.ordered() : collection;
    return this.collect(items);
  }

  rebuild() {
    const values = [...this.results.values()];
    for (const record of values) {
      record.relevance = Number((record.scores.total + record.matchedCharacteristics.length * 7).toFixed(3));
      record.profileMatch = Number(((record.matchedCharacteristics.length / Math.max(1, record.characteristics.length)) * 100).toFixed(1));
    }
    values.sort((a, b) => b.relevance - a.relevance || b.scores.authority - a.scores.authority || a.url.localeCompare(b.url));
    this.results = new Map(values.map(record => [record.url, record]));
    this.revision += 1;
    return this.ordered();
  }

  ordered() { return [...this.results.values()].slice(0, MAX_CANDIDATES); }
  top(limit = this.limit) { return this.ordered().slice(0, limit); }

  organize() {
    const groups = new Map();
    for (const record of this.ordered()) {
      const key = record.domain || 'unknown';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record);
    }
    return [...groups.entries()].map(([domain, results]) => ({ domain, results }));
  }

  rebuildFrom(pages = []) {
    this.results.clear();
    return this.collect(pages);
  }

  toJSON() {
    return {
      question: this.question,
      responseType: this.profile.type?.name || 'General factual answer',
      typeId: this.profile.type?.id || 'generic-factual',
      characteristics: this.profile.characteristics || [],
      searchTerms: this.profile.searchTerms || [],
      revision: this.revision,
      count: this.results.size,
      results: this.top()
    };
  }
}

export function collectResults(question, pages = [], options = {}) {
  const collection = new ResultsCollection(question, options);
  collection.collect(pages);
  return collection;
}
