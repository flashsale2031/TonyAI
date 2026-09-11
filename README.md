# TONY — Ultimate AI Chat

TONY combines the uploaded next-level data-entry assistant stack with the chat UI. The browser stays free of API secrets; the Node server owns the model key and tool orchestration.

## Included capabilities

- Conversational LLM responses with structured JSON output
- Intent grounding and entity extraction
- Research workflow with source collection
- Browser DOM/accessibility inspection and visual fallback
- Conservative task planning and independent plan/outcome verification
- Deterministic field validation and multi-candidate consensus
- Survey question classification and sensitive-profile boundaries
- Security/policy gate for credentials, MFA/CAPTCHA and financial data
- Persistent task queue with retries
- Audit trail and outcome memory
- Recovery state machine
- Browser worker mode for configured data-entry dashboards
- Chat API plus capability, queue, audit, memory, inspect, validate, consensus and recovery endpoints
- AI-generated downloadable text/code/data documents
- Multi-file artifact generation with one-click downloads
- Server-generated ZIP archives containing generated files
- Browser-native download support without requiring a desktop application

## File and ZIP generation

Ask TONY in chat for a file, for example:

- `Create a JSON file containing ...`
- `Create an HTML, CSS, and JavaScript starter project and give me a ZIP.`
- `Generate a CSV with ...`

TONY can return structured file artifacts. The server materializes them as browser-downloadable data URLs and automatically creates a ZIP when requested or when multiple files are returned. Artifact requests are capped at 50 files.

The underlying implementation is dependency-free and lives in `engine/file-generator.js`. The API endpoint `POST /api/files` accepts a `files` array and optional `zip`/`zipName`; chat responses can return `files`, `zip`, and `zipName` fields and are materialized automatically.

## Run

```bash
npm install
npx playwright install chromium
cp .env.example .env
# set OPENAI_API_KEY in .env
npm start
```

Open `http://localhost:3000`.

## Optional browser automation

Set `DASHBOARD_URL` for the supplied dashboard/task workflow. Keep `AUTO_SUBMIT=false` until the workflow is verified. The policy layer blocks sensitive credential, MFA/CAPTCHA and financial boundaries and can require human review.

Run the persistent worker with:

```bash
npm run worker
```
