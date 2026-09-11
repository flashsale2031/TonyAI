// Functional replica layer for the supplied next-level data-entry assistant.
// This does not reproduce opaque model weights; it reproduces observable capabilities
// with deterministic JavaScript modules already shipped in TONY.
import { localTools } from './local-tools.js';
import { localIntents } from './local-intents.js';
import { localLanguage } from './local-language.js';
import { localCode } from './local-code.js';
import { localData } from './local-data.js';

const clean=s=>String(s??'').trim();
const fenced=(s)=>{const m=clean(s).match(/```(?:[\w+-]+)?\n([\s\S]*?)```/);return m?m[1]:clean(s)};
const after=(s,re)=>{const m=clean(s).match(re);return m?m[1].trim():''};

function calculator(text){
  const expr=after(text,/^(?:calculate|compute|what is)\s+(.+)$/i);
  if(!expr)return null;
  try{return {reply:`${expr} = ${localTools.calculator(expr)}`,operation:'calculator',confidence:0.99};}
  catch{return null;}
}
function summarizer(text){
  if(!/\b(summarize|summary|tl;dr)\b/i.test(text))return null;
  const body=after(text,/^(?:please\s+)?(?:summarize|summary|tl;dr)\s*[:\-]?\s*([\s\S]*)$/i)||text;
  return {reply:localLanguage.summarize(body,5),operation:'summarize',confidence:.94};
}
function codeAnalysis(text){
  if(!/\b(?:lint|analy[sz]e|inspect|check)\b.*\bcode\b|\b(?:lint|debug)\b/i.test(text))return null;
  const code=fenced(text);const language=localCode.detectLanguage(code);const stats=localCode.stats(code);const issues=localCode.lint(code,language);const todos=localCode.findTODOs(code);
  return {reply:`Language: ${language}\nLines: ${stats.lines}\nCharacters: ${stats.characters}\nIssues: ${issues.length?issues.map(x=>`L${x.line}: ${x.message}`).join('; '):'none'}${todos.length?`\nTODOs: ${todos.length}`:''}`,operation:'code-analysis',confidence:.93};
}
function textUtilities(text){
  if(/\bword count\b/i.test(text))return {reply:JSON.stringify(localTools.wordCount(text),null,2),operation:'word-count',confidence:.99};
  if(/^reverse\s*:/i.test(text))return {reply:localTools.reverse(after(text,/^reverse\s*:\s*([\s\S]*)$/i)),operation:'reverse',confidence:.99};
  if(/^slug\s*:/i.test(text))return {reply:localTools.slug(after(text,/^slug\s*:\s*([\s\S]*)$/i)),operation:'slug',confidence:.99};
  return null;
}
function dataStats(text){
  const m=text.match(/(?:statistics|stats)\s*:\s*([\d\s,.;-]+)/i);if(!m)return null;
  const values=m[1].split(/[\s,;]+/).filter(Boolean);return {reply:JSON.stringify(localData.statistics(values),null,2),operation:'statistics',confidence:.99};
}
function general(text){
  const intent=localIntents.detectIntent(text);
  return {reply:`I can handle this locally as a ${intent.name} task, but the request needs a language model for a reliable free-form answer.`,operation:'router',confidence:.55,requiresModel:true,intent};
}

export function replicate(input,{allowModel=true}={}){
  const text=clean(typeof input==='string'?input:input?.message);
  if(!text)throw new Error('Message is required');
  for(const fn of [calculator,summarizer,codeAnalysis,textUtilities,dataStats]){const result=fn(text);if(result)return {...result,intent:localIntents.detectIntent(text),redacted:localLanguage.redactSecrets(text)};}
  const result=general(text);
  return {...result,allowModel};
}

export const replicatedEngine=Object.freeze({version:'1.0.0',replicate,capabilities:['intent-routing','calculator','summarization','text-utilities','code-analysis','data-statistics','secret-redaction']});
if(typeof window!=='undefined')window.TONYReplicatedEngine=replicatedEngine;
