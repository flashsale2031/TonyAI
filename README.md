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

## Important

The ultimate engine requires a server runtime. Do not expose `OPENAI_API_KEY` in frontend JavaScript or static-only hosting.
