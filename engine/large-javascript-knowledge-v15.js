// TONY Large JavaScript Knowledge Expansion v15.
// Authored pure-JavaScript engineering knowledge; not a pretrained neural checkpoint.
const packs={
 runtime:[
  ['execution','JavaScript execution is organized around jobs, execution contexts, lexical environments, and a call stack; closures retain reachable lexical state after an outer function returns.'],
  ['realm','A JavaScript realm supplies its own global object and intrinsic constructors, so values from different realms can fail instanceof checks even when their apparent types match.'],
  ['strict','Strict mode changes several legacy semantics, including this binding and assignment errors, and is useful for reducing accidental global mutation.'],
  ['destructuring','Destructuring reads iterable or property values into bindings; defaults apply when a value is undefined rather than for every falsy value.'],
  ['spread','Spread syntax expands iterables in array and argument positions and enumerable own properties in object literals; it is shallow rather than a deep clone.'],
  ['symbols','Symbols provide unique primitive keys that are useful for non-colliding protocols, while well-known symbols customize language operations such as iteration.'],
  ['iterators','An iterator exposes next() returning an object with value and done; the iterable protocol supplies Symbol.iterator so consumers can obtain iterators.'],
  ['generators','Generator functions combine iterator production with resumable execution, making them useful for lazy sequences and cooperative state machines.'],
  ['privatefields','Class private fields use # names and are enforced by the language, providing stronger encapsulation than convention-based underscore properties.'],
  ['accessors','Getter and setter accessors participate in property access while allowing validation, lazy computation, or compatibility layers behind a stable API.']
 ],
 async:[
  ['microtasks','Promise reactions and queueMicrotask callbacks run in the microtask checkpoint after the current job, before the event loop proceeds to another task.'],
  ['promiseall','Promise.all preserves input order in its fulfillment array but rejects when any input rejects, making it appropriate when every result is required.'],
  ['promiseallsettled','Promise.allSettled waits for every input and returns status records, making it useful when partial failure should not cancel collection.'],
  ['promiserace','Promise.race settles with the first settled input, whereas Promise.any waits for the first fulfillment and rejects only after all inputs reject.'],
  ['abort','AbortController provides a standard cancellation signal for fetch and many custom asynchronous APIs; cooperative consumers must actually observe the signal.'],
  ['timeouts','A timeout should generally reject or abort the underlying operation rather than merely stop awaiting it, otherwise work may continue in the background.'],
  ['backpressure','Streaming producers need backpressure so consumers can bound memory use; Web Streams encode this through desiredSize and queue strategies.'],
  ['asynciterators','Async iterators produce promises from next(), enabling for await...of to consume streams and paginated resources naturally.'],
  ['concurrency','Limiting concurrent asynchronous work prevents connection exhaustion, memory spikes, and service overload; a semaphore or worker pool is a common pattern.'],
  ['retry','Retries should distinguish transient failures from permanent ones and normally use bounded attempts with exponential backoff and jitter.']
 ],
 node:[
  ['eventloop','Node.js combines JavaScript execution with an event loop and native I/O facilities; CPU-heavy synchronous work can delay unrelated requests.'],
  ['streams','Node streams process data incrementally and expose readable, writable, duplex, and transform abstractions for bounded-memory pipelines.'],
  ['buffers','Buffer is Node’s binary byte container and interoperates with typed arrays and many filesystem, network, and cryptographic APIs.'],
  ['filesystem','The fs promises API provides asynchronous filesystem operations; recursive directory work should still account for races and permission failures.'],
  ['path','The path module normalizes platform-specific separators and joins segments without interpreting whether the resulting path exists.'],
  ['url','The WHATWG URL API provides structured parsing and serialization and is generally preferable to ad hoc string manipulation for URLs.'],
  ['env','process.env exposes environment configuration as strings; production code should validate required settings rather than assuming presence or type.'],
  ['childprocess','Child processes execute outside the JavaScript call stack and require careful handling of exit status, signals, standard streams, and untrusted arguments.'],
  ['workers','Worker threads provide separate JavaScript execution contexts for CPU-bound work while allowing controlled message passing and transferable data.'],
  ['diagnostics','Node diagnostics can use performance marks, async hooks, inspector APIs, heap snapshots, and structured logging to locate latency or memory problems.']
 ],
 browser:[
  ['dom','The DOM is a tree of nodes exposed through browser APIs; repeated layout-sensitive reads and writes can cause avoidable rendering work.'],
  ['events','DOM events propagate through capture, target, and bubble phases; delegation can reduce listener count for dynamic collections.'],
  ['fetch','fetch resolves for HTTP error statuses, so callers must inspect response.ok or status and separately handle network or abort failures.'],
  ['storage','localStorage and sessionStorage store strings synchronously; large or frequent writes can block the main thread.'],
  ['indexeddb','IndexedDB is an asynchronous transactional object database suitable for larger structured client-side data than synchronous Web Storage.'],
  ['workers','Dedicated workers isolate computation from the main UI thread and communicate through message events and structured cloning.'],
  ['serviceworker','Service workers can intercept fetches and support offline strategies, but lifecycle activation and cache versioning must be designed explicitly.'],
  ['webcomponents','Custom elements and shadow DOM allow reusable components with encapsulated structure, styles, and lifecycle callbacks.'],
  ['mutationobserver','MutationObserver batches DOM mutation notifications asynchronously, making it preferable to polling when reacting to structural changes.'],
  ['intersectionobserver','IntersectionObserver reports visibility changes relative to a root and is useful for lazy loading and viewport-driven behavior without scroll polling.']
 ],
 security:[
  ['xss','Avoid inserting untrusted strings with innerHTML; textContent and contextual escaping reduce cross-site scripting risk.'],
  ['csp','Content Security Policy can restrict executable sources and inline behavior, providing defense in depth against injection vulnerabilities.'],
  ['cors','CORS is a browser enforcement mechanism for cross-origin reads; adding permissive headers is not itself an authentication system.'],
  ['cookies','HttpOnly prevents JavaScript cookie access, Secure limits transmission to HTTPS, and SameSite controls cross-site sending behavior.'],
  ['csrf','CSRF defenses commonly combine SameSite cookies, origin checks, and anti-CSRF tokens for state-changing requests.'],
  ['prototypepollution','Prototype pollution can arise when untrusted keys are merged into ordinary objects; schema validation and safe object construction reduce the attack surface.'],
  ['redos','Regular expressions with nested ambiguous quantifiers can create catastrophic backtracking; bounded patterns or linear-time alternatives are safer for untrusted input.'],
  ['urlvalidation','Security-sensitive URL validation should parse with URL and verify protocol, host, port, and other policy fields rather than relying on substring checks.'],
  ['secrets','Secrets should not be embedded in browser bundles because shipped client code is observable by users and intermediaries.'],
  ['permissions','Browser permission APIs represent user-agent mediated capabilities; applications should handle denial, revocation, and unavailable features explicitly.']
 ],
 performance:[
  ['profiling','Performance work should begin with measurements and profiles rather than assumptions; optimize the dominant cost on the target workload.'],
  ['complexity','Algorithmic complexity describes growth with input size, while constant factors and memory locality can dominate at practical scales.'],
  ['memoization','Memoization trades memory for repeated computation savings and requires a stable key plus an invalidation strategy when inputs depend on mutable state.'],
  ['caching','A cache needs a bounded size or eviction policy and clear freshness semantics; stale data is a correctness concern as well as a performance concern.'],
  ['batching','Batching reduces per-operation overhead but increases latency and memory per batch, so batch size should be tuned to workload characteristics.'],
  ['debounce','Debouncing delays work until input activity pauses, while throttling limits execution frequency during continuous activity.'],
  ['virtualization','List virtualization renders only the visible window of a large collection, reducing DOM size and layout cost.'],
  ['memory','Memory leaks often arise from retained listeners, timers, caches, closures, or global references; heap snapshots can reveal retaining paths.'],
  ['gc','Garbage collection reclaims unreachable objects, but allocation rate and object lifetime still influence latency and memory footprint.'],
  ['serialization','JSON serialization is convenient but loses several JavaScript-specific values and can become expensive for large object graphs.']
 ],
 architecture:[
  ['modules','ES modules provide static import/export structure, enabling dependency analysis and avoiding many global namespace collisions.'],
  ['dependencyinjection','Dependency injection makes collaborators explicit and improves testing by allowing deterministic substitutes for I/O and platform services.'],
  ['portsadapters','Ports-and-adapters architecture separates core policy from external mechanisms such as HTTP, storage, and browser APIs.'],
  ['state','Explicit state machines make legal transitions visible and reduce bugs caused by loosely coordinated boolean flags.'],
  ['idempotency','Idempotent operations can be safely repeated without changing the intended result, which is valuable for retries and distributed workflows.'],
  ['eventsourcing','Event-driven designs record meaningful state changes as events; consumers must consider ordering, duplication, replay, and schema evolution.'],
  ['queues','Work queues decouple producers and consumers and allow bounded concurrency, retries, and prioritization.'],
  ['observability','Useful observability combines structured logs, metrics, traces, correlation identifiers, and actionable error context.'],
  ['contracts','API contracts should specify input validation, output shape, failure behavior, timeouts, and compatibility expectations rather than only happy paths.'],
  ['configuration','Configuration should be resolved at boundaries and passed into components explicitly so runtime behavior remains testable and predictable.']
 ],
 testing:[
  ['unit','Unit tests should isolate deterministic behavior and assert meaningful contracts rather than implementation details that make refactoring fragile.'],
  ['integration','Integration tests verify boundaries between real components such as storage, HTTP handlers, queues, and browser APIs.'],
  ['property','Property-based testing checks invariants over many generated inputs and is especially useful for parsers, serializers, and data transformations.'],
  ['fuzzing','Fuzz tests explore malformed or unexpected inputs to expose crashes, hangs, parser ambiguities, and invariant violations.'],
  ['determinism','Deterministic tests control clocks, randomness, concurrency, and external I/O so failures are reproducible.'],
  ['fixtures','Fixtures should be minimal and representative; oversized shared fixtures can hide dependencies and slow suites.'],
  ['mocks','Mocks are useful for boundary behavior but can become misleading when they reproduce implementation assumptions instead of real contracts.'],
  ['coverage','Coverage identifies unexecuted code but high coverage alone does not demonstrate that assertions are meaningful.'],
  ['regression','A regression test should capture a previously observed failure so future changes preserve the repaired behavior.'],
  ['loadtesting','Load tests measure throughput, latency distributions, saturation, and failure behavior under realistic concurrency.']
 ],
 data:[
  ['map','Map stores keyed values with explicit key identity semantics and is preferable to plain objects when arbitrary keys and insertion order matter.'],
  ['set','Set stores unique values and supports efficient membership checks; converting arrays to sets is useful when repeated membership tests dominate.'],
  ['typedarrays','Typed arrays provide fixed-width numeric views over binary buffers and are useful for WebGPU, WebAssembly, image, and signal-processing data.'],
  ['dataview','DataView provides explicit endianness control and mixed-width reads and writes over an ArrayBuffer.'],
  ['immutability','Immutable data structures reduce accidental aliasing and simplify reasoning, but copying large structures can have real memory costs.'],
  ['normalization','Data normalization converts equivalent representations into canonical forms, improving matching, caching, and validation.'],
  ['pagination','Cursor pagination is generally more stable than offset pagination when records can be inserted or deleted while a client is traversing results.'],
  ['validation','Validate external data at system boundaries and convert it into trusted internal representations before business logic consumes it.'],
  ['schema','Explicit schemas improve compatibility by documenting fields, types, optionality, and evolution rules.'],
  ['csv','CSV is deceptively simple: quoted fields, embedded commas, newlines, and escaping require a real parser rather than naive split(',').']
 ],
 web:[
  ['http','HTTP semantics distinguish safe, idempotent, and cacheable methods; API design should preserve these semantics where practical.'],
  ['status','HTTP status codes communicate broad outcome classes, while response bodies can provide structured application-level error details.'],
  ['etag','ETag enables conditional requests with If-None-Match and can reduce payload transfer when a representation has not changed.'],
  ['cachecontrol','Cache-Control directives define freshness and reuse behavior; private and sensitive responses require careful cache policy.'],
  ['websocket','WebSocket provides a long-lived bidirectional channel but applications still need heartbeat, reconnect, ordering, and backpressure strategies.'],
  ['sse','Server-Sent Events provide a simple server-to-browser stream over HTTP and are useful for unidirectional live updates.'],
  ['webrtc','WebRTC supports peer media and data channels with complex signaling and NAT traversal requirements handled through surrounding protocols.'],
  ['compression','Compression reduces transfer size at the cost of CPU; already-compressed binary formats usually gain little from repeated compression.'],
  ['streaming','Streaming responses reduce time-to-first-byte and peak memory when consumers can process incremental chunks.'],
  ['retryafter','Retry-After communicates a suggested delay for retryable operations and can be combined with exponential backoff and jitter.']
 ]
};
export const LARGE_JAVASCRIPT_KNOWLEDGE_V15=Object.entries(packs).flatMap(([domain,items])=>items.map(([topic,text])=>({domain,topic,text}))); 
export const LARGE_JAVASCRIPT_KNOWLEDGE_V15_TEXT=LARGE_JAVASCRIPT_KNOWLEDGE_V15.map(x=>`[${x.domain}/${x.topic}] ${x.text}`).join('\n');
export const javascriptKnowledgeV15Stats={version:'15.0',domains:Object.keys(packs).length,entries:LARGE_JAVASCRIPT_KNOWLEDGE_V15.length,pretrained:false,externalNeuralModel:false,source:'authored-pure-javascript-knowledge'};
if(typeof window!=='undefined')window.TONYLargeJavaScriptKnowledgeV15={LARGE_JAVASCRIPT_KNOWLEDGE_V15,LARGE_JAVASCRIPT_KNOWLEDGE_V15_TEXT,javascriptKnowledgeV15Stats};
