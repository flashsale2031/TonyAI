const CURRENT_TERMS=/\b(current|latest|today|now|recent|president|price|weather|news|schedule|stock|election|who is|what happened)\b/i;
const DETERMINISTIC_TERMS=/\b(calculate|compute|convert|statistics?|count|reverse|slug|validate|lint|analy[sz]e code|json|csv|regex)\b/i;
const ARTIFACT_TERMS=/\b(build|create|generate|write|make|design)\b.*\b(html|webpage|document|report|table|chart|file|code|script)\b/i;
const PROTECTED_TERMS=/\b(password|passcode|mfa|2fa|authentication code|private key|seed phrase|bank account|credit card|wire transfer|delete all|disable security)\b/i;
const RESEARCH_TERMS=/\b(compare|research|sources?|evidence|pros and cons|investigate|deep dive)\b/i;

function normalize(value=''){return String(value).replace(/\s+/g,' ').trim();}
function hasUrl(value){return /https?:\/\/\S+/i.test(value);}
export function routeRequest(input=''){
  const text=normalize(typeof input==='object'?input.text||input.query||'':input);
  if(!text)return {intent:'empty',risk:'none',needsClarification:true,capabilities:[],responseFormat:'text'};
  const protectedRequest=PROTECTED_TERMS.test(text);
  const deterministic=DETERMINISTIC_TERMS.test(text);
  const artifact=ARTIFACT_TERMS.test(text);
  const current=CURRENT_TERMS.test(text)||hasUrl(text);
  const research=RESEARCH_TERMS.test(text);
  let intent='conversation';
  if(protectedRequest)intent='protected-operation';
  else if(deterministic)intent='deterministic-tool';
  else if(artifact)intent='artifact-generation';
  else if(research)intent='research';
  else if(current)intent='current-information';
  const capabilities=[];
  if(intent==='protected-operation')capabilities.push('safety-boundary');
  if(intent==='deterministic-tool')capabilities.push('local-tools');
  if(intent==='artifact-generation')capabilities.push('artifact-builder');
  if(intent==='research'||intent==='current-information')capabilities.push('web-search','evidence-verification');
  if(hasUrl(text))capabilities.push('url-inspection');
  if(intent==='conversation')capabilities.push('local-dialogue');
  return {intent,risk:protectedRequest?'high':intent==='current-information'||intent==='research'?'medium':'low',needsWeb:current||research,needsClarification:text.length<2,capabilities,responseFormat:artifact?'artifact':intent==='research'?'evidence-report':'text',query:text,routeVersion:1};
}
export function explainRoute(plan){return `${plan.intent} · ${plan.capabilities.join(', ')||'none'} · ${plan.risk} risk`;}
