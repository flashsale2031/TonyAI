// TONY LargeLM Knowledge Atlas v1.
// Pure JavaScript, dependency-free, deterministic local knowledge expansion.
// This file intentionally contains no external model or model weights.
// It expands coverage by composing a large set of atomic concepts, relations,
// rules, examples, failure modes, and engineering patterns.

const clean=s=>String(s??'').trim();
const uniq=a=>[...new Set(a.map(clean).filter(Boolean))];

const domains={
 javascript:['variables','scope','closures','prototypes','classes','modules','promises','async functions','event loop','workers','streams','iterators','generators','errors','exceptions','fetch','AbortController','DOM','events','forms','storage','WebGPU','Canvas','Node.js','filesystem','HTTP','buffers','testing'],
 programming:['algorithms','data structures','recursion','dynamic programming','graphs','trees','hashing','sorting','searching','complexity','interfaces','abstraction','composition','immutability','concurrency','parallelism','caching','serialization','parsing','validation','logging','observability','refactoring','testing','debugging','deployment'],
 ai:['tokens','tokenization','embeddings','language models','attention','causal attention','transformers','decoding','temperature','top-k sampling','retrieval','reranking','context windows','fine tuning','pretraining','evaluation','hallucination','prompting','agents','tool use','planning','memory','mixture of experts','distillation','quantization','inference','gradient descent','loss functions','regularization'],
 mathematics:['sets','functions','relations','logic','algebra','linear algebra','vectors','matrices','calculus','derivatives','integrals','probability','statistics','distributions','expectation','variance','optimization','geometry','trigonometry','number theory','combinatorics','graphs','numerical methods','proofs','limits','sequences','series','differential equations'],
 science:['hypotheses','experiments','controls','variables','measurement','uncertainty','reproducibility','models','simulations','causality','correlation','physics','chemistry','biology','ecology','astronomy','thermodynamics','mechanics','electromagnetism','evolution','genetics','cell biology','geology','climate science','scientific communication'],
 databases:['tables','rows','columns','primary keys','foreign keys','indexes','transactions','ACID','isolation','locking','MVCC','joins','aggregation','query planning','normalization','denormalization','constraints','migrations','replication','sharding','partitioning','caching','connection pools','prepared statements','backups','recovery','schema design'],
 networks:['DNS','TCP','UDP','TLS','HTTP','HTTP/2','HTTP/3','QUIC','WebSockets','proxies','load balancers','timeouts','retries','backoff','jitter','circuit breakers','latency','throughput','bandwidth','routing','NAT','CDNs','caching','service discovery','health checks','connection pooling'],
 security:['authentication','authorization','least privilege','secrets','passwords','sessions','tokens','cookies','CSRF','XSS','injection','SQL injection','CSP','TLS','encryption','hashing','signatures','threat modeling','auditing','logging','rate limiting','input validation','output encoding','dependency security','supply chain','sandboxing','access control'],
 architecture:['monoliths','microservices','modular design','event driven systems','queues','pub-sub','workers','services','APIs','contracts','databases','caches','stateless services','stateful services','horizontal scaling','vertical scaling','failover','replication','consistency','availability','backpressure','idempotency','sagas','observability','configuration','feature flags'],
 data:['datasets','schemas','records','missing values','outliers','normalization','aggregation','joins','grouping','filtering','sampling','bias','metrics','percentiles','distributions','correlation','experiments','ETL','ELT','data quality','validation','lineage','provenance','dashboards','visualization','forecasting','anomaly detection'],
 software:['requirements','interfaces','modules','APIs','libraries','dependencies','versioning','configuration','testing','CI','deployment','rollback','feature flags','logging','metrics','tracing','errors','retries','timeouts','caching','queues','workers','documentation','code review','refactoring','technical debt','maintenance'],
 product:['users','problems','requirements','personas','workflows','UX','accessibility','latency','feedback','telemetry','experiments','MVPs','roadmaps','milestones','prioritization','tradeoffs','adoption','retention','reliability','onboarding','navigation','information architecture','defaults','notifications','search','settings','support'],
 writing:['claims','evidence','structure','headings','summaries','examples','definitions','tone','audience','clarity','brevity','transitions','paragraphs','lists','tables','technical writing','editing','rewriting','argumentation','narrative','dialogue','documentation','instructions','proposals','reports','emails','reviews'],
 research:['questions','claims','sources','primary sources','secondary sources','search','retrieval','provenance','citations','methodology','evidence','uncertainty','bias','replication','comparison','synthesis','literature reviews','experiments','datasets','measurements','peer review','conflicting evidence','current information','source quality','research notes','hypotheses','conclusions'],
 planning:['objectives','constraints','dependencies','milestones','risks','owners','deadlines','critical paths','resources','budgets','verification','checklists','rollbacks','fallbacks','priorities','sequencing','parallel work','status','assumptions','decisions','tradeoffs','deliverables','acceptance criteria','reviews','retrospectives','lessons learned'],
 graphics:['pixels','rasters','vectors','SVG','Canvas','WebGL','WebGPU','colors','palettes','gradients','shapes','lines','circles','polygons','sprites','tiles','animation','frames','interpolation','lighting','shadows','textures','noise','particles','compositing','filters','typography','icons']
};

const relations=[
 ['definition','{a} is a concept or mechanism used to represent or manage {b}.'],
 ['purpose','The purpose of {a} is to make work involving {b} more predictable, efficient, correct, or understandable.'],
 ['tradeoff','Using {a} can improve handling of {b}, but introduces costs that should be evaluated against the workload.'],
 ['failure','A common failure mode involving {a} is ignoring how it interacts with {b}; explicit validation and monitoring reduce that risk.'],
 ['design','A robust design for {a} defines inputs, outputs, invariants, failure behavior, and observability around {b}.'],
 ['testing','Tests for {a} should include ordinary cases, boundary cases, malformed inputs, and interactions with {b}.'],
 ['performance','Performance of {a} depends on workload size, data shape, memory behavior, and interaction with {b}.'],
 ['security','Security around {a} requires appropriate validation, least privilege, safe handling of secrets, and careful interaction with {b}.'],
 ['reliability','Reliable use of {a} with {b} requires bounded retries, explicit timeouts where applicable, and recovery from partial failure.'],
 ['reasoning','When reasoning about {a} and {b}, distinguish definitions, assumptions, observations, consequences, and uncertainties.'],
 ['example','A practical example of {a} with {b} is to choose a small representative case, verify the result, and then generalize carefully.'],
 ['debugging','When {a} behaves unexpectedly around {b}, reduce the case, inspect intermediate state, verify assumptions, and test one change at a time.'],
 ['architecture','A system using {a} should give it a clear boundary and contract for communication with {b}.'],
 ['maintenance','Long-term maintenance of {a} benefits from documentation, tests, observability, versioning, and explicit ownership of {b}.'],
 ['decision','Choose {a} for {b} when its correctness and operational tradeoffs fit the actual requirements rather than following a generic rule.'],
 ['comparison','Compared with alternatives, {a} should be evaluated on correctness, complexity, latency, memory, reliability, and fit for {b}.']
];

const cross=[
 ['javascript','programming'],['javascript','web'],['programming','mathematics'],['ai','mathematics'],['ai','data'],['ai','research'],['databases','networks'],['security','networks'],['architecture','software'],['data','research'],['product','software'],['writing','research'],['graphics','javascript'],['science','mathematics'],['planning','product'],['software','security']
];

function build(){
 const out=[];
 for(const [domain,items] of Object.entries(domains)){
  for(let i=0;i<items.length;i++){
   const a=items[i];
   const b=items[(i+1)%items.length];
   for(const [kind,t] of relations)out.push({id:`${domain}-${i}-${kind}`,domain,kind,text:t.replaceAll('{a}',a).replaceAll('{b}',b)});
   out.push({id:`${domain}-${i}-chain`,domain,kind:'chain',text:`In a practical ${domain} workflow, ${a} often connects with ${b}; make the interface explicit and verify the transition.`});
  }
 }
 for(const [da,db] of cross){
  const A=domains[da],B=domains[db];
  for(let i=0;i<Math.min(A.length,32);i++){
   const a=A[i],b=B[i%B.length];
   out.push({id:`cross-${da}-${db}-${i}`,domain:`${da}+${db}`,kind:'cross-domain',text:`${a} and ${b} interact in real systems; reason about their shared assumptions, data flow, failure modes, and verification points.`});
   out.push({id:`cross-${da}-${db}-${i}-practice`,domain:`${da}+${db}`,kind:'practice',text:`A sound ${da}/${db} design keeps ${a} explicit, validates inputs to ${b}, and measures the resulting behavior.`});
  }
 }
 return out;
}

export const LARGE_KNOWLEDGE_ATLAS=build();
export const LARGE_KNOWLEDGE_ATLAS_TEXT=LARGE_KNOWLEDGE_ATLAS.map(x=>x.text).join(' ');

const tokens=s=>new Set((String(s).toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).filter(x=>x.length>2));
export function atlasSearch(query,limit=24){
 const q=tokens(query), scored=[];
 for(const item of LARGE_KNOWLEDGE_ATLAS){let hit=0;for(const t of tokens(item.text))if(q.has(t))hit++;if(hit)scored.push({item,score:hit/(Math.sqrt(Math.max(1,q.size))*Math.sqrt(Math.max(1,tokens(item.text).size)))});}
 scored.sort((a,b)=>b.score-a.score);return scored.slice(0,limit).map(x=>({...x.item,score:x.score}));
}
export function atlasStats(){return{entries:LARGE_KNOWLEDGE_ATLAS.length,domains:Object.keys(domains).length,relationPatterns:relations.length,crossDomainPairs:cross.length,pureJavaScript:true,externalModelRequired:false};}
if(typeof window!=='undefined')window.TONYLargeKnowledgeAtlas={LARGE_KNOWLEDGE_ATLAS,atlasSearch,atlasStats};
