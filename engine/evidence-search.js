import { chromium } from "playwright";
import natural from "natural";
import stopword from "stopword";
import Bottleneck from "bottleneck";
import crypto from "crypto";
import { duckduckgoSearch } from "./duckduckgo.js";

const tokenizer = new natural.WordTokenizer();
const limiter = new Bottleneck({ maxConcurrent: 2, minTime: 1200 });

async function searchDuckDuckGo(question) {
  const response = await duckduckgoSearch(question, { maxResults: 10, timeoutMs: 10000 });
  return response.results;
}

function removeDuplicateResults(results) {
  const seenUrls = new Set(); const seenTitles = new Set();
  return results.filter(result => {
    const url = normalizeUrl(result.url); const title = normalizeText(result.title);
    if (!url || seenUrls.has(url) || seenTitles.has(title)) return false;
    seenUrls.add(url); seenTitles.add(title); return true;
  });
}

async function inspectPages(results, question) {
  const browser = await chromium.launch({ headless: true });
  const pages = [];
  try {
    for (const result of results) {
      const inspected = await limiter.schedule(() => inspectPage(browser, result, question));
      pages.push(inspected);
    }
  } finally { await browser.close(); }
  return pages.sort((a, b) => b.score.total - a.score.total);
}

async function inspectPage(browser, result, question) {
  const page = await browser.newPage({ userAgent: "Mozilla/5.0 (compatible; EvidenceChat/1.0)" });
  try {
    await page.goto(result.url, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(500);
    const metadata = await page.evaluate(() => {
      const meta = selector => document.querySelector(selector)?.content || "";
      const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => { try { return JSON.parse(node.textContent); } catch { return null; } }).filter(Boolean);
      return { title: document.title, description: meta('meta[name="description"]'), author: meta('meta[name="author"]'), published: meta('meta[property="article:published_time"]') || meta('meta[name="date"]') || meta('meta[itemprop="datePublished"]'), modified: meta('meta[property="article:modified_time"]') || meta('meta[name="dateModified"]') || meta('meta[itemprop="dateModified"]'), canonical: document.querySelector('link[rel="canonical"]')?.href || "", jsonLd };
    });
    const rawText = await page.locator("body").innerText({ timeout: 10000 });
    const text = cleanText(rawText).slice(0, 120000);
    const published = normalizeDate(metadata.published, metadata.jsonLd);
    const claims = extractClaims(text);
    return { title: metadata.title || result.title, url: result.url, canonical: metadata.canonical, snippet: result.snippet, domain: getDomain(result.url), author: metadata.author || "", published, modified: metadata.modified || "", text, claims, score: scorePage(question, result, text, published) };
  } catch {
    return { ...result, domain: getDomain(result.url), text: "", claims: [], score: { total: 0, relevance: 0, sourceQuality: 0, freshness: 0, readability: 0 }, error: "Page could not be inspected." };
  } finally { await page.close(); }
}

function scorePage(question, result, text, published) {
  const questionWords = new Set(words(question));
  const pageWords = words(`${result.title} ${result.snippet} ${text.slice(0, 30000)}`);
  const matchingWords = pageWords.filter(word => questionWords.has(word)).length;
  const relevance = Math.min(40, matchingWords * 3);
  const sourceQuality = scoreSource(result.url); const freshness = scoreFreshness(published); const readability = scoreReadability(text);
  return { total: Math.min(100, relevance + sourceQuality + freshness + readability), relevance, sourceQuality, freshness, readability };
}

function scoreSource(url) {
  const domain = getDomain(url);
  const highQuality = [".gov", ".edu", ".ac.", "who.int", "un.org", "nih.gov", "cdc.gov", "nasa.gov", "nature.com", "sciencedirect.com"];
  const mediumQuality = ["reuters.com", "apnews.com", "bbc.com", "britannica.com", "mayoclinic.org", "wikipedia.org"];
  if (highQuality.some(item => domain.includes(item))) return 25;
  if (mediumQuality.some(item => domain.includes(item))) return 18;
  return 8;
}
function scoreFreshness(dateString) {
  if (!dateString) return 3; const date = new Date(dateString); if (Number.isNaN(date.getTime())) return 3;
  const ageDays = (Date.now() - date.getTime()) / 86400000;
  if (ageDays < 90) return 15; if (ageDays < 365) return 12; if (ageDays < 1825) return 8; return 4;
}
function scoreReadability(text) { if (text.length > 5000) return 15; if (text.length > 1500) return 10; if (text.length > 500) return 5; return 0; }
function extractClaims(text) {
  return text.split(/(?<=[.!?])\s+/).map(sentence => sentence.trim()).filter(sentence => sentence.length >= 40 && sentence.length <= 500).filter(sentence => /\b(is|are|was|were|has|have|can|cannot|causes|means|according|reported|found|shows|does|doesn't|not)\b/i.test(sentence)).slice(0, 100);
}
function createReport(question, pages) {
  const usablePages = pages.filter(page => page.text && page.claims.length);
  if (!usablePages.length) return { answer: "No readable pages were found.", confidence: 0, claims: [], contradictions: [] };
  const claims = consolidateClaims(usablePages); const contradictions = findContradictions(claims);
  const contradictoryIds = new Set(contradictions.flatMap(item => [item.claimA.id, item.claimB.id]));
  const consistentClaims = claims.filter(claim => claim.supportingPages.length >= 2 && !contradictoryIds.has(claim.id)).sort((a, b) => b.score - a.score).slice(0, 8);
  const confidence = calculateConfidence(consistentClaims, usablePages.length, contradictions.length);
  const answer = [`Probable answer for: ${question}`, "", consistentClaims.length ? "Consistent findings:" : "No uncontested findings were identified.", ...consistentClaims.map((claim, index) => `${index + 1}. ${claim.text} [${claim.supportingPages.length} supporting pages]`), "", contradictions.length ? "Contradiction markers:" : "No direct contradictions detected.", ...contradictions.slice(0, 8).map((item, index) => `${index + 1}. ${item.strength.toUpperCase()} (${item.score}/100): ${item.type}`), "", `Confidence: ${confidence}%`, "", "Review the linked sources before relying on this result."].join("\n");
  return { answer, confidence, claims: consistentClaims, contradictions };
}
function consolidateClaims(pages) {
  const groups = [];
  for (const page of pages) for (const text of page.claims) {
    const normalized = normalizeClaim(text); if (normalized.length < 30) continue;
    let group = groups.find(existing => similarity(existing.normalized, normalized) >= 0.62);
    if (!group) { group = { id: crypto.randomUUID(), text, normalized, supportingPages: [], scores: [], polarity: claimPolarity(text), numbers: extractNumbers(text) }; groups.push(group); }
    if (!group.supportingPages.includes(page.url)) { group.supportingPages.push(page.url); group.scores.push(page.score.total); }
  }
  return groups.map(group => ({ id: group.id, text: group.text, normalized: group.normalized, supportingPages: group.supportingPages, score: Math.round(Math.min(100, group.supportingPages.length * 18 + average(group.scores) * 0.4)), polarity: group.polarity, numbers: group.numbers }));
}
function findContradictions(claims) {
  const results = [];
  for (let i = 0; i < claims.length; i++) for (let j = i + 1; j < claims.length; j++) {
    const a = claims[i], b = claims[j]; const semanticSimilarity = similarity(contradictionKey(a.text), contradictionKey(b.text)); if (semanticSimilarity < 0.45) continue;
    const factors = scoreContradiction(a, b, semanticSimilarity); if (factors.total < 35) continue;
    results.push({ claimA: a, claimB: b, score: factors.total, strength: factors.level, type: factors.type, factors, summary: formatContradiction(a, b, factors) });
  }
  return removeDuplicateContradictions(results).sort((a, b) => b.score - a.score);
}
function scoreContradiction(a, b, similarityScore) {
  let score = 0; const reasons = []; const subjectScore = Math.round(Math.min(20, similarityScore * 20)); score += subjectScore;
  const explicitNegation = hasOppositeNegation(a.text, b.text); if (explicitNegation) { score += 25; reasons.push("opposite negation"); }
  const polarityConflict = a.polarity !== "neutral" && b.polarity !== "neutral" && a.polarity !== b.polarity; if (polarityConflict) { score += 20; reasons.push("opposing polarity"); }
  const numericConflict = haveConflictingNumbers(a.numbers, b.numbers); if (numericConflict) { score += 25; reasons.push("different numeric values"); }
  const sourceIndependence = sourceIndependenceScore(a, b); score += sourceIndependence; if (sourceIndependence >= 8) reasons.push("independent sources");
  const directness = Math.round((claimDirectness(a.text) + claimDirectness(b.text)) / 2); score += directness; if (directness >= 8) reasons.push("direct assertions");
  const scopePenalty = scopeMismatchPenalty(a.text, b.text); score -= scopePenalty; if (scopePenalty > 0) reasons.push("possible scope mismatch");
  score = Math.max(0, Math.min(100, score)); return { total: score, level: contradictionLevel(score), type: getContradictionType({ explicitNegation, polarityConflict, numericConflict }), reasons, subjectScore, explicitNegation, polarityConflict, numericConflict, sourceIndependence, directness, scopePenalty };
}
function contradictionLevel(score) { if (score >= 80) return "very strong"; if (score >= 65) return "strong"; if (score >= 50) return "moderate"; return "weak"; }
function getContradictionType(flags) { if (flags.numericConflict) return "numeric"; if (flags.explicitNegation) return "explicit negation"; if (flags.polarityConflict) return "polarity"; return "semantic"; }
function claimPolarity(text) {
  const positive = ["benefit","benefits","effective","improve","improves","safe","support","supports","increase","increases"]; const negative = ["harm","harms","risk","risky","danger","dangerous","ineffective","worsen","worsens","decrease","decreases"]; const value = normalizeText(text); const positiveCount = positive.filter(word => value.includes(word)).length; const negativeCount = negative.filter(word => value.includes(word)).length; if (positiveCount > negativeCount) return "positive"; if (negativeCount > positiveCount) return "negative"; return "neutral";
}
function sourceIndependenceScore(a, b) { const domainsA = new Set(a.supportingPages.map(getDomain)); const domainsB = new Set(b.supportingPages.map(getDomain)); return [...domainsA].some(domain => !domainsB.has(domain)) ? 10 : 2; }
function claimDirectness(text) { const hedgingWords = ["may","might","could","possibly","appears","suggests","likely","perhaps","unclear","preliminary"]; const count = hedgingWords.filter(word => new RegExp(`\\b${word}\\b`, "i").test(text)).length; if (count >= 3) return 0; if (count === 2) return 3; if (count === 1) return 6; return 10; }
function scopeMismatchPenalty(textA, textB) { const scopeTerms = ["children","adults","elderly","men","women","patients","animals","mice","in vitro","in humans","in the united states","in europe","2020","2021","2022","2023","2024","2025","2026"]; const a = normalizeText(textA), b = normalizeText(textB); let differences = 0; for (const term of scopeTerms) if (a.includes(term) !== b.includes(term)) differences++; return Math.min(15, differences * 3); }
function hasOppositeNegation(textA, textB) { const negations = ["not","no","never","cannot","cant","doesnt","isnt","arent","without"]; const a = normalizeText(textA), b = normalizeText(textB); const aNegated = negations.some(word => a.includes(` ${word} `)); const bNegated = negations.some(word => b.includes(` ${word} `)); return aNegated !== bNegated; }
function extractNumbers(text) { return [...text.matchAll(/\b\d+(?:[.,]\d+)?\s*(?:%|percent|years?|months?|days?|kg|km|mg|million|billion)?\b/gi)].map(match => match[0].toLowerCase()); }
function haveConflictingNumbers(a, b) { if (!a.length || !b.length) return false; const valuesA = a.map(parseNumericValue), valuesB = b.map(parseNumericValue); return valuesA.some(valueA => valuesB.some(valueB => Number.isFinite(valueA) && Number.isFinite(valueB) && valueA !== valueB && Math.abs(valueA - valueB) / Math.max(Math.abs(valueA), 1) > 0.2)); }
function parseNumericValue(value) { const match = value.match(/\d+(?:\.\d+)?/); return match ? Number(match[0]) : NaN; }
function formatContradiction(a, b, factors) { return [`[${factors.level.toUpperCase()} — ${factors.total}/100]`, `Claim A: "${a.text}"`, `Claim B: "${b.text}"`, `Reasons: ${factors.reasons.join(", ")}`].join(" | "); }
function calculateConfidence(claims, pageCount, contradictionCount) { if (!claims.length || !pageCount) return 0; const supportScore = Math.min(60, claims.reduce((sum, claim) => sum + claim.supportingPages.length * 8, 0)); const qualityScore = Math.min(30, average(claims.map(claim => claim.score)) * 0.3); const coverageScore = Math.min(10, pageCount); const contradictionPenalty = Math.min(45, contradictionCount * 12); return Math.round(Math.max(0, Math.min(100, supportScore + qualityScore + coverageScore - contradictionPenalty))); }
function similarity(a, b) { const wordsA = new Set(words(a)), wordsB = new Set(words(b)); const intersection = [...wordsA].filter(word => wordsB.has(word)).length; const union = new Set([...wordsA, ...wordsB]).size; return union ? intersection / union : 0; }
function contradictionKey(text) { return normalizeText(text).replace(/\b(not|no|never|cannot|cant|doesnt|isnt|arent|without)\b/g, "").replace(/\b\d+(?:[.,]\d+)?\b/g, "number"); }
function normalizeClaim(text) { return normalizeText(text).replace(/\b\d+(?:[.,]\d+)?\b/g, "number").slice(0, 500); }
function words(text) { return stopword.removeStopwords(tokenizer.tokenize(String(text).toLowerCase())).filter(word => word.length > 2 && /^[a-z0-9]+$/i.test(word)); }
function cleanText(text) { return text.replace(/\s+/g, " ").replace(/[^\p{L}\p{N}\s.,!?"'():;%-]/gu, "").trim(); }
function normalizeText(text) { return String(text).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim(); }
function normalizeUrl(url) { try { const parsed = new URL(url); parsed.hash = ""; parsed.search = ""; return parsed.toString().replace(/\/$/, ""); } catch { return ""; } }
function normalizeDate(value, jsonLd = []) { if (value) return value; for (const item of jsonLd) { const objects = Array.isArray(item) ? item : [item]; for (const object of objects) if (object?.datePublished) return object.datePublished; } return ""; }
function getDomain(url) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } }
function average(values) { if (!values.length) return 0; return values.reduce((sum, value) => sum + value, 0) / values.length; }
function removeDuplicateContradictions(items) { const strongest = new Map(); for (const item of items) { const key = [item.claimA.id, item.claimB.id].sort().join(":"); if (!strongest.has(key) || item.score > strongest.get(key).score) strongest.set(key, item); } return [...strongest.values()]; }
function removePrivatePageData(page) { const { text, ...safePage } = page; return safePage; }

export async function evidenceSearch(question, { maxResults = 10 } = {}) {
  const query = String(question || "").trim();
  if (!query) throw new Error("Enter a question.");
  if (query.length > 500) throw new Error("Questions must be 500 characters or fewer.");
  const searchResults = await searchDuckDuckGo(query);
  const uniqueResults = removeDuplicateResults(searchResults).slice(0, Math.max(1, Math.min(10, Number(maxResults) || 10)));
  const pages = await inspectPages(uniqueResults, query);
  const report = createReport(query, pages);
  return { question: query, ...report, pages: pages.map(removePrivatePageData), results: uniqueResults, verifiedSources: pages.filter(page => page.text).map(({ text, ...page }) => page) };
}
