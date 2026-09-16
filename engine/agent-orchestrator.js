import { performance } from 'node:perf_hooks';

const MAX_STEPS = 8;
const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const has = (text, pattern) => pattern.test(text);

function classify(query) {
  const text = clean(query).toLowerCase();
  if (has(text, /\b(debug|diagnose|fix|repair|broken|error|failing|not working|inspect|trace|test)\b/)) return 'diagnostic';
  if (has(text, /\b(build|create|make|generate|write|design)\b/) && has(text, /\b(html|css|javascript|svg|document|calculator)\b/)) return 'artifact';
  if (has(text, /\b(image|picture|pixel|pixelation|canvas)\b/)) return 'image';
  if (has(text, /\b(search|find|who|what|when|where|why|how)\b/)) return 'research';
  return 'chat';
}

function planFor(intent) {
  const common = ['classify request', 'inspect available capabilities', 'select a bounded execution path'];
  if (intent === 'diagnostic') return [...common, 'collect diagnostics', 'reproduce or inspect the reported failure', 'propose a targeted recovery', 'verify available results', 'report limitations'];
  if (intent === 'artifact') return [...common, 'validate requested artifact format', 'generate bounded artifact files', 'validate generated content', 'return preview and download metadata'];
  if (intent === 'image') return [...common, 'select procedural image capability', 'validate prompt and output format', 'generate image artifact or explain unavailable provider', 'verify output metadata'];
  if (intent === 'research') return [...common, 'query configured search capability', 'inspect returned evidence', 'extract a concise answer', 'attach sources and uncertainty'];
  return [...common, 'run deterministic local response capability', 'verify response shape', 'report result'];
}

function validateArtifactFiles(files) {
  if (!Array.isArray(files) || files.length === 0) throw new Error('No artifact files were produced');
  if (files.length > 50) throw new Error('Artifact limit exceeded');
  for (const file of files) {
    if (!file || typeof file.filename !== 'string' || typeof file.content !== 'string') throw new Error('Invalid artifact file');
    if (file.filename.includes('..') || file.filename.startsWith('/')) throw new Error('Unsafe artifact filename');
  }
  return true;
}

export async function orchestrateRequest({ query, capabilities = {}, actions = {} } = {}) {
  const started = performance.now();
  const text = clean(query);
  if (!text) throw new Error('query is required');
  const intent = classify(text);
  const plan = planFor(intent).slice(0, MAX_STEPS);
  const steps = [];
  const add = (name, status, detail = '') => steps.push({ name, status, detail });
  add(plan[0], 'complete', intent);
  add(plan[1], 'complete', Object.keys(capabilities).filter(Boolean));
  add(plan[2], 'complete', plan.length);

  let result = { intent, answer: '', files: [], sources: [], diagnostics: null, status: 'incomplete' };
  try {
    if (intent === 'diagnostic') {
      result.diagnostics = await actions.diagnostics?.() ?? { available: false, message: 'Diagnostics capability is not connected' };
      add(plan[3], 'complete');
      add(plan[4], 'complete', 'Bounded diagnostics only; no arbitrary shell execution');
      add(plan[5], 'complete');
      result.answer = 'Diagnostic workflow completed. Review the diagnostic report and apply only verified changes.';
    } else if (intent === 'artifact') {
      const generated = await actions.artifact?.(text);
      if (!generated) throw new Error('Artifact generator is not connected');
      validateArtifactFiles(generated.files || []);
      result = { ...result, ...generated, status: 'complete' };
      add(plan[3], 'complete'); add(plan[4], 'complete'); add(plan[5], 'complete');
    } else if (intent === 'image') {
      const generated = await actions.image?.(text);
      if (!generated) throw new Error('Image generation capability is not connected');
      result = { ...result, ...generated, status: 'complete' };
      add(plan[3], 'complete'); add(plan[4], 'complete');
    } else if (intent === 'research') {
      const researched = await actions.search?.(text);
      if (!researched) throw new Error('Search capability is not connected');
      result = { ...result, ...researched, status: 'complete' };
      add(plan[3], 'complete'); add(plan[4], 'complete'); add(plan[5], 'complete');
    } else {
      const response = await actions.chat?.(text);
      result = { ...result, ...(response || {}), status: 'complete' };
      add(plan[3], 'complete'); add(plan[4], 'complete');
    }
  } catch (error) {
    add(plan[Math.min(3, plan.length - 1)], 'failed', String(error?.message || error));
    result.status = 'failed';
    result.error = String(error?.message || error);
    result.answer = 'The requested workflow could not be completed. No fabricated result was substituted.';
  }
  return { ...result, intent, plan, steps, elapsedMs: Math.round(performance.now() - started), maxSteps: MAX_STEPS };
}
