# TONY AI

TONY is a browser-first AI workspace with a server runtime for chat, research, browser inspection/action planning, validation, queues, audit logging, recovery, image generation, and downloadable artifacts.

## Functional replication layer

The supplied `next-level-data-entry-ai-assistant` archive was assessed as a collection of functional components rather than treated as a black-box binary. Its observable roles map into TONY as follows:

- survey/question classification -> `engine/survey/question-classifier.js`
- sensitive-data boundary -> `engine/safetyboundaries.js` plus existing policy adapters
- LLM planning -> `engine/ai/llm.js`, `engine/planner.js`, `engine/verifier.js`
- browser inspection/actions/visual fallback -> `engine/browser/*`
- research -> `engine/research/researcher.js` and DuckDuckGo retrieval
- persistent outcome memory -> `engine/learning/outcome-memory.js`
- queue/worker/recovery/audit -> `engine/queue/*`, `engine/worker.js`, `engine/recovery/*`, `engine/storage/*`
- deterministic validation/consensus -> `engine/validation/*`
- offline language/data/code utilities -> `engine/local-language.js`, `engine/local-data.js`, `engine/local-code.js`, `engine/local-tools.js`

`engine/replicated-engine.js` provides a deterministic functional replica for common calculator, summarization, text utility, code-analysis, and statistics operations. `engine/replica-manifest.js` records the capability chunks and their source modules. The browser bridge routes supported deterministic operations locally, then tries the local WebGPU/WASM model, and finally falls back to `/api/chat`.

This is functional replication, not binary/weight reconstruction. The supplied archive does not contain a pretrained model-weight binary; therefore no fabricated binary is committed. Real model weights can be supplied through `engine/model-shards.js`, which downloads, verifies, caches, and reassembles independently hosted shards.

## Local model

TONY can use WebLLM/WebGPU first and Transformers.js/WASM as fallback with SmolLM2-360M-Instruct. Model weights are obtained by the browser runtime and cached locally; they are not embedded in Git as source code.

## Server

```bash
npm install
npm start
```

Useful endpoints include `/api/chat`, `/api/replica`, `/api/search`, `/api/image`, `/api/files`, `/api/capabilities`, `/api/inspect`, `/api/queue`, `/api/validate`, `/api/consensus`, and `/api/recover`.

## Safety

Essential safeguards remain in place for credentials, authentication factors, payment/banking data, private secrets, and other protected operations. Browser navigation and external actions are controlled by server configuration.
