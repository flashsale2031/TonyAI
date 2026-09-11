// Lightweight offline intent router. Keeps common tasks out of paid model calls.
const rules=[
 ['calculator',/^(calculate|compute|what is)\s+[-+*/%0-9().\s]+$/i],
 ['summarize',/\b(summarize|summary|tl;dr)\b/i],
 ['rewrite',/\b(rewrite|rephrase|paraphrase|proofread)\b/i],
 ['translate',/\b(translate|translation)\b/i],
 ['code',/\b(write|generate|fix|debug)\s+(a|the)?\s*(javascript|typescript|python|html|css|sql|code)\b/i],
 ['web',/\b(latest|today|current|news|price|weather|recent|online|look up|search|research)\b/i],
 ['file',/\b(create|make|generate|download)\s+(a|an|the)?\s*(file|document|csv|json|html|zip)\b/i],
 ['image',/\b(generate|create|make|draw|edit)\s+(an?\s+)?(image|picture|logo|icon|illustration)\b/i]
];
export function detectIntent(input){const text=String(input??'').trim();for(const [name,re] of rules)if(re.test(text))return {name,local:true};return {name:'general',local:false};}
export function shouldUseModel(input){return detectIntent(input).name==='general';}
export const localIntents=Object.freeze({detectIntent,shouldUseModel,rules});
if(typeof window!=='undefined')window.TONYLocalIntents=localIntents;
