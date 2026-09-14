import 'dotenv/config';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { performance } from 'node:perf_hooks';
import { UltimateAssistant } from './engine/ultimate-assistant.js';
import { duckduckgoSearch } from './engine/duckduckgo.js';
import { chatresponse } from './engine/chatresponse.js';
import { evidenceSearch } from './engine/evidence-search.js';
import { selectMostCredibleResponse } from './engine/credible-source.js';
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
const responseCache=new Map();
const evidenceCache=new Map();
const assetCache=new Map();
const pageCache=new Map();
const CACHE_MAX_AGE=31536000;
const PAGE_MAX_AGE=300;
const CHAT_TIMEOUT_MS=2000;
const CHATRESPONSE_CACHE_MS=30000;
const EVIDENCE_CACHE_MS=30000;

function compress(body,acceptEncoding){
 const source=Buffer.isBuffer(body)?body:Buffer.from(body);
 if(source.length<512)return{body:source,encoding:null};
 if(/br/i.test(acceptEncoding||''))return{body:brotliCompressSync(source,{params:{11:5}}),encoding:'br'};
 if(/gzip/i.test(acceptEncoding||''))return{body:gzipSync(source,{level:6}),encoding:'gzip'};
 return{body:source,encoding:null};
}
function send(res,status,body,headers={},req){const packed=compress(body,req?.headers?.['accept-encoding']||'');const out={...headers,'content-length':String(packed.body.length),'connection':'keep-alive'};if(packed.encoding)out['content-encoding']=packed.encoding;res.writeHead(status,out);res.end(packed.body);}
function json(res,status,body,req,cacheControl='no-store'){send(res,status,JSON.stringify(body),{'content-type':'application/json; charset=utf-8','cache-control':cacheControl},req);}
async function body(req){let s='';for await(const c of req)s+=c;if(!s)return {};if(s.length>20_000_000)throw new Error('Request body too large');return JSON.parse(s);}
function materializeChatArtifacts(result){const files=Array.isArray(result?.files)?result.files.filter(f=>f&&typeof f.filename==='string'&&typeof f.content==='string').slice(0,50):[];if(!files.length)return result;return {...result,artifacts:{...(result.artifacts||{}),...generateArtifacts({files,zip:result.zip===true||files.length>1,zipName:result.zipName||'tony-generated-files.zip'})}};}
async function asset(file){if(!assetCache.has(file))assetCache.set(file,readFile(path.join(root,'engine',file)));return assetCache.get(file);}
async function textAsset(res,file,req){const data=await asset(file);send(res,200,data,{'content-type':'text/javascript; charset=utf-8','cache-control':`public, max-age=${CACHE_MAX_AGE}, immutable`},req);}
async function page(){if(!pageCache.has('html')){const html=await readFile(path.join(root,'index.html'),'utf8');const [runtime,local,large,chatresponseClient]=await Promise.all([asset('web-runtime.js'),asset('local-brain.js'),asset('large-js-lm.js'),asset('chatresponse-client.js')]);const injected=`<script>${runtime.toString()}</script><script>${local.toString()}</script><script type="module">${large.toString()}</script><script>${chatresponseClient.toString()}</script>`;pageCache.set('html',Buffer.from(html.replace('</body>',`${injected}</body>`)));}return pageCache.get('html');}
function chatResponseCacheKey(query,options){return `${String(query||'').trim().toLowerCase()}|${Number(options?.maxResults)||12}|${options?.verify!==false}`;}
function pruneChatResponseCache(){const now=Date.now();for(const [key,value] of responseCache){if(now-value.created>CHATRESPONSE_CACHE_MS)responseCache.delete(key)}}
async function cachedChatResponse(query,options){pruneChatResponseCache();const key=chatResponseCacheKey(query,options);const hit=responseCache.get(key);if(hit)return{...hit.value,cache:'hit',cacheAgeMs:Date.now()-hit.created};let value;let primaryError='';try{value=await chatresponse(query,options);}catch(error){primaryError=String(error?.message||error);value={query:String(query||'').trim(),results:[],verifiedSources:[],confidence:0,definite:false,evidence:{},chatresponseError:primaryError};}if(!Array.isArray(value?.results)||value.results.length===0){try{const fallback=await duckduckgoSearch(query,{maxResults:options?.maxResults||8});if(Array.isArray(fallback?.results)&&fallback.results.length){const first=fallback.results[0];value={...value,answer:first.snippet||first.title,result:first,results:fallback.results,verifiedSources:[],confidence:.62,definite:false,evidence:{...(value.evidence||{}),fallbackProvider:'DuckDuckGo HTML search'},fallbackProvider:'DuckDuckGo'};}}catch(error){if(primaryError)value.chatresponseError=primaryError;}}if(!Array.isArray(value?.results)||value.results.length===0)value={...value,answer:`Live sources could not be verified for this request. Requested topic: ${String(query||'').trim()}`,result:null,results:[],verifiedSources:[],confidence:0,definite:false};responseCache.set(key,{created:Date.now(),value});return{...value,cache:'miss',cacheAgeMs:0};}
async function cachedEvidenceSearch(query,maxResults=8){const key=String(query||'').trim().toLowerCase();const hit=evidenceCache.get(key);if(hit&&Date.now()-hit.created<EVIDENCE_CACHE_MS)return{...hit.value,cache:'hit'};const value=selectMostCredibleResponse(await evidenceSearch(query,{maxResults}));evidenceCache.set(key,{created:Date.now(),value});return{...value,cache:'miss'};}
async function handler(req,res){const started=performance.now();try{
 if(req.method==='POST'&&req.url==='/api/chat'){const result=await Promise.race([largeJSChat(await body(req),assistant),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Chat request exceeded 2 second response budget')),CHAT_TIMEOUT_MS))]);return json(res,200,materializeChatArtifacts(result),req);}
 if(req.method==='POST'&&req.url==='/api/chatresponse'){const b=await body(req);if(!b.query)return json(res,400,{error:'query is required'},req);const options={maxResults:b.maxResults||12,timeoutMs:Math.min(Number(b.timeoutMs)||1800,1900),verify:b.verify!==false};return json(res,200,await cachedChatResponse(b.query,options),req,'private, max-age=5, stale-while-revalidate=30');}
 if(req.method==='POST'&&req.url==='/api/search'){const b=await body(req);if(!b.query)return json(res,400,{error:'query is required'},req);return json(res,200,await cachedEvidenceSearch(b.query,Math.min(Number(b.maxResults)||8,10)),req,'private, max-age=5, stale-while-revalidate=30');}
 if(req.method==='POST'&&req.url==='/api/replica')return json(res,200,replicate(await body(req),assistant),req);
 if(req.method==='POST'&&req.url==='/api/binary-replacement')return json(res,200,binaryReplacement(await body(req)),req);
 if(req.method==='POST'&&req.url==='/api/local-chat'){const b=await body(req);return json(res,200,localBrain.answer(b.message||''),req);}
 if(req.method==='POST'&&req.url==='/api/large-js-chat')return json(res,200,await largeJSChat(await body(req),assistant),req);
 if(req.method==='POST'&&req.url==='/api/large-js-learn'){const b=await body(req);return json(res,200,{entries:largeJavaScriptLM.learn(b.text||'',b.options||{}),stats:largeJavaScriptLM.stats()},req);}
 if(req.method==='POST'&&req.url==='/api/large-js-knowledge'){const b=await body(req);return json(res,200,{entries:largeJavaScriptLM.addKnowledge(b.entries||[]),stats:largeJavaScriptLM.stats()},req);}
 if(req.method==='POST'&&req.url==='/api/image')return json(res,200,tonyAIProvider.generateImage(await body(req)),req);
 if(req.method==='POST'&&req.url==='/api/files'){const b=await body(req);const files=Array.isArray(b.files)?b.files:[];if(!files.length)return json(res,400,{error:'files array is required'},req);if(files.length>50)return json(res,400,{error:'Maximum 50 files per artifact request'},req);return json(res,200,generateArtifacts({files,zip:b.zip===true,zipName:b.zipName||'tony-downloads.zip'}),req);}
 if(req.method==='GET'&&req.url==='/api/capabilities')return json(res,200,{...assistant.capabilities(),functionalReplica:true,binaryReplacement:binaryReplacementStatus(),localBrain:true,localLanguageModel:true,largeJavaScriptLM:true,largeJavaScriptLMParameters:LARGE_JS_LM_PARAMETER_CAPACITY,largeJavaScriptLMParameterMode:'virtual-sparse-capacity',largeJavaScriptLMPrimaryBackbone:'pure-javascript',largeJavaScriptLMPretrainedRequired:false,largeJavaScriptLMExternalNeuralModel:false,largeJavaScriptLMExternalGenerationAPI:false,openAIRequired:false,provider:tonyAIProvider.capabilities(),pureJavaScriptMode:true,externalSearchEnabled:true,externalImageGenerationEnabled:true,chatPrimary:'large-js-primary',chatToolOrchestration:true,chatResponseSearchEngine:'DuckDuckGo DOM via chatresponse.js',evidenceSearchEngine:'DuckDuckGo DOM + page inspection via evidence-search.js',chatResponseDomInspection:true,chatResponseFrequencyMap:true,performance:{keepAlive:true,immutableEngineAssets:true,cachedInferenceHotPaths:true,compressedResponses:true,pageCache:true,chatResponseBudgetMs:CHAT_TIMEOUT_MS,chatResponseCacheMs:CHATRESPONSE_CACHE_MS,evidenceSearchCacheMs:EVIDENCE_CACHE_MS}},req,'public, max-age=30, stale-while-revalidate=300');
 if(req.method==='GET'&&req.url==='/api/large-js-stats')return json(res,200,largeJavaScriptLM.stats(),req,'public, max-age=10, stale-while-revalidate=60');
 if(req.method==='GET'&&req.url==='/runtime.js')return textAsset(res,'web-runtime.js',req);
 if(req.method==='GET'&&req.url==='/engine/neural-training-data.js')return textAsset(res,'neural-training-data.js',req);
 if(req.method==='GET'&&req.url==='/engine/neural-language-model.js')return textAsset(res,'neural-language-model.js',req);
 if(req.method==='GET'&&req.url==='/engine/large-js-lm.js')return textAsset(res,'large-js-lm.js',req);
 if(req.method==='GET'&&req.url==='/engine/large-js-chat.js')return textAsset(res,'large-js-chat.js',req);
 if(req.method==='GET'&&req.url==='/engine/chatresponse.js')return textAsset(res,'chatresponse.js',req);
 if(req.method==='GET'&&req.url==='/engine/chatresponse-client.js')return textAsset(res,'chatresponse-client.js',req);
 if(req.method==='GET'&&req.url==='/engine/tonyai-provider.js')return textAsset(res,'tonyai-provider.js',req);
 if(req.method==='GET'&&(req.url==='/'||req.url==='/index.html'))return send(res,200,await page(),{'content-type':'text/html; charset=utf-8','cache-control':`public, max-age=${PAGE_MAX_AGE}, stale-while-revalidate=600`},req);
 if(req.method==='GET'&&req.url==='/health')return json(res,200,{ok:true,service:'TONY',pureJavaScriptMode:true,largeJavaScriptLM:true,largeJavaScriptLMParameters:LARGE_JS_LM_PARAMETER_CAPACITY,largeJavaScriptLMParameterMode:'virtual-sparse-capacity',largeJavaScriptLMPrimaryBackbone:'pure-javascript',largeJavaScriptLMPretrainedRequired:false,largeJavaScriptLMExternalNeuralModel:false,externalSearchEnabled:true,externalImageGenerationEnabled:true,openAIRequired:false,provider:tonyAIProvider.capabilities(),chatPrimary:'large-js-primary',chatResponseSearchEngine:'DuckDuckGo DOM via chatresponse.js',evidenceSearchEngine:'DuckDuckGo DOM + page inspection via evidence-search.js',chatResponseDomInspection:true,chatResponseFrequencyMap:true,performance:{keepAlive:true,immutableEngineAssets:true,compressedResponses:true,pageCache:true,chatResponseBudgetMs:CHAT_TIMEOUT_MS,chatResponseCacheMs:CHATRESPONSE_CACHE_MS,evidenceSearchCacheMs:EVIDENCE_CACHE_MS}},req,'public, max-age=5, stale-while-revalidate=30');
 return json(res,404,{error:'Not found'},req);
}catch(e){return json(res,e?.message?.includes('2 second response budget')?504:500,{error:String(e.message||e),performance:{budgetMs:CHAT_TIMEOUT_MS,elapsedMs:Math.round(performance.now()-started)}},req);}}
const server=http.createServer({keepAlive:true,headersTimeout:10000,requestTimeout:10000},handler);server.keepAliveTimeout=5000;server.headersTimeout=10000;server.requestTimeout=10000;server.listen(port,()=>console.log(`TONY Ultimate AI listening on http://localhost:${port}`));process.on('SIGINT',async()=>{await assistant.close();process.exit(0)});process.on('SIGTERM',async()=>{await assistant.close();process.exit(0)});
