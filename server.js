import 'dotenv/config';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { UltimateAssistant } from './engine/ultimate-assistant.js';
import { duckduckgoSearch } from './engine/duckduckgo.js';
import { generateArtifacts } from './engine/file-generator.js';
import { localBrain } from './engine/local-brain.js';
import { replicate } from './engine/replicated-engine.js';
import { binaryReplacement, binaryReplacementStatus } from './engine/binary-replacement.js';
import { largeJavaScriptLM, LARGE_JS_LM_PARAMETER_CAPACITY } from './engine/large-js-lm.js';
import { largeJSChat } from './engine/large-js-chat.js';
import { tonyAIProvider } from './engine/tonyai-provider.js';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||3000);
const assistant=new UltimateAssistant();
const json=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','connection':'keep-alive'});res.end(JSON.stringify(body));};
async function body(req){let s='';for await(const c of req)s+=c;if(!s)return {};if(s.length>20_000_000)throw new Error('Request body too large');return JSON.parse(s);}
function materializeChatArtifacts(result){const files=Array.isArray(result?.files)?result.files.filter(f=>f&&typeof f.filename==='string'&&typeof f.content==='string').slice(0,50):[];if(!files.length)return result;return {...result,artifacts:{...(result.artifacts||{}),...generateArtifacts({files,zip:result.zip===true||files.length>1,zipName:result.zipName||'tony-generated-files.zip'})}};}
async function textAsset(res,file){const js=await readFile(path.join(root,'engine',file),'utf8');res.writeHead(200,{'content-type':'text/javascript; charset=utf-8','cache-control':'public, max-age=31536000, immutable','content-encoding':'identity','connection':'keep-alive'});return res.end(js);}
async function handler(req,res){try{
 if(req.method==='POST'&&req.url==='/api/chat')return json(res,200,materializeChatArtifacts(await largeJSChat(await body(req),assistant)));
 if(req.method==='POST'&&req.url==='/api/replica')return json(res,200,replicate(await body(req)));
 if(req.method==='POST'&&req.url==='/api/binary-replacement')return json(res,200,binaryReplacement(await body(req)));
 if(req.method==='POST'&&req.url==='/api/local-chat'){const b=await body(req);return json(res,200,localBrain.answer(b.message||''));}
 if(req.method==='POST'&&req.url==='/api/large-js-chat'){const b=await body(req);return json(res,200,await largeJSChat(b,assistant));}
 if(req.method==='POST'&&req.url==='/api/large-js-learn'){const b=await body(req);return json(res,200,largeJavaScriptLM.learn(b.text||'',b.options||{}));}
 if(req.method==='POST'&&req.url==='/api/large-js-knowledge'){const b=await body(req);return json(res,200,{entries:largeJavaScriptLM.addKnowledge(b.entries||[]),stats:largeJavaScriptLM.stats()});}
 if(req.method==='POST'&&req.url==='/api/image')return json(res,200,tonyAIProvider.generateImage(await body(req)));
 if(req.method==='POST'&&req.url==='/api/search'){const b=await body(req);if(!b.query)return json(res,400,{error:'query is required'});return json(res,200,await duckduckgoSearch(b.query,{maxResults:b.maxResults||8,region:b.region||process.env.DUCKDUCKGO_REGION||'wt-wt',safeSearch:b.safeSearch||process.env.DUCKDUCKGO_SAFESEARCH||'moderate'}));}
 if(req.method==='POST'&&req.url==='/api/files'){const b=await body(req);const files=Array.isArray(b.files)?b.files:[];if(!files.length)return json(res,400,{error:'files array is required'});if(files.length>50)return json(res,400,{error:'Maximum 50 files per artifact request'});return json(res,200,generateArtifacts({files,zip:b.zip===true,zipName:b.zipName||'tony-downloads.zip'}));}
 if(req.method==='GET'&&req.url==='/api/capabilities')return json(res,200,{...assistant.capabilities(),functionalReplica:true,binaryReplacement:binaryReplacementStatus(),localBrain:true,localLanguageModel:true,largeJavaScriptLM:true,largeJavaScriptLMParameters:LARGE_JS_LM_PARAMETER_CAPACITY,largeJavaScriptLMParameterMode:'virtual-sparse-capacity',largeJavaScriptLMPrimaryBackbone:'pure-javascript',largeJavaScriptLMPretrainedRequired:false,largeJavaScriptLMExternalNeuralModel:false,largeJavaScriptLMExternalGenerationAPI:false,openAIRequired:false,provider:tonyAIProvider.capabilities(),pureJavaScriptMode:true,externalSearchEnabled:true,externalImageGenerationEnabled:true,chatPrimary:'large-js-primary',chatToolOrchestration:true,performance:{keepAlive:true,immutableEngineAssets:true,cachedInferenceHotPaths:true}});
 if(req.method==='GET'&&req.url==='/api/large-js-stats')return json(res,200,largeJavaScriptLM.stats());
 if(req.method==='GET'&&req.url==='/runtime.js')return textAsset(res,'web-runtime.js');
 if(req.method==='GET'&&req.url==='/engine/neural-training-data.js')return textAsset(res,'neural-training-data.js');
 if(req.method==='GET'&&req.url==='/engine/neural-language-model.js')return textAsset(res,'neural-language-model.js');
 if(req.method==='GET'&&req.url==='/engine/large-js-lm.js')return textAsset(res,'large-js-lm.js');
 if(req.method==='GET'&&req.url==='/engine/large-js-chat.js')return textAsset(res,'large-js-chat.js');
 if(req.method==='GET'&&req.url==='/engine/tonyai-provider.js')return textAsset(res,'tonyai-provider.js');
 if(req.method==='GET'&&(req.url==='/'||req.url==='/index.html')){const html=await readFile(path.join(root,'index.html'),'utf8');const runtime=await readFile(path.join(root,'engine','web-runtime.js'),'utf8');const local=await readFile(path.join(root,'engine','local-brain.js'),'utf8');const large=await readFile(path.join(root,'engine','large-js-lm.js'),'utf8');const injected=`<script>${runtime}</script><script>${local}</script><script type="module">${large}</script>`;res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'public, max-age=60','connection':'keep-alive'});return res.end(html.replace('</body>',`${injected}</body>`));}
 if(req.method==='GET'&&req.url==='/health')return json(res,200,{ok:true,service:'TONY',pureJavaScriptMode:true,largeJavaScriptLM:true,largeJavaScriptLMParameters:LARGE_JS_LM_PARAMETER_CAPACITY,largeJavaScriptLMParameterMode:'virtual-sparse-capacity',largeJavaScriptLMPrimaryBackbone:'pure-javascript',largeJavaScriptLMPretrainedRequired:false,largeJavaScriptLMExternalNeuralModel:false,externalSearchEnabled:true,externalImageGenerationEnabled:true,openAIRequired:false,provider:tonyAIProvider.capabilities(),chatPrimary:'large-js-primary',performance:{keepAlive:true,immutableEngineAssets:true,cachedInferenceHotPaths:true}});
 return json(res,404,{error:'Not found'});
}catch(e){return json(res,500,{error:String(e.message||e)});}}
const server=http.createServer({keepAlive:true,headersTimeout:10000,requestTimeout:30000},handler);server.keepAliveTimeout=5000;server.listen(port,()=>console.log(`TONY Ultimate AI listening on http://localhost:${port}`));process.on('SIGINT',async()=>{await assistant.close();process.exit(0)});process.on('SIGTERM',async()=>{await assistant.close();process.exit(0)});
