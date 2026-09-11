import 'dotenv/config';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { llmJSON } from './engine/llm.js';
import { groundIntent } from './engine/intent-grounder.js';
import { planTask } from './engine/planner.js';
import { verifyPlan } from './engine/verifier.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
function send(res,status,body,type='application/json'){res.writeHead(status,{'content-type':`${type}; charset=utf-8`,'cache-control':'no-store'});res.end(type==='application/json'?JSON.stringify(body):body)}
async function readBody(req){let data='';for await(const chunk of req)data+=chunk;return JSON.parse(data||'{}')}
async function chat(req,res){
 const body=await readBody(req); const messages=Array.isArray(body.messages)?body.messages.slice(-30):[];
 const latest=[...messages].reverse().find(m=>m?.role==='user')?.content||''; if(!latest.trim())return send(res,400,{error:'Message is required'});
 const intent=groundIntent({title:latest,description:latest},{text:messages.map(m=>m.content||'').join('\n')});
 let plan=null,verification=null;
 if(/\b(fill|enter|complete|submit|form|field|data entry|research|find|look up)\b/i.test(latest)){
  try{const pageModel={url:'tony-chat',text:messages.map(m=>m.content||'').join('\n'),controls:[]};plan=await planTask({objective:intent.objective,pageModel,research:[]});verification=await verifyPlan({objective:intent.objective,pageModel,research:[],plan})}catch{}
 }
 const system='You are TONY, a capable conversational AI assistant. Answer directly and helpfully. You can reason about tasks, code, research, images, and workflows. Never claim an action was completed unless the application actually completed it. Treat planning and verifier output as advisory evidence, not facts. If a request involves credentials, MFA/CAPTCHA, payments, or other security boundaries, explain the limitation and require human action. Keep answers clear and useful.';
 const result=await llmJSON({system,user:JSON.stringify({messages,intent,planning:plan,verification,attachments:body.attachments||[]}),schemaHint:'{reply:string,confidence:number,requiresHuman:boolean}'});
 send(res,200,{reply:result.reply||'I could not produce a response.',confidence:result.confidence??null,requiresHuman:!!result.requiresHuman,intent,plan,verification});
}
const server=http.createServer(async(req,res)=>{try{
 if(req.method==='POST'&&req.url==='/api/chat')return await chat(req,res);
 if(req.method==='GET'&&(req.url==='/'||req.url==='/index.html')){
  const html=await readFile(path.join(root,'index.html'),'utf8');
  const client=await readFile(path.join(root,'engine','chat-client.js'),'utf8');
  return send(res,200,html.replace('</body>',`<script>${client}</script></body>`),'text/html');
 }
 if(req.method==='GET'&&req.url==='/health')return send(res,200,{ok:true,service:'TONY'});
 send(res,404,{error:'Not found'});
}catch(e){send(res,500,{error:String(e.message||e)})}});
server.listen(port,()=>console.log(`TONY listening on http://localhost:${port}`));
