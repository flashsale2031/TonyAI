# Local model shards

TONY can load large local model assets as multiple independently cached parts instead of placing one huge weight file in the Git repository.

Each shard in a manifest contains:

- `id` — unique cache key
- `url` — self-hosted/CDN URL
- `bytes` — expected size
- `sha256` — optional integrity hash

The browser stores completed shards in IndexedDB and reuses them on later launches. `engine/model-shards.js` downloads them sequentially, reports progress, verifies checksums, and reassembles the byte stream.

This repository intentionally does **not** contain copied model weights. The WebGPU/WASM runtimes already download supported model artifacts from their configured model repositories. If you want TONY to ship a particular large model with the application, split that model into parts externally and add a manifest under this directory, then point the runtime at the manifest.

Example manifest shape:

```json
{
  "name":"my-local-model",
  "format":"safetensors",
  "shards":[
    {"id":"model-00001","url":"/models/my-local-model/00001.part","bytes":100000000,"sha256":"..."},
    {"id":"model-00002","url":"/models/my-local-model/00002.part","bytes":100000000,"sha256":"..."}
  ]
}
```

Do not commit proprietary or licensed weights unless you have permission to redistribute them.
