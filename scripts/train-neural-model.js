// Train and export Tony's larger decoder-style Transformer language model.
// Usage: node scripts/train-neural-model.js [output-file] [epochs]
// For serious pretraining, supply a large properly licensed corpus rather than treating the seed corpus as frontier data.
import {writeFile,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
import {TransformerLanguageModel} from '../engine/transformer-language-model.js';
import {TRANSFORMER_TRAINING_TEXT} from '../engine/transformer-training-data.js';
const output=process.argv[2]||'models/tony-transformer-checkpoint.json';
const epochs=Math.max(1,Number(process.argv[3]||2));
const model=new TransformerLanguageModel({layers:4,heads:4,dim:128,ffDim:512,maxSeq:256,seed:'tony-transformer-v2'});
const stats=model.train(TRANSFORMER_TRAINING_TEXT,{epochs,learningRate:.0005,maxVocab:50000});
await mkdir(dirname(output),{recursive:true});
await writeFile(output,JSON.stringify(model.toJSON()));
console.log(JSON.stringify({output,...stats,trainingCorpus:'engine/transformer-training-data.js',note:'checkpoint is locally trained on the bundled seed corpus; it is not frontier-scale'},null,2));
