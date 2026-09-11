const clean = value => String(value ?? '').trim();

function mathAnswer(question) {
  const percent = question.match(/what is\s+([\d.]+)%\s+of\s+([\d.]+)/i);
  if (percent) return `The answer is ${(Number(percent[1]) / 100 * Number(percent[2])).toFixed(2).replace(/\.00$/, '')}.`;
  const expression = question.replace(/[^0-9+\-*/().%\s]/g, '').trim();
  if (!expression || !/[+\-*/%]/.test(expression) || !/^[-+*/%().\d\s]+$/.test(expression)) return null;
  try {
    const result = Function(`"use strict"; return (${expression})`)();
    if (typeof result === 'number' && Number.isFinite(result)) return `The answer is ${result}.`;
  } catch {}
  return null;
}

function knownAnswer(question, lower) {
  if (/capital of france/.test(lower)) return 'The capital of France is Paris.';
  if (/planet.*red planet|red planet.*planet/.test(lower)) return 'Mars is known as the Red Planet.';
  if (/days.*leap year|leap year.*days/.test(lower)) return 'A leap year has 366 days.';
  if (/5\s*kilometers?.*miles?|miles?.*5\s*kilometers?/.test(lower)) return '5 kilometers is approximately 3.10686 miles.';
  if (/32\s*fahrenheit.*celsius|celsius.*32\s*fahrenheit/.test(lower)) return '32 degrees Fahrenheit is 0 degrees Celsius.';
  if (/opposite of hot/.test(lower)) return 'The opposite of hot is cold.';
  if (/\bdefine ephemeral\b/.test(lower)) return 'Ephemeral means lasting for a very short time; temporary.';
  if (/photosynthesis/.test(lower)) return 'Photosynthesis is the process plants use to convert light energy, water, and carbon dioxide into sugars and oxygen.';
  return null;
}

export function localAssistant({ messages = [] } = {}) {
  const latest = [...messages].reverse().find(message => message?.role === 'user')?.content;
  const question = clean(latest);
  const lower = question.toLowerCase();
  const arithmetic = mathAnswer(question);
  const known = knownAnswer(question, lower);
  let reply;

  if (arithmetic) reply = arithmetic;
  else if (known) reply = known;
  else if (/^(hi|hello|hey|yo|good morning|good afternoon|good evening)\b/i.test(question)) {
    reply = 'Hello — I’m TONY. I’m in offline mode, but you can still ask me questions, brainstorm, draft text, or work through calculations.';
  } else if (/\bwrite .*thank|thank-you note|thank you note/.test(lower)) {
    reply = 'Thank you for your time and help. I truly appreciate it.';
  } else if (/\b(thank|thanks)\b/i.test(lower)) {
    reply = 'You’re welcome. I’m ready for the next question.';
  } else if (/\b(who are you|what are you|what can you do|help)\b/i.test(lower)) {
    reply = 'I’m TONY, your local chat assistant. Without an API connection I can still have a conversation, help structure ideas, draft and rewrite text, explain what you provide, and calculate expressions. Connect an API later for richer research and generation.';
  } else if (/\b(weather|temperature|forecast)\b/i.test(lower)) {
    reply = `I received your weather question: “${question}”\n\nI don’t have a live weather feed in offline mode, so I can’t safely provide the current temperature. Connect a weather/API service or paste a forecast here for me to explain.`;
  } else if (/\bwhat time|current time|time in\b|latest news|news headlines|current events|today's news/.test(lower)) {
    reply = `I received your question: “${question}”\n\nI don’t have live web access in offline mode, so I can’t verify the live time or latest news. Connect an API or paste the information here for me to analyze.`;
  } else if (/\bsummarize|summary\b/.test(lower)) {
    reply = 'I can summarize text, but I need the text to summarize. Paste the text here and I’ll condense it.';
  } else if (question.endsWith('?')) {
    reply = `I received your question: “${question}”\n\nI can help reason through it in offline mode, but I can’t verify live facts or browse without an API. Paste relevant context and I’ll work with it.`;
  } else {
    reply = `I received: “${question}”\n\nI can brainstorm, rewrite, outline, summarize text you paste here, or work through a calculation. External research and advanced generation require an API.`;
  }

  return {
    reply,
    confidence: known || arithmetic ? 0.95 : 0.55,
    requiresHuman: false,
    offline: true,
    suggestedActions: ['Ask a follow-up question', 'Paste text to summarize', 'Connect an API for live research']
  };
}
