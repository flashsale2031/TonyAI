// TONY Large JavaScript Knowledge Expansion v21.
// Authored pure-JavaScript engineering knowledge; not a pretrained neural checkpoint.
const packs={
 language:[
  ['Temporal-style immutability','Prefer explicit immutable state transitions when shared JavaScript state would otherwise create hidden mutation paths.'],
  ['Iterator helpers','Iterator-helper patterns compose lazy map/filter/take operations without materializing intermediate arrays.'],
  ['Error causes','Use Error cause chains to preserve the original failure while adding higher-level context.'],
  ['Explicit resource management','Resource-lifetime patterns should make acquisition, cleanup, and failure paths visible rather than relying on accidental garbage collection.'],
  ['Decorators','Decorator metadata should be applied deliberately because decoration changes class or method semantics.'],
  ['RegExp indices','Regular-expression match indices can preserve exact source spans for parsers and editors.'],
  ['Intl formatting','Intl APIs should handle locale-sensitive number, date, list, and plural formatting instead of hard-coded presentation rules.'],
  ['Array grouping','Grouping records should preserve a clear key function and avoid accidental prototype-key collisions.'],
  ['JSON boundaries','JSON is a data interchange format, not a complete JavaScript object serialization format; functions, undefined, cycles, and prototypes require explicit handling.'],
  ['Numeric precision','Use BigInt or decimal-oriented strategies when integer or monetary precision exceeds Number-safe ranges.']
 ],
 async:[
  ['Async cleanup','Async resource cleanup should be awaited so shutdown does not race outstanding work.'],
  ['Cancellation trees','Hierarchical AbortSignal patterns let parent operations cancel dependent asynchronous work together.'],
  ['Concurrency limits','Bounded promise concurrency prevents large input sets from overwhelming memory, sockets, or service quotas.'],
  ['Async queues','An async queue can separate producers from consumers while providing explicit backpressure and shutdown semantics.'],
  ['Promise settlement','Promise.allSettled is useful when every operation matters even when individual operations fail.'],
  ['Race timeouts','Promise.race can implement timeouts, but timed-out work may continue unless the underlying operation also receives cancellation.'],
  ['Async generators','Async generators are useful for streaming records while naturally expressing await points between batches.'],
  ['Microtask ordering','Promise callbacks run as microtasks and can repeatedly delay macrotask work if code continuously schedules more microtasks.'],
  ['Retry jitter','Retries should include bounded jitter to avoid synchronized retry storms.'],
  ['Async ownership','The component that starts asynchronous work should define who owns cancellation, errors, and final cleanup.']
 ],
 node:[
  ['Node streams','Node streams provide incremental processing and backpressure for data that should not be loaded into memory at once.'],
  ['Pipeline cleanup','stream.pipeline coordinates stream completion and propagates errors while reducing cleanup mistakes.'],
  ['Worker threads','Worker threads are appropriate for CPU-heavy JavaScript that would otherwise block the event loop.'],
  ['Child process boundaries','Child processes provide stronger isolation than worker threads but require explicit IPC and lifecycle management.'],
  ['Node permissions','Permission-oriented runtime controls can reduce the authority available to application code and dependencies.'],
  ['Diagnostics channels','Node diagnostic channels can expose instrumentation events without tightly coupling application logic to a monitoring vendor.'],
  ['Async local storage','AsyncLocalStorage can associate request-scoped context across asynchronous call chains.'],
  ['Graceful shutdown','Servers should stop accepting work, drain active operations, close resources, and then exit.'],
  ['HTTP agents','HTTP connection pooling and keep-alive settings affect latency, socket pressure, and upstream load.'],
  ['Buffer discipline','Buffers represent bytes; conversions between bytes and text should specify encoding boundaries explicitly.']
 ],
 browser:[
  ['Navigation lifecycle','Browser applications should distinguish document navigation, history changes, rendering, and asynchronous data loading.'],
  ['Intersection observation','IntersectionObserver can trigger work based on viewport visibility without continuous scroll polling.'],
  ['Resize observation','ResizeObserver is useful when layout behavior depends on element dimensions rather than viewport dimensions.'],
  ['Mutation observation','MutationObserver can observe DOM changes while batching mutation records into microtask-driven callbacks.'],
  ['Shadow boundaries','Shadow DOM isolates component markup and styles while still allowing explicit communication through component APIs.'],
  ['Custom elements','Custom elements define lifecycle callbacks and should keep constructors lightweight because upgrade and creation timing matters.'],
  ['Pointer events','Pointer Events unify mouse, touch, and pen input behind a common event model.'],
  ['Offscreen rendering','OffscreenCanvas can move compatible rendering work away from the main UI thread.'],
  ['Broadcast channels','BroadcastChannel can coordinate same-origin browser contexts without manually routing every message through a server.'],
  ['Page visibility','Visibility state should influence polling, animation, and background work to avoid wasting resources in hidden tabs.']
 ],
 security:[
  ['Trusted Types','Trusted Types can constrain dangerous DOM injection sinks and encourage centralized HTML or script creation policies.'],
  ['CSP nonces','Nonce-based Content Security Policy allows trusted inline scripts without broadly enabling arbitrary inline execution.'],
  ['Subresource integrity','SRI lets browsers verify expected hashes for externally loaded static resources.'],
  ['Cookie prefixes','Cookie prefixes such as __Host- and __Secure- communicate stronger deployment requirements to browsers.'],
  ['SameSite policy','SameSite cookie attributes reduce some cross-site request risks while changing authentication behavior across navigation contexts.'],
  ['Origin checks','Security-sensitive browser endpoints should validate origins or equivalent authorization context rather than trusting request shape alone.'],
  ['WebCrypto boundaries','Web Crypto exposes cryptographic primitives, but key lifecycle, algorithm choice, randomness, and protocol design remain application responsibilities.'],
  ['Permissions Policy','Permissions Policy can restrict selected browser capabilities available to documents and embedded frames.'],
  ['Referrer Policy','Referrer Policy controls how much referring URL information is exposed during navigation and resource requests.'],
  ['HSTS','HTTP Strict Transport Security tells compatible browsers to use HTTPS for a site after receiving an appropriate policy.']
 ],
 performance:[
  ['Long tasks','Long main-thread tasks increase input latency and should be split or moved off-thread when possible.'],
  ['Performance marks','Performance marks and measures provide named timing points for application instrumentation.'],
  ['Layout thrashing','Repeated alternating DOM reads and writes can force avoidable layout work; batching phases reduces this cost.'],
  ['Memoization keys','Memoization is effective only when keys correctly represent inputs and retained values have a bounded lifetime.'],
  ['Typed arrays','Typed arrays provide predictable binary layouts and can reduce conversion overhead in numeric workloads.'],
  ['Transferables','Transferable objects can move ownership between workers without copying the underlying data in supported cases.'],
  ['Code splitting','Dynamic imports can divide application code so rarely used features are loaded on demand.'],
  ['Resource hints','Preconnect and related resource hints can reduce connection setup latency when the target is known and useful.'],
  ['Batching','Batching repeated operations can reduce fixed per-operation overhead but should respect latency requirements.'],
  ['Cache invalidation','A cache is useful only when its invalidation, freshness, and memory policy are explicit.']
 ],
 architecture:[
  ['Dependency inversion','High-level modules should depend on stable abstractions rather than concrete infrastructure details.'],
  ['Ports and adapters','Ports-and-adapters designs isolate domain logic from browsers, databases, networks, and other external systems.'],
  ['Idempotency','Idempotent commands can be safely retried when repeated delivery is expected.'],
  ['Circuit breakers','Circuit breakers prevent repeatedly calling an unhealthy dependency and give recovery time.'],
  ['Bulkheads','Bulkhead limits prevent one workload from consuming every worker, connection, or queue slot.'],
  ['State machines','Explicit state machines make legal transitions and terminal states easier to test than scattered boolean flags.'],
  ['Event sourcing boundaries','Event-oriented designs should distinguish durable facts from transient projections and caches.'],
  ['Feature flags','Feature flags should have ownership, expiration, and observability so temporary branches do not become permanent complexity.'],
  ['Pure transformations','Pure transformation functions simplify deterministic testing because output depends only on declared input.'],
  ['Configuration boundaries','Configuration should be validated at startup and represented internally in a normalized form.']
 ],
 testing:[
  ['Property testing','Property-based tests validate general invariants across many generated inputs rather than relying only on hand-picked examples.'],
  ['Fuzz testing','Fuzzing is effective for parsers, decoders, protocol handlers, and boundary-heavy utility functions.'],
  ['Contract tests','Contract tests verify assumptions between independently developed components or services.'],
  ['Deterministic tests','Tests should control time, randomness, scheduling, and external dependencies when nondeterminism would obscure failures.'],
  ['Integration isolation','Integration tests should isolate external state so failures are reproducible and cleanup is reliable.'],
  ['Snapshot discipline','Snapshots are most useful for stable structures where unexpected changes are meaningful, not as a substitute for behavioral assertions.'],
  ['Flaky-test telemetry','A flaky test should be tracked as a reliability defect rather than repeatedly retried until ignored.'],
  ['Mutation testing','Mutation testing checks whether the test suite can detect deliberate changes to implementation behavior.'],
  ['Load testing','Load tests should measure throughput, latency distributions, saturation, errors, and resource consumption together.'],
  ['Regression suites','Regression tests should encode previously observed defects so fixes remain durable.']
 ],
 data:[
  ['Structured cloning','Structured clone handles many built-in data types without preserving arbitrary prototype behavior or executable code.'],
  ['IndexedDB transactions','IndexedDB transactions have explicit lifetime and concurrency behavior; long-running application work should not assume a transaction stays open indefinitely.'],
  ['Streaming validation','Large inputs should often be validated incrementally instead of converting the entire payload into an in-memory structure first.'],
  ['Stable sorting','Stable sort preserves the relative order of records with equivalent keys, which can simplify multi-stage ordering.'],
  ['Binary protocols','Binary protocols should define byte order, field widths, encoding, framing, and validation rules explicitly.'],
  ['Normalization','Normalization reduces equivalent representations before comparison, indexing, or storage.'],
  ['CSV ambiguity','CSV parsing must account for quoting, embedded delimiters, line breaks, and escaping rather than splitting only on commas.'],
  ['JSON schema boundaries','Data validation should distinguish syntactic JSON validity from application-level schema validity.'],
  ['Moving windows','Sliding-window analytics should define boundary inclusion and behavior when observations are missing or duplicated.'],
  ['Join cardinality','Data joins can multiply rows unexpectedly; cardinality assumptions should be tested before aggregation.']
 ],
 web:[
  ['ETag caching','ETags let clients validate whether a representation changed without downloading the full payload again.'],
  ['HTTP status semantics','HTTP status codes communicate broad outcome classes and should not be treated as arbitrary application error numbers.'],
  ['Problem details','Problem Details responses provide a structured way to describe HTTP API errors.'],
  ['Idempotency keys','Idempotency keys allow selected APIs to safely recognize repeated requests and avoid duplicate effects.'],
  ['Server-sent events','SSE provides a simple one-way event stream from server to browser over HTTP.'],
  ['WebSockets','WebSockets provide persistent bidirectional communication but require explicit heartbeat, reconnect, authorization, and backpressure strategies.'],
  ['Fetch streams','Fetch request and response bodies can be streamed when the runtime and server support incremental processing.'],
  ['Content encoding','Content-Encoding describes transformations such as compression applied to HTTP representations.'],
  ['Range requests','HTTP range requests can retrieve selected byte ranges for large resources when the server supports them.'],
  ['HTTP/3','HTTP/3 uses QUIC transport and changes connection behavior compared with TCP-based HTTP versions.']
 ]
};
export const LARGE_JAVASCRIPT_KNOWLEDGE_V21=Object.entries(packs).flatMap(([domain,items])=>items.map(([concept,detail])=>({domain,concept,detail,source:'TONY-authored-v21'})));
export const LARGE_JAVASCRIPT_KNOWLEDGE_V21_TEXT=LARGE_JAVASCRIPT_KNOWLEDGE_V21.map(x=>`[JavaScript/${x.domain}] ${x.concept}: ${x.detail}`).join('\n');
export const javascriptKnowledgeV21Stats=()=>({version:21,domains:Object.keys(packs).length,entries:LARGE_JAVASCRIPT_KNOWLEDGE_V21.length,pretrained:false,authored:true});
if(typeof window!=='undefined')window.TONYLargeJavaScriptKnowledgeV21={LARGE_JAVASCRIPT_KNOWLEDGE_V21,LARGE_JAVASCRIPT_KNOWLEDGE_V21_TEXT,javascriptKnowledgeV21Stats};
