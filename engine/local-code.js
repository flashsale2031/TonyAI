// Local code assistant utilities. These are deterministic helpers, not a language model.
const lines=s=>String(s??'').split(/\r?\n/);
const ext=s=>(String(s).match(/\.([a-z0-9]+)$/i)||[])[1]?.toLowerCase()||'';
export const localCode=Object.freeze({
  detectLanguage(code,filename=''){const e=ext(filename);if(e)return ({js:'javascript',mjs:'javascript',cjs:'javascript',ts:'typescript',py:'python',html:'html',css:'css',json:'json',md:'markdown',sql:'sql',sh:'shell'})[e]||e;const s=String(code);if(/<(!doctype|html|div|body)\b/i.test(s))return'html';if(/=>|const\s+\w+\s*=|console\.log/.test(s))return'javascript';if(/def\s+\w+\(|import\s+\w+/.test(s))return'python';return'unknown';},
  stats(code){const a=lines(code);return {lines:a.length,blank:a.filter(x=>!x.trim()).length,characters:String(code??'').length,comments:a.filter(x=>/^\s*(\/\/|#|\/\*|\*)/.test(x)).length};},
  lint(code,language=''){const s=String(code),issues=[];if(/javascript|typescript/.test(language)){s.split('\n').forEach((x,i)=>{if(/console\.log\(/.test(x))issues.push({line:i+1,type:'info',message:'console.log found'});if(/\beval\s*\(/.test(x))issues.push({line:i+1,type:'warning',message:'eval can execute arbitrary code'});});}if(/json/.test(language)){try{JSON.parse(s)}catch(e){issues.push({line:1,type:'error',message:e.message})}}return issues;},
  indent(code,spaces=2){const n=Math.max(0,Number(spaces)||2);return lines(code).map(x=>x.trim()?(' '.repeat(n)+x.trim()):'').join('\n');},
  minifyJSON(code){return JSON.stringify(JSON.parse(code));},
  formatJSON(code){return JSON.stringify(JSON.parse(code),null,2);},
  extractFunctions(code,language='javascript'){if(!/javascript|typescript/.test(language))return[];return [...String(code).matchAll(/(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/g)].map(m=>({name:m[1],parameters:m[2].trim()}));},
  findTODOs(code){return lines(code).map((text,i)=>({line:i+1,text})).filter(x=>/\b(?:TODO|FIXME|HACK)\b/i.test(x.text));},
  dependencies(code){const s=String(code),out=new Set();for(const m of s.matchAll(/(?:import.*?from\s*|require\s*\()\s*['"]([^'"]+)['"]/g))out.add(m[1]);return [...out];}
});
if(typeof window!=='undefined')window.TONYLocalCode=localCode;
