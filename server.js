import 'dotenv/config';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { UltimateAssistant } from './engine/ultimate-assistant.js';

const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||3000);
const assistant=new UltimateAssistant();
const json=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(body));};
async function body(req){let s='';for await(const c of req)s+=c;if(!s)return {};return JSON.parse(s);}
async function generateImage(input){
  const key=process.env.OPENAI_API_KEY;if(!key)throw new Error('OPENAI_API_KEY is required for image generation');
  const base=(process.env.OPENAI_BASE_URL||'https://api.openai.com/v1').replace(/\/$/,'');
  const payload={model:process.env.OPENAI_IMAGE_MODEL||'gpt-image-2',prompt:String(input.prompt||''),size:input.size||'1024x1024',quality:input.quality||'auto',background:input.background||'auto',output_format:input.output_format||'png'};
  const r=await fetch(`${base}/images/generations`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${key}`},body:JSON.stringify(payload)});
  const d=await r.json();if(!r.ok)throw new Error(d?.error?.message||`Image generation failed (${r.status})`);
  const item=d?.data?.[0];if(!item?.b64_json)throw new Error('Image provider returned no image data');
  return {image:`data:image/${payload.output_format};base64,${item.b64_json}`,model:payload.model,size:payload.size,quality:payload.quality,background:payload.background};
}
async function handler(req,res){
  try{
    if(req.method==='POST'&&req.url==='/api/chat')return json(res,200,await assistant.chat(await body(req)));
    if(req.method==='POST'&&req.url==='/api/image')return json(res,200,await generateImage(await body(req)));
    if(req.method==='GET'&&req.url==='/api/capabilities')return json(res,200,{...assistant.capabilities(),webRuntime:true,runtimeVersion:'2.0.0',imageGeneration:true});
    if(req.method==='GET'&&req.url==='/api/queue')return json(res,200,await assistant.queueStatus());
    if(req.method==='GET'&&req.url==='/api/audit')return json(res,200,await assistant.auditTail());
    if(req.method==='GET'&&req.url.startsWith('/api/memory'))return json(res,200,await assistant.memoryHints(new URL(req.url,'http://localhost').searchParams.get('domain')||''));
    if(req.method==='POST'&&req.url==='/api/inspect'){const b=await body(req);if(!b.url)return json(res,400,{error:'url is required'});return json(res,200,await assistant.inspect(b.url));}
    if(req.method==='POST'&&req.url==='/api/queue'){const b=await body(req);if(!b.url&&!b.title)return json(res,400,{error:'url or title is required'});return json(res,201,await assistant.enqueue(b));}
    if(req.method==='POST'&&req.url==='/api/validate'){const b=await body(req);return json(res,200,assistant.validate(b.field||{},b.value));}
    if(req.method==='POST'&&req.url==='/api/consensus'){const b=await body(req);return json(res,200,assistant.agree(b.candidates||[]));}
    if(req.method==='POST'&&req.url==='/api/recover'){const b=await body(req);if(!b.url)return json(res,400,{error:'url is required'});return json(res,200,await assistant.recover(b.url));}
    if(req.method==='GET'&&req.url==='/runtime.js'){const js=await readFile(path.join(root,'engine','web-runtime.js'),'utf8');res.writeHead(200,{'content-type':'text/javascript; charset=utf-8','cache-control':'public, max-age=3600'});return res.end(js);}
    if(req.method==='GET'&&(req.url==='/'||req.url==='/index.html')){const html=await readFile(path.join(root,'index.html'),'utf8');const runtime=await readFile(path.join(root,'engine','web-runtime.js'),'utf8');const client=await readFile(path.join(root,'engine','chat-client.js'),'utf8');const injected=`<script>${runtime}</script><script>${client}</script>`;res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});return res.end(html.replace('</body>',`${injected}</body>`));}
    if(req.method==='GET'&&req.url==='/health')return json(res,200,{ok:true,service:'TONY',version:'2.1.0',capabilities:{...assistant.capabilities(),webRuntime:true,runtimeVersion:'2.0.0',imageGeneration:true}});
    return json(res,404,{error:'Not found'});
  }catch(e){return json(res,500,{error:String(e.message||e)});}
}
const server=http.createServer(handler);
server.listen(port,()=>console.log(`TONY Ultimate AI listening on http://localhost:${port}`));
process.on('SIGINT',async()=>{await assistant.close();process.exit(0);});
process.on('SIGTERM',async()=>{await assistant.close();process.exit(0);});
