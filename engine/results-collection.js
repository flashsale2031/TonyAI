import { buildPageSearchProfile, extractAnswerForType } from './response-types-runtime.js';

const DEFAULT_LIMIT = 8;
const MAX_CANDIDATES = 32;
const MAX_FACTS_PER_PAGE = 12;
const MAX_DOCUMENT_CHARS = 240000;
const STOP_WORDS = new Set(['the','a','an','is','are','was','were','what','when','where','who','how','why','does','do','of','to','for','in','on','and','or','with','from','about','please','can','could','would','should']);

const clean = value => String(value ?? '')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
  .replace(/\uFFFD/g, '')
  .replace(/\s+/g, ' ')
  .trim();

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

function uniqueStrings(values = []) {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function factsFrom(raw, extraction) {
  const supplied = Array.isArray(raw.facts) ? raw.facts : [];
  const claims = Array.isArray(raw.claims) ? raw.claims.map(item => item?.text || item) : [];
  const extracted = Array.isArray(extraction?.facts) ? extraction.facts : [];
  return uniqueStrings([...supplied, ...claims, ...extracted]).slice(0, MAX_FACTS_PER_PAGE);
}

function documentTextFor(raw, facts) {
  return [raw.title, raw.description, raw.snippet, ...facts].filter(Boolean).join(' ');
}

export function buildResultRecord(raw = {}, profile = buildPageSearchProfile('')) {
  const type = profile.type || {};
  const url = normalizeUrl(raw.url || raw.source?.url);
  const facts = factsFrom(raw, raw.extraction);
  const pageText = documentTextFor(raw, facts) || clean(raw.text || raw.content);
  const characteristics = uniqueStrings([...(profile.characteristics || []), ...(type.characteristics || [])]);
  const extraction = raw.extraction || extractAnswerForType(pageText, profile.query || '', type);
  const finalFacts = facts.length ? facts : factsFrom(raw, extraction);
  const characteristicHits = characteristicScore(pageText, characteristics);
  const lexical = lexicalScore(profile.query || '', pageText);
  const authority = sourceAuthority(url);
  const freshness = freshnessScore(raw);
  const evidence = Number(raw.evidenceScore ?? raw.credibilityScore ?? raw.score?.total ?? 0);
  const extractionScore = Number(extraction?.matchScore || 0);
  const score = characteristicHits * 4 + lexical * 30 + authority + freshness + Math.min(30, evidence) + Math.min(50, extractionScore);
  return {
    id: url || `result-${Math.random().toString(36).slice(2)}`,
    url,
    domain: domainOf(url),
    title: clean(raw.title || raw.source?.title || url),
    description: clean(raw.description || raw.source?.description || raw.snippet),
    facts: finalFacts,
    extraction: extraction || { facts: finalFacts, characteristics: [] },
    characteristics,
    matchedCharacteristics: characteristics.filter(c => pageText.toLowerCase().includes(clean(c).toLowerCase())),
    scores: { total: score, characteristicHits, lexical, authority, freshness, evidence, extraction: extractionScore },
    collectedAt: new Date().toISOString()
  };
}

function escapeMarkdown(value) {
  return clean(value)
    .replace(/\\/g, '\\\\')
    .replace(/([`*_{}\[\]()#+.!|<>])/g, '\\$1');
}

function escapeCodeFence(value) {
  return String(value ?? '')
    .replace(/\u0000/g, '')
    .replace(/```/g, '` ` `')
    .replace(/\r\n?/g, '\n')
    .trim();
}

function safeLanguage(value) {
  const language = clean(value).toLowerCase().replace(/[^a-z0-9+#.-]/g, '');
  return language || 'text';
}

function detectCode(raw, facts) {
  const candidate = String(raw.code || raw.codeSnippet || '').trim();
  if (candidate) return { language: safeLanguage(raw.language), code: escapeCodeFence(candidate) };
  const text = [raw.text, raw.content, ...facts].filter(Boolean).join('\n');
  const fence = text.match(/```([a-z0-9+#.-]*)\s*\n([\s\S]*?)```/i);
  return fence ? { language: safeLanguage(fence[1]), code: escapeCodeFence(fence[2]) } : null;
}

function renderRecord(record, index) {
  const lines = [`## ${index + 1}. ${escapeMarkdown(record.title || record.url || 'Untitled page')}`];
  if (record.url) lines.push(`Source: ${record.url}`);
  if (record.domain) lines.push(`Domain: ${escapeMarkdown(record.domain)}`);
  if (record.description) lines.push(`Summary: ${escapeMarkdown(record.description)}`);
  if (record.facts.length) {
    lines.push('', 'Facts:');
    for (const fact of record.facts) lines.push(`- ${escapeMarkdown(fact)}`);
  }
  if (record.matchedCharacteristics.length) lines.push('', `Matched characteristics: ${record.matchedCharacteristics.map(escapeMarkdown).join(', ')}`);
  lines.push('', `Relevance: ${record.relevance} | Profile match: ${record.profileMatch}%`);
  return lines.join('\n');
}

function buildDocument(collection) {
  const profile = collection.profile || {};
  const records = collection.top();
  const lines = [
    `# TonyAI Web Results Collection`,
    '',
    `Question: ${escapeMarkdown(collection.question)}`,
    `Response type: ${escapeMarkdown(profile.type?.name || 'General factual answer')}`,
    `Type ID: ${escapeMarkdown(profile.type?.id || 'generic-factual')}`,
    `Collected pages: ${records.length}`,
    '',
    'This document contains normalized, deduplicated webpage findings. Source text is treated as data and is never executed.',
    ''
  ];
  if (profile.characteristics?.length) lines.push(`Search characteristics: ${profile.characteristics.map(escapeMarkdown).join(', ')}`, '');
  if (profile.searchTerms?.length) lines.push(`Search signals: ${profile.searchTerms.map(escapeMarkdown).join(', ')}`, '');
  for (let index = 0; index < records.length; index += 1) lines.push(renderRecord(records[index], index), '');
  const text = lines.join('\n').slice(0, MAX_DOCUMENT_CHARS).trim();
  return { format: 'markdown', text, title: `TonyAI Web Results — ${collection.question || 'Collection'}`, recordCount: records.length };
}

export class ResultsCollection {
  constructor(question, options = {}) {
    this.question = clean(question);
    const suppliedProfile = options.profile || buildPageSearchProfile(this.question);
    this.profile = { ...suppliedProfile, query: this.question };
    this.limit = Math.max(1, Math.min(DEFAULT_LIMIT, Number(options.limit) || DEFAULT_LIMIT));
    this.results = new Map();
    this.revision = 0;
  }

  collect(items = []) {
    for (const item of Array.isArray(items) ? items : []) this.add(item);
    return this.rebuild();
  }

  add(item) {
    if (!item || typeof item !== 'object') return null;
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
  top(limit = this.limit) { return this.ordered().slice(0, Math.max(1, Number(limit) || this.limit)); }

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
    this.revision += 1;
    return this.collect(pages);
  }

  document() { return buildDocument(this); }

  toJSON() {
    const document = this.document();
    return {
      question: this.question,
      responseType: this.profile.type?.name || 'General factual answer',
      typeId: this.profile.type?.id || 'generic-factual',
      characteristics: this.profile.characteristics || [],
      searchTerms: this.profile.searchTerms || [],
      revision: this.revision,
      count: this.results.size,
      results: this.top(),
      organized: this.organize(),
      document
    };
  }
}

export function collectResults(question, pages = [], options = {}) {
  const collection = new ResultsCollection(question, options);
  collection.collect(pages);
  return collection;
}
