// TONY Large JavaScript Knowledge v55.
// Authored deterministic JavaScript/web engineering knowledge; no pretrained model.
const packs={
 language:[
  'Primitive values are immutable; object identity and value equality are separate concepts in JavaScript.',
  'Number arithmetic uses IEEE-754 double precision, so integer precision is limited beyond Number.MAX_SAFE_INTEGER.',
  'String indexing exposes UTF-16 code units; code-point-aware iteration should use for...of or code point APIs.',
  'Unicode normalization can make visually equivalent strings compare differently unless normalization policy is explicit.',
  'Intl APIs provide locale-sensitive formatting and comparison without hand-written locale tables.',
  'Static class initialization blocks run during class definition and can initialize private static state.',
  'Getters and setters participate in property access and should avoid surprising side effects during inspection.',
  'Property descriptors control enumerability, configurability, writability, and accessor behavior.',
  'Object.freeze is shallow; nested objects require separate freezing when deep immutability is required.',
  'The language specification distinguishes completion, reference, and value semantics, which explains many coercion edge cases.'
 ],
 modules:[
  'Module evaluation is ordered by the dependency graph, with cycles requiring careful initialization design.',
  'Dynamic import is asynchronous even when the target module is already cached.',
  'A module namespace exposes exports without allowing consumers to replace the underlying live bindings.',
  'Package import maps and exports should be treated as API contracts because consumers depend on stable specifiers.',
  'Conditional package exports can distinguish browser and server environments without runtime string hacks.',
  'Top-level await can intentionally serialize dependent module startup and should be used with awareness of graph latency.',
  'Side-effect-free modules are easier to tree-shake and safer to initialize repeatedly in tests.',
  'Import assertions and module types make resource interpretation explicit where supported by the runtime.',
  'Circular dependencies are often a design smell when modules require partially initialized state from each other.',
  'Module boundaries should expose small stable interfaces and keep implementation details private.'
 ],
 async:[
  'Promise callbacks are microtasks and therefore run before the event loop proceeds to another ordinary task.',
  'Async iteration can naturally model paginated or streamed data without loading every item into memory.',
  'AbortSignal can be composed into application cancellation paths so work stops when its owner disappears.',
  'Promise.any reports an AggregateError when every candidate rejects.',
  'Promise.all preserves input ordering in its fulfillment array regardless of completion ordering.',
  'Async resource ownership should be explicit so cancellation closes streams, timers, sockets, and listeners.',
  'A retry policy should distinguish transient errors from permanent validation or authorization failures.',
  'Jittered backoff prevents many clients from retrying at exactly the same instant.',
  'Bounded concurrency protects both local resources and remote service quotas.',
  'Async functions should avoid unbounded recursive scheduling that can create runaway microtask workloads.'
 ],
 browser:[
  'Page Visibility events allow applications to reduce background work when a document is hidden.',
  'History API state changes can update navigation without a full page load but require coherent URL and state ownership.',
  'FormData preserves multipart form semantics and is useful for browser file uploads.',
  'Blob URLs should be revoked when their associated object is no longer needed to prevent resource retention.',
  'Custom elements define lifecycle callbacks that should clean up listeners and observers when disconnected.',
  'Shadow DOM provides style and structure encapsulation but does not replace authorization or data isolation.',
  'The dialog element can manage modal interaction and focus behavior more reliably than ad hoc overlays.',
  'The popover API supports lightweight transient UI while leaving application-specific positioning and content logic explicit.',
  'Storage events notify other same-origin documents about localStorage changes but do not fire in the writing document.',
  'Beforeunload is intentionally constrained by browsers and should not be treated as reliable arbitrary cleanup.'
 ],
 streams:[
  'ReadableStream cancellation should propagate upstream so abandoned consumers do not leave producers running.',
  'WritableStream backpressure is signaled through the writer ready promise and should shape producer throughput.',
  'TransformStream can implement parsing, filtering, compression, and protocol framing as composable stages.',
  'TextDecoderStream handles byte-to-text boundaries across chunks without requiring manual UTF-8 carry buffers.',
  'Teeing a stream can cause one branch to accumulate buffered data when consumers proceed at different rates.',
  'Streaming protocols should define message framing independently from transport chunk boundaries.',
  'Incremental parsers should retain only the minimum incomplete state needed to continue after the next chunk.',
  'A stream pipeline should have a clear owner responsible for aborting or closing every stage.',
  'Streaming responses improve time-to-first-content but do not automatically reduce total transferred bytes.',
  'Backpressure is an end-to-end property and can be defeated by an intermediate stage that eagerly buffers everything.'
 ],
 node:[
  'Node HTTP request bodies are streams and should be bounded so a client cannot force unbounded memory allocation.',
  'Connection keep-alive improves latency by avoiding repeated handshakes but requires idle socket limits.',
  'Node timers should be cleared when their owning operation completes or is canceled.',
  'File paths should be resolved against an explicit trusted root when serving user-selected resources.',
  'Environment variables should be parsed once into validated configuration rather than repeatedly interpreted throughout code.',
  'Graceful shutdown should stop new work first, then drain or cancel active work within a bounded deadline.',
  'Worker threads move CPU-heavy JavaScript away from the main event loop but add messaging and memory overhead.',
  'AsyncLocalStorage is useful for request correlation IDs and other scoped diagnostic context.',
  'Node TLS clients should use certificate verification and current protocol defaults unless a documented exception exists.',
  'Child-process pipes are resources and should be closed and monitored when a child exits unexpectedly.'
 ],
 security:[
  'Authorization must be enforced on the server even when the browser UI hides controls for unauthorized operations.',
  'Origin and host validation should occur before accepting browser-sensitive state-changing requests.',
  'SameSite cookies reduce some cross-site request risks but do not eliminate the need for application authorization.',
  'CSP report-only mode can reveal policy violations before enforcement is enabled.',
  'Trusted Types makes dangerous DOM conversions explicit and can expose unsafe HTML construction during testing.',
  'SRI hashes should be updated deliberately when static assets change rather than bypassing integrity checks.',
  'Cross-origin isolation enables selected high-performance APIs but must be deployed with compatible resource headers.',
  'Sandboxed iframes should receive only the capabilities required by their content.',
  'Rate limits should be applied at the boundary and designed so rejection is cheap under abusive load.',
  'Secrets should remain out of source code, logs, URLs, client bundles, and generated diagnostic artifacts.'
 ],
 performance:[
  'Avoiding forced synchronous layout is often more valuable than micro-optimizing individual JavaScript expressions.',
  'Batching DOM reads before writes reduces layout recalculation and makes rendering work easier to reason about.',
  'requestAnimationFrame is appropriate for visual state changes but not for arbitrary background computation.',
  'IntersectionObserver can replace scroll polling for visibility-triggered work.',
  'ResizeObserver is useful for responsive components whose layout depends on actual element size.',
  'Virtualized rendering should preserve enough overscan to avoid visible gaps during fast scrolling.',
  'Memoization needs bounded cache size or eviction when inputs can grow without limit.',
  'Long-task measurements should be correlated with user interactions to identify responsiveness regressions.',
  'Resource Timing can reveal network bottlenecks that are invisible from application-level timers alone.',
  'Performance budgets turn speed requirements into testable constraints rather than subjective impressions.'
 ],
 testing:[
  'Contract tests verify that an implementation obeys the interface assumptions made by its consumers.',
  'Differential testing compares outputs from independent implementations to detect subtle semantic discrepancies.',
  'Fuzzing should use explicit input and time budgets so malformed inputs cannot consume unbounded resources.',
  'Race tests should cover cancellation occurring before, during, and after asynchronous completion.',
  'Snapshot tests are strongest when snapshots represent stable public behavior rather than incidental formatting.',
  'Golden tests should include deterministic generation so failures can be reproduced byte-for-byte.',
  'Integration tests should exercise real serialization and transport boundaries where unit mocks can hide defects.',
  'Cleanup assertions should detect leaked timers, event listeners, workers, file handles, and sockets.',
  'Regression tests should encode every previously confirmed bug that has meaningful recurrence risk.',
  'Mutation testing is useful for identifying assertions that execute code without actually checking its behavior.'
 ],
 architecture:[
  'Ports-and-adapters architecture keeps core policies independent from HTTP, filesystem, browser, and vendor APIs.',
  'State machines make allowed transitions explicit and prevent invalid intermediate states.',
  'Idempotent commands are easier to retry safely when network delivery is at-least-once.',
  'Leases should have expiration and renewal rules so abandoned work can eventually become available again.',
  'Bounded queues protect systems from memory growth when producers outpace consumers.',
  'Circuit breakers should distinguish dependency failure from local input errors before opening.',
  'Dead-letter handling should preserve enough context to diagnose why work failed without storing secrets.',
  'Health endpoints should remain cheap and avoid performing expensive dependency calls on every probe.',
  'Observability should connect logs, metrics, traces, and request IDs without leaking sensitive payloads.',
  'Configuration should have explicit defaults and validation so behavior does not depend on accidental environment state.'
 ],
 data:[
  'Map is preferable to object dictionaries when arbitrary keys, including objects, are part of the data model.',
  'Set is useful for uniqueness but preserves insertion order when iterated.',
  'TypedArray views share underlying ArrayBuffer storage, so mutations through one compatible view can affect another.',
  'DataView is appropriate for binary formats containing mixed widths or explicit endianness.',
  'structuredClone supports richer data graphs than JSON serialization and can preserve cycles for supported types.',
  'Sorting with a comparator should define a consistent ordering relation to avoid surprising results.',
  'toSorted and toReversed make non-mutating collection transformations explicit.',
  'Array.prototype.with provides an immutable indexed replacement without mutating the source array.',
  'Schema validation should reject unknown or malformed fields when an API contract requires strict input.',
  'Canonical serialization is valuable when hashes, cache keys, signatures, or reproducible artifacts depend on byte identity.'
 ]
};
export const LARGE_JAVASCRIPT_KNOWLEDGE_V55_TEXT=Object.entries(packs).flatMap(([pack,items])=>items.map((text,i)=>`[v55:${pack}:${i+1}] ${text}`)).join('\n');
export const javascriptKnowledgeV55Stats=()=>({version:'55',packs:Object.fromEntries(Object.entries(packs).map(([k,v])=>[k,v.length])),entries:Object.values(packs).reduce((n,v)=>n+v.length,0),authored:true,pretrained:false,domain:'javascript-web-engineering'});
if(typeof window!=='undefined')window.TONYLargeJavaScriptKnowledgeV55={LARGE_JAVASCRIPT_KNOWLEDGE_V55_TEXT,javascriptKnowledgeV55Stats};
