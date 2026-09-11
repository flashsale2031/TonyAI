# TONY local language model

TONY now has a browser-local natural-language generation path that does not require an OpenAI API key for ordinary chat generation.

## Runtime order

1. **WebGPU / WebLLM** — `SmolLM2-360M-Instruct-q4f16_1-MLC`
2. **WASM / Transformers.js** — `onnx-community/SmolLM2-360M-Instruct-ONNX`
3. **Existing server `/api/chat` path** if the browser-local model cannot initialize
4. Existing deterministic local tools remain available for calculations, data work, code inspection, files, and other structured tasks.

WebLLM is an in-browser LLM runtime using WebGPU; Transformers.js can run models directly in the browser using WASM and can also use WebGPU. Both runtimes cache model assets after the initial download.

## Model weights

The model binaries are intentionally **not committed to Git**. The quantized weights are hundreds of megabytes and would make the repository unnecessarily large. The browser downloads them from their model repositories on first use and caches them locally.

The exact model sources and runtime configuration are recorded in `models/local-models.json`.

## Requirements

- WebGPU-capable browser for the preferred path.
- If WebGPU is unavailable, the WASM fallback can run on CPU, subject to available memory and browser performance.
- The first local-model startup requires network access to download model/runtime assets unless the assets have already been cached or self-hosted.

## OpenAI usage

This makes OpenAI **optional for browser chat generation**, not impossible. The existing server route remains as a fallback for cases where the local runtime cannot initialize or when server-side capabilities are explicitly needed.

The local model is a compact assistant and can be less capable than a large hosted model. Current or highly factual questions should continue to use TONY's web-retrieval tools when appropriate.
