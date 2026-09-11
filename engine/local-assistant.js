const clean = value => String(value ?? '').trim();

function mathAnswer(question) {
  const expression = question.replace(/[^0-9+\-*/().%\s]/g, '').trim();
  if (!expression || !/[+\-*/%]/.test(expression) || !/^[-+*/%().\d\s]+$/.test(expression)) return null;
  try {
    // Limit this intentionally small evaluator to arithmetic characters only.
    const result = Function(`"use strict"; return (${expression})`)();
    if (typeof result === 'number' && Number.isFinite(result)) return `The answer is ${result}.`;
  } catch {}
  return null;
}

export function localAssistant({ messages = [] } = {}) {
  const latest = [...messages].reverse().find(message => message?.role === 'user')?.content;
  const question = clean(latest);
  const lower = question.toLowerCase();
  const arithmetic = mathAnswer(question);
  let reply;

  if (arithmetic) reply = arithmetic;
  else if (/^(hi|hello|hey|yo|good morning|good afternoon|good evening)\b/i.test(question)) {
    reply = 'Hello — I’m TONY. I’m in offline mode, but you can still ask me questions, brainstorm, draft text, or work through calculations.';
  } else if (/\b(who are you|what are you|what can you do|help)\b/i.test(lower)) {
    reply = 'I’m TONY, your local chat assistant. Without an API connection I can still have a conversation, help structure ideas, draft and rewrite text, explain what you provide, and calculate expressions. Connect an API later for richer research and generation.';
  } else if (/\b(thank|thanks)\b/i.test(lower)) {
    reply = 'You’re welcome. I’m ready for the next question.';
  } else if (question.endsWith('?')) {
    reply = `I can start working on that in offline mode. I don’t have live web or model access right now, so I can’t verify current facts, but I can help reason through the question or draft an answer from context you provide.\n\nYour question: ${question}`;
  } else {
    reply = `I’m ready to help in offline mode. I received: “${question}”\n\nI can brainstorm, rewrite, outline, summarize text you paste here, or work through a calculation. External research and advanced generation will become available when an API is connected.`;
  }

  return {
    reply,
    confidence: 0.55,
    requiresHuman: false,
    offline: true,
    suggestedActions: ['Ask a follow-up question', 'Paste text to summarize', 'Connect an API for live research']
  };
}
