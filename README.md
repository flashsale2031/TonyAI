# TONY AI

TONY is a browser-first AI workspace with a pure-JavaScript primary generation backbone plus optional external retrieval/image tools.

## Large JavaScript LM

`engine/large-js-lm.js` implements a sparse, deterministic, runtime-trainable language engine with a declared **450,000,000,000 virtual parameter capacity**. It uses hashed parameter addressing, lazy materialization, runtime corpus learning, retrieval, token scoring, sampling, safety/tool-routing families, and a built-in JavaScript capability corpus.

The 450B figure is a virtual parameter address space, not 450 billion physically stored learned weights. Adding JavaScript source cannot manufacture trained neural knowledge, so TONY does not falsely claim that this is equivalent to an 8B trained neural model. The design instead maximizes useful local deterministic computation while keeping the primary generation path independent of pretrained language-model weights.

## Chat orchestration

`engine/large-js-chat.js` makes the large JavaScript engine the primary chat generator and connects the chat to deterministic local capabilities plus optional tools:

- local intent routing, language utilities, calculations, data analysis, code analysis and artifact generation
- browser inspection, queueing, recovery, validation and consensus through the existing TONY runtime
- DuckDuckGo web retrieval for current information
- optional external image generation when `OPENAI_API_KEY` is configured
- safety boundaries for credentials, authentication factors, payment/banking data and private secrets

External search and image generation are tools only; they are not used as the primary text-generation backbone.

## API

```bash
npm install
npm start
```

Large-JS endpoints:

- `POST /api/chat` — primary TONY chat using the pure-JavaScript LM and tool orchestration
- `POST /api/large-js-chat` — direct large-JS chat
- `POST /api/large-js-learn` — runtime learning from supplied local text
- `POST /api/large-js-knowledge` — add local knowledge entries
- `GET /api/large-js-stats` — parameter capacity, materialized parameters, learning updates and configured families
- `POST /api/search` — optional external web retrieval
- `POST /api/image` — optional external image generation

Existing TONY endpoints for validation, consensus, browser inspection, queues, recovery, files and capabilities remain available.

## Safety

Protected operations continue to require human handling. Browser navigation and external actions remain subject to TONY's existing policy and configuration gates.
