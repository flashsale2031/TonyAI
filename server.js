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
async function handler(req,res){
  try{
    if(req.method==='POST'&&req.url==='/api/chat')return json(res,200,await assistant.chat(await body(req)));
    if(req.method==='GET'&&req.url==='/api/capabilities')return json(res,200,assistant.capabilities());
    if(req.method==='GET'&&req.url==='/api/queue')return json(res,200,await assistant.queueStatus());
    if(req.method==='GET'&&req.url==='/api/audit')return json(res,200,await assistant.auditTail());
    if(req.method==='GET'&&req.url.startsWith('/api/memory'))return json(res,200,await assistant.memoryHints(new URL(req.url,'http://localhost').searchParams.get('domain')||''));
    if(req.method==='POST'&&req.url==='/api/inspect'){const b=await body(req);if(!b.url)return json(res,400,{error:'url is required'});return json(res,200,await assistant.inspect(b.url));}
    if(req.method==='POST'&&req.url==='/api/queue'){const b=await body(req);if(!b.url&&!b.title)return json(res,400,{error:'url or title is required'});return json(res,201,await assistant.enqueue(b));}
    if(req.method==='POST'&&req.url==='/api/validate')return json(res,200,assistant.validate((await body(req)).field||{},(await body(req)).value));
    if(req.method==='GET'&&(req.url==='/'||req.url==='/index.html')){const html=await readFile(path.join(root,'index.html'),'utf8');const client=await readFile(path.join(root,'engine','chat-client.js'),'utf8');return void(res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}),res.end(html.replace('</body>',`<script>${client}</script></body>`)));}
    if(req.method==='GET'&&req.url==='/health')return json(res,200,{ok:true,service:'TONY',version:'1.1.0',capabilities:assistant.capabilities()});
    return json(res,404,{error:'Not found'});
  }catch(e){return json(res,500,{error:String(e.message||e)});}
}
const server=http.createServer(handler);
server.listen(port,()=>console.log(`TONY Ultimate AI listening on http://localhost:${port}`));
process.on('SIGINT',async()=>{await assistant.close();process.exit(0);});
process.on('SIGTERM',async()=>{await assistant.close();process.exit(0);});
