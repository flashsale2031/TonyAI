import 'dotenv/config';
export async function llmJSON({system,user,schemaHint}) {
  const base=(process.env.OPENAI_BASE_URL||'https://api.openai.com/v1').replace(/\/$/,'');
  const key=process.env.OPENAI_API_KEY;
  if(!key) throw new Error('OPENAI_API_KEY is required');
  const res=await fetch(`${base}/chat/completions`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${key}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5',temperature:0,response_format:{type:'json_object'},messages:[{role:'system',content:system},{role:'user',content:`${user}\n\nReturn JSON only. Shape guidance: ${schemaHint}`} ]})});
  if(!res.ok) throw new Error(`LLM HTTP ${res.status}: ${await res.text()}`);
  const data=await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content||'{}');
}
