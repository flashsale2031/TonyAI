import { llmJSON } from './llm.js';
export async function planTask({objective,pageModel,research}) {
 return llmJSON({system:`You are a conservative task planner. Infer only what is supported by supplied evidence. Do not invent facts. If ambiguous, set requiresHuman=true. Produce structured task intents, not arbitrary JavaScript.`,user:JSON.stringify({objective,pageModel,research}),schemaHint:`{objective:string, fields:[{label:string, selector:string, type:string, value:any, rationale:string, evidenceIds:string[]}], navigation:[{action:string,target:string}], confidence:number, requiresHuman:boolean, unresolved:string[]}`});
}
