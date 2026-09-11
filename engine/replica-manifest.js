// Logical chunk manifest for the functional replica.
// Chunks are JavaScript capability units, not binary weight shards.
export const replicaManifest=Object.freeze({
  version:'1.0.0',
  source:'next-level-data-entry-ai-assistant',
  chunks:[
    {id:'intent',module:'./local-intents.js',capabilities:['intent-routing']},
    {id:'language',module:'./local-language.js',capabilities:['keywords','summarization','classification','similarity','redaction']},
    {id:'tools',module:'./local-tools.js',capabilities:['calculator','text','json','csv','dates','chunking']},
    {id:'code',module:'./local-code.js',capabilities:['language-detection','lint','stats','json-format','todo','dependencies']},
    {id:'data',module:'./local-data.js',capabilities:['statistics','filter','select','join','pivot','moving-average','correlation']},
    {id:'browser',module:'./browser/inspector.js',capabilities:['page-inspection']},
    {id:'actions',module:'./browser/actions.js',capabilities:['form-actions']},
    {id:'planner',module:'./planner.js',capabilities:['task-planning']},
    {id:'verifier',module:'./verifier.js',capabilities:['plan-verification','outcome-verification']},
    {id:'research',module:'./research/researcher.js',capabilities:['research']},
    {id:'queue',module:'./queue/queue.js',capabilities:['queueing']},
    {id:'audit',module:'./storage/audit.js',capabilities:['audit']},
    {id:'recovery',module:'./recovery/state-machine.js',capabilities:['recovery']},
    {id:'local-model',module:'./local-model.js',capabilities:['webgpu-llm','wasm-llm']},
    {id:'model-shards',module:'./model-shards.js',capabilities:['chunk-download','checksum','cache','reassembly']}
  ]
});
if(typeof window!=='undefined')window.TONYReplicaManifest=replicaManifest;
