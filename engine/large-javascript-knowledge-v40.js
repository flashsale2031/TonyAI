// TONY Large JavaScript Knowledge v40.
// Authored deterministic JavaScript/web engineering knowledge; no pretrained model.
const packs={
 language:[
  'JavaScript lexical environments separate bindings from values; closures retain access to bindings after an outer function returns.',
  'The temporal dead zone applies from entering a block until a let, const, or class declaration is initialized.',
  'Object.is differs from strict equality for NaN and signed zero, making it useful when exact identity semantics matter.',
  'BigInt supports arbitrary-precision integers but cannot be implicitly mixed with Number arithmetic.',
  'Symbols provide unique primitive keys and well-known symbols customize language protocols such as iteration.',
  'Property descriptors control value, writability, enumerability, and configurability and are observable through reflection APIs.',
  'Proxy traps must respect JavaScript invariants; returning an impossible descriptor or prototype can throw a TypeError.',
  'Reflect methods expose standard object operations in function form and generally return useful success indicators.',
  'Optional chaining short-circuits on nullish receivers, while nullish coalescing only treats null and undefined as absent.',
  'Private class fields are enforced by the language and cannot be accessed through ordinary string property names.'
 ],
 async:[
  'Promise resolution assimilates thenables, so a returned object with a callable then method participates in promise chaining.',
  'Promise.all preserves input order while rejecting when any input rejects; Promise.allSettled reports every outcome.',
  'Promise.any fulfills on the first fulfillment and rejects with AggregateError only when every input rejects.',
  'AbortController provides a standard cancellation signal that can be passed to APIs such as fetch and custom asynchronous work.',
  'Async generators combine asynchronous iteration with generator suspension and are consumed with for await...of.',
  'Microtasks from promise reactions run after the current JavaScript stack before the event loop proceeds to another task.',
  'Unhandled promise rejections should be observed and handled deliberately because runtimes may report or terminate on them.',
  'finally callbacks execute after settlement and are useful for cleanup without changing the settled value unless they throw or return a rejected promise.',
  'Async functions always return promises, even when their body returns a plain value synchronously.',
  'Cancellation should propagate through nested asynchronous operations rather than merely stopping the caller from awaiting a result.'
 ],
 dom:[
  'Event delegation attaches one listener to a stable ancestor and uses event.target or closest to handle dynamic descendants.',
  'CustomEvent can carry structured detail data and participates in the normal DOM event propagation model.',
  'DocumentFragment lets many DOM nodes be assembled off-document before one insertion reduces repeated live-tree work.',
  'HTMLTemplateElement stores inert markup that can be cloned into a document without executing it as live content at definition time.',
  'Shadow DOM scopes component internals while selected events can still cross the shadow boundary according to composed behavior.',
  'Pointer capture keeps subsequent pointer events targeted at a chosen element even when the pointer moves outside its bounds.',
  'MutationObserver batches DOM mutation records and invokes its callback asynchronously rather than synchronously for every mutation.',
  'ResizeObserver reports element size changes without requiring continuous polling of layout dimensions.',
  'IntersectionObserver asynchronously reports changes in intersection between a target and a root or viewport.',
  'The dialog and popover APIs provide browser-managed interaction patterns with focus and dismissal semantics that should be preferred over ad hoc overlays.'
 ],
 networking:[
  'Fetch rejects on network failures but normally resolves for HTTP error statuses, so applications should check response.ok or status explicitly.',
  'A Request can be cloned when the body has not been consumed, allowing independent consumers of a request payload.',
  'ReadableStream enables incremental processing of large response bodies and supports backpressure-aware pipelines.',
  'Headers normalizes HTTP header names and enforces browser restrictions on forbidden request headers.',
  'URLSearchParams provides structured query-string construction and correctly handles repeated parameter names.',
  'WebSocket establishes a long-lived bidirectional channel and requires application-level heartbeats or reconnect logic when reliability matters.',
  'EventSource provides server-sent events over HTTP and is appropriate for one-way server-to-browser updates.',
  'BroadcastChannel communicates between same-origin browsing contexts without manually routing messages through a server.',
  'WebRTC uses ICE candidate gathering and signaling to establish peer connectivity; signaling itself is application-defined.',
  'ETag and If-None-Match enable conditional HTTP requests that can avoid transferring unchanged representations.'
 ],
 node:[
  'Node HTTP keep-alive reuses connections and can reduce handshake overhead for repeated requests to the same origin.',
  'Node agents coordinate connection pooling, socket reuse, and concurrency for outbound HTTP requests.',
  'Node filesystem APIs have promise, callback, and synchronous forms; asynchronous APIs are preferred for servers handling concurrent requests.',
  'File descriptors and handles represent operating-system resources and should be closed deterministically after use.',
  'Node process signals such as SIGINT and SIGTERM can trigger graceful shutdown procedures that drain work and close resources.',
  'Environment variables are strings at process startup; applications should validate and parse them rather than assuming types.',
  'DNS resolution can be asynchronous and may produce multiple addresses, so network clients should handle connection selection and retry policy deliberately.',
  'TLS validation should use trusted certificate verification and should not be disabled as a convenience workaround in production.',
  'Readline and streams support incremental text processing without loading an entire input source into memory.',
  'AsyncLocalStorage can associate contextual data with asynchronous execution chains and is useful for request correlation and tracing.'
 ],
 security:[
  'Same-origin policy restricts script access across origins and is a foundational browser security boundary.',
  'CORS controls which cross-origin browser requests are permitted to expose responses to frontend JavaScript.',
  'CSRF defenses should combine appropriate SameSite cookie settings with server-side request validation where state-changing operations require it.',
  'Content Security Policy can reduce script injection risk by constraining executable sources and should be designed around explicit application needs.',
  'Trusted Types can require dangerous DOM sinks to receive policy-created values instead of arbitrary strings.',
  'Subresource Integrity lets browsers verify that fetched scripts or stylesheets match an expected cryptographic digest.',
  'Permissions Policy restricts access to selected browser capabilities for documents and embedded frames.',
  'Referrer Policy controls how much referring URL information is transmitted with requests.',
  'Strict-Transport-Security instructs browsers to use HTTPS for a site after receiving the policy over a secure connection.',
  'Sandboxed iframes impose capability restrictions and can be combined with carefully selected allowances for untrusted content.'
 ],
 performance:[
  'Layout thrashing occurs when code repeatedly alternates DOM writes with layout reads, forcing unnecessary synchronous layout calculations.',
  'requestAnimationFrame is appropriate for visual updates because callbacks are coordinated with the browser rendering cycle.',
  'Debouncing waits for activity to settle before running work, while throttling limits execution frequency during sustained activity.',
  'Virtualization renders only visible portions of large lists, reducing DOM size and layout work.',
  'content-visibility can allow the browser to skip rendering work for content outside the relevant viewport.',
  'PerformanceObserver provides programmatic access to selected performance entries and can support real-user monitoring.',
  'Long tasks on the main thread can delay input and rendering; expensive work should be chunked or moved to workers when appropriate.',
  'Resource hints such as preconnect and preload can improve critical-path latency when used for resources known to be important.',
  'Caching should account for freshness, invalidation, memory pressure, and cache-key correctness rather than maximizing hit rate alone.',
  'Core Web Vitals represent user-facing loading, responsiveness, and visual stability concerns and should be interpreted with field data.'
 ],
 testing:[
  'Property-based tests validate general invariants over many generated inputs instead of checking only a fixed collection of examples.',
  'Metamorphic tests compare related executions when a direct oracle for every output is unavailable.',
  'Contract tests verify that a producer and consumer agree on an interface, schema, or protocol.',
  'Snapshot tests are useful when serialized output is intentionally stable, but snapshots should not replace assertions about behavior.',
  'Fake timers make timer-driven logic deterministic but should be advanced carefully when promise microtasks and timer queues interact.',
  'Boundary tests should emphasize empty, maximum, minimum, malformed, duplicate, and near-limit inputs.',
  'Mutation testing evaluates whether a test suite detects deliberate small changes to implementation behavior.',
  'Golden tests compare output to curated expected artifacts and are valuable for parsers, formatters, and deterministic generators.',
  'Deterministic randomness uses an explicit seed so failures can be reproduced exactly.',
  'Replay testing records meaningful inputs and environment decisions so complex failures can be reconstructed without guessing.'
 ],
 architecture:[
  'Idempotency keys let retried state-changing operations be recognized and safely deduplicated by the server.',
  'Exponential backoff with jitter reduces synchronized retry storms when many clients encounter the same temporary failure.',
  'Graceful degradation keeps essential functionality available when optional dependencies or advanced features fail.',
  'Circuit breakers prevent repeated calls to an unhealthy dependency and give the dependency time to recover.',
  'Bulkheads isolate resource pools so overload in one workload does not exhaust resources needed by unrelated workloads.',
  'Bounded queues provide explicit backpressure and prevent unlimited memory growth under sustained load.',
  'Health checks should distinguish process liveness from dependency readiness so orchestration systems can react appropriately.',
  'Structured errors should preserve machine-readable categories, causal information, and safe user-facing messages.',
  'Observability is strongest when logs, metrics, traces, and correlation identifiers describe the same request lifecycle.',
  'Feature flags should have explicit ownership, rollout rules, and removal plans so temporary branches do not become permanent complexity.'
 ],
 data:[
  'Map is appropriate for arbitrary key-value associations and avoids accidental collisions with object prototype properties.',
  'Set stores unique values and is useful for membership checks and duplicate elimination.',
  'structuredClone copies supported structured data graphs and can transfer selected transferable objects rather than duplicating their backing storage.',
  'ArrayBuffer represents raw binary storage while typed arrays provide typed views over its bytes.',
  'DataView provides explicit control over byte offsets and endianness when reading and writing binary formats.',
  'Object.fromEntries converts iterable key-value pairs into an ordinary object and is useful after map/filter style transformations.',
  'Object.hasOwn checks own properties without relying on a potentially shadowed hasOwnProperty method.',
  'Array.prototype.toSorted returns a sorted copy and leaves the original array unchanged, which can simplify immutable data flows.',
  'Array.prototype.toReversed returns a reversed copy and avoids mutating the source array.',
  'Array.prototype.with returns a shallow copy with one indexed element replaced and is useful for immutable updates.'
 ]
};
export const LARGE_JAVASCRIPT_KNOWLEDGE_V40_TEXT=Object.entries(packs).flatMap(([pack,entries])=>entries.map((text,i)=>`[JavaScript v40/${pack}/${i+1}] ${text}`)).join('\n');
export const javascriptKnowledgeV40Stats=()=>({version:'40.0',packs:Object.keys(packs).length,entries:Object.values(packs).reduce((n,x)=>n+x.length,0),characters:LARGE_JAVASCRIPT_KNOWLEDGE_V40_TEXT.length,pretrained:false,authored:true});
if(typeof window!=='undefined')window.TONYLargeJavaScriptKnowledgeV40={LARGE_JAVASCRIPT_KNOWLEDGE_V40_TEXT,javascriptKnowledgeV40Stats};
