import { llmJSON } from './llm.js';
export async function verifyPlan({objective,pageModel,research,plan}) {
 return llmJSON({system:`You are an independent verifier. Do not assume the planner is correct. Check proposed answers against supplied evidence. Identify contradictions, unsupported claims, mismatches, and unsafe actions. Disagreement reduces confidence.`,user:JSON.stringify({objective,pageModel,research,plan}),schemaHint:`{approved:boolean, correctedFields:[{selector:string,value:any,reason:string}], contradictions:string[], unsupported:string[], confidence:number, requiresHuman:boolean}`});
}
export async function verifyOutcome({before,after,plan}) {
 return llmJSON({system:`Verify whether a task reached its intended state. Do not equate an action with success. Look for confirmation, errors, changed status, and remaining required fields.`,user:JSON.stringify({before,after,plan}),schemaHint:`{success:boolean,evidence:string[],errors:string[],confidence:number,retryable:boolean}`});
}
