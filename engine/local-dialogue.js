// Rule/template based dialogue generator. This expands useful natural-language responses
// without pretending to be a pretrained LLM.
const clean=s=>String(s??'').trim();
const cap=s=>{const x=clean(s);return x?x[0].toUpperCase()+x.slice(1):x};
const stripLead=(s,re)=>clean(s).replace(re,'').trim();
export class LocalDialogue {
  constructor(){this.templates=new Map();}
  register(intent,templates){this.templates.set(intent,[...templates]);return this;}
  choose(intent,data={}){const list=this.templates.get(intent)||[];if(!list.length)return null;const i=(String(data.input||'').length+(data.seed||0))%list.length;return list[i](data);}
  respond(input,context={}){
    const text=clean(input), lower=text.toLowerCase();
    if(/^(hi|hello|hey|yo|good morning|good afternoon|good evening)\b/.test(lower))return 'Hello — I’m TONY. What would you like to work on?';
    if(/^(thanks|thank you|thx)\b/.test(lower))return 'You’re welcome. I’m ready for the next task.';
    if(/^(bye|goodbye|see you)\b/.test(lower))return 'See you next time.';
    if(/\b(help|what can you do|capabilities)\b/.test(lower))return 'I can calculate, analyze structured data, inspect and transform code, summarize text, generate files, create procedural graphics, retrieve current web information, and run configured workflows locally.';
    if(/\b(explain|define|meaning of|what does)\b/.test(lower))return `I can break that down step by step. The topic you gave me is: ${cap(text.replace(/^.*?\b(explain|define|meaning of|what does)\b/i,''))}.`;
    if(/\b(summarize|summary|tl;dr)\b/.test(lower))return 'I can summarize the supplied text locally using extractive ranking. Paste or attach the material to summarize.';
    if(/\b(rewrite|rephrase|paraphrase|proofread)\b/.test(lower))return 'I can prepare a local text transformation workflow. Provide the text plus the target tone or format.';
    if(/\b(compare|comparison|versus|vs\.?\b)/.test(lower))return 'I can compare structured facts locally. Give me the two or more items and the criteria you want compared.';
    if(/\b(plan|planning|roadmap|steps)\b/.test(lower))return `A practical local planning pattern is: define the objective, split it into verifiable steps, execute independent steps, validate the outputs, then package the result. Objective: ${text}.`;
    if(context.intent)return `I routed this as ${context.intent}. I can handle the deterministic parts locally and use a configured specialist only when open-ended generation is actually needed.`;
    return `I can process “${text}” locally when the task has a deterministic or structured solution. If it needs broad language generation, a model provider may still be needed.`;
  }
}
export const localDialogue=new LocalDialogue();
if(typeof window!=='undefined')window.TONYLocalDialogue=localDialogue;
