// Train and export Tony's compact neural language model.
// Usage: node scripts/train-neural-model.js [output-file]
import {writeFile} from 'node:fs/promises';
import {NeuralLanguageModel} from '../engine/neural-language-model.js';
import {NEURAL_TRAINING_TEXT} from '../engine/neural-training-data.js';

const output=process.argv[2]||'models/tony-neural-checkpoint.json';
const model=new NeuralLanguageModel({embeddingSize:32,hiddenSize:64,epochs:18,learningRate:.035,seed:'tony-neural-v1'});
const stats=model.train(NEURAL_TRAINING_TEXT,{epochs:18,learningRate:.035});
await writeFile(output,JSON.stringify(model.toJSON()));
console.log(JSON.stringify({output,...stats},null,2));
