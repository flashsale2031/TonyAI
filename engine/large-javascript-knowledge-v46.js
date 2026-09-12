// TONY Large JavaScript Knowledge v46.
// Authored deterministic JavaScript/web engineering knowledge; no pretrained model.
const packs={language:[
'Primitive conversion can invoke Symbol.toPrimitive, valueOf, or toString, so implicit coercion may execute user-defined behavior.',
'Numeric separators improve readability without changing the numeric value represented by a literal.',
'Class static initialization blocks execute during class definition and can initialize shared static state.',
'Private methods and accessors follow the same private-name rules as private fields.',
'Logical operators return operand values rather than necessarily returning booleans, which enables short-circuit value selection.',
'Bitwise operators convert operands to signed 32-bit integers, so they are unsuitable for arbitrary-width integer arithmetic.',
'Exponentiation with BigInt requires BigInt operands and preserves integer arithmetic semantics.',
'Unicode-aware regular expressions depend on flags such as u and v when matching modern Unicode syntax.',
'String iteration with for...of follows Unicode code points rather than UTF-16 code units.',
'Intl APIs provide locale-sensitive formatting and should be preferred over hand-built locale rules.'
],modules:[
'Module import bindings are immutable from the importer side even though the exporting module may update the underlying binding.',
'Import cycles can work when accesses occur after initialization, but reading an uninitialized lexical export can throw.',
'Top-level await changes asynchronous module evaluation and can affect the startup latency of dependent modules.',
'Package self-references can provide stable internal imports when the package export map exposes them.',
'Conditional exports should avoid overlapping conditions whose order accidentally selects an unintended target.',
'Import maps are scoped by document and can define scoped remappings for dependency trees.',
'Dynamic import errors reject the returned promise rather than throwing synchronously from the import expression.',
'Bundler side-effect metadata must be accurate because incorrect declarations can remove required initialization code.',
'Module workers use module semantics when constructed with the module type and can use import statements directly.',
'Library entry points should preserve a stable public surface even when internal modules are split for optimization.'
],browser:[
'AbortSignal can be passed to fetch and other cancellable APIs so cancellation propagates through the operation boundary.',
'ReadableStream locking means only one reader can normally consume a stream at a time unless the stream is explicitly teed.',
'Form submission can be intercepted to perform validation or asynchronous processing before navigation occurs.',
'URLPattern can match structured URL components in environments that support the API and can simplify route classification.',
'BroadcastChannel messages are delivered asynchronously and do not provide durable message storage.',
'Pagehide is useful for lifecycle persistence because it can occur when a document is being moved into the back-forward cache.',
'Visibility changes should pause optional polling rather than stopping mandatory state synchronization.',
'IntersectionObserver callbacks can batch multiple target changes and should avoid expensive work for every entry.',
'ResizeObserver can expose device-pixel-content-box information where supported for graphics-sensitive components.',
'Custom elements should define upgrade behavior carefully because existing matching elements can be upgraded after their definition is registered.'
],web:[
'HTTP cache validation with If-None-Match can return a not-modified response when the representation remains current.',
'ETag values should be treated as opaque validators rather than parsed into application semantics.',
'Fetch credentials behavior determines whether cookies and other credentials accompany cross-origin requests.',
'Response redirects can be followed, exposed, or rejected according to the request redirect mode.',
'WebSocket close codes communicate shutdown categories and should be mapped to explicit reconnect policies.',
'EventSource automatically reconnects under its protocol behavior, so servers should send appropriate retry guidance when needed.',
'WebTransport provides datagram and stream primitives in environments that support the protocol and should still apply application authentication.',
'Compression streams can reduce transfer or storage overhead but introduce CPU work and should be measured against the workload.',
'File System Access operations are permission-sensitive and should gracefully handle revoked or unavailable handles.',
'Web Locks callbacks should release the lock by resolving their callback promise rather than relying on explicit unlock calls.'
],node:[
'Node HTTP servers should enforce request size limits before buffering bodies to prevent accidental memory exhaustion.',
'Keep-alive timeout choices affect socket reuse and should match upstream and downstream idle timeout expectations.',
'Abort signals should be propagated through nested Node operations so cancellation reaches the actual resource owner.',
'Worker thread pools should cap concurrency because creating one worker per request can increase overhead and memory pressure.',
'AsyncLocalStorage context can be lost across APIs that deliberately detach execution, so critical identity should not depend on implicit context alone.',
'Node streams should handle backpressure by respecting writable return values and drain events when manually piping data.',
'File descriptor ownership should be explicit when multiple layers share a file handle or stream.',
'Child-process stdout and stderr can fill buffers when not consumed, potentially preventing completion.',
'Graceful shutdown should account for upgraded HTTP connections and other long-lived resources separately from ordinary requests.',
'Process-level uncaught failures should be observable and followed by a controlled shutdown when application invariants are no longer trustworthy.'
],security:[
'Authorization should be checked for the requested resource and operation, not inferred solely from successful authentication.',
'CSRF protection remains necessary for state-changing cookie-authenticated requests even when an endpoint uses POST.',
'CORS response headers should be generated from an explicit origin policy rather than blindly reflecting arbitrary Origin values.',
'CSP report handling should avoid treating reports as trusted application commands because report payloads are attacker-influenced.',
'Trusted Types policies should remain narrow so a single broad policy does not recreate unsafe string-to-DOM flows.',
'SRI is most useful for immutable versioned assets whose expected digest can be managed reliably.',
'Cookie prefixes such as __Host- and __Secure- impose additional browser-enforced constraints that can strengthen deployment invariants.',
'Frame embedding policy should consider both CSP frame-ancestors and application authorization requirements.',
'Referrer information can leak sensitive URL paths, so privacy-sensitive applications should choose a restrictive policy.',
'Security telemetry should distinguish rejected requests from successful requests that merely contain suspicious indicators.'
],performance:[
'Batching DOM writes reduces repeated style and layout work when many elements must change during one update.',
'Intersection-based rendering can defer expensive component setup until content approaches the viewport.',
'Idle callbacks are best treated as opportunistic because idle time is not guaranteed on busy devices.',
'Memoization should include a bounded cache policy when inputs can have high cardinality.',
'Structural sharing can reduce allocation and comparison costs for immutable application state trees.',
'Workers can isolate CPU-heavy parsing or transformation from the main thread but add serialization or transfer overhead.',
'Performance budgets should define limits for script size, startup work, long tasks, and key interaction latency.',
'Resource timing can reveal connection, request, response, and transfer phases that aggregate page timings hide.',
'Long-task attribution can identify the script responsible for blocking the main thread when browser support exposes attribution data.',
'Caching should distinguish correctness-critical freshness from optional performance caching.'
],testing:[
'Property tests for serializers can assert round-trip invariants without requiring one fixed serialized representation.',
'Parser fuzzing should include random truncation because partial network or file input is a common failure mode.',
'Differential tests can compare browser and server implementations of shared normalization logic.',
'Contract tests should fail when an optional field unexpectedly becomes required because compatibility is part of the contract.',
'Fake timers must account for microtasks as well as timer queues when testing asynchronous JavaScript behavior.',
'Resource-leak tests should assert cleanup after both success and exceptional paths.',
'Golden tests should normalize intentionally nondeterministic metadata before comparison rather than weakening all assertions.',
'Concurrency tests should repeat controlled schedules to exercise lock acquisition, cancellation, and retry boundaries.',
'Regression fixtures should retain the smallest input that reproduces a defect when possible.',
'End-to-end failures are easier to diagnose when logs include stable correlation identifiers and step boundaries.'
],architecture:[
'Ports and adapters can isolate browser, Node, network, and persistence details from application policy.',
'State machines make legal transitions explicit and prevent unrelated code from mutating lifecycle state arbitrarily.',
'Command handlers should be idempotent when callers may retry after uncertain delivery outcomes.',
'Deduplication stores need an expiration strategy when operation identities are only meaningful for a bounded period.',
'Leases require renewal and expiration handling because ownership cannot be assumed permanent.',
'Queue consumers should make acknowledgment timing explicit relative to side effects.',
'At-least-once delivery is safer when side effects are transactional or protected by idempotency keys.',
'Bounded concurrency should exist at every external dependency boundary that can become saturated.',
'Circuit breakers should permit controlled recovery probes instead of remaining permanently open.',
'Feature flags should have an explicit default state so missing configuration does not accidentally enable unfinished behavior.'
],data:[
'ArrayBuffer and SharedArrayBuffer differ in sharing semantics and should not be interchanged casually.',
'DataView allows explicit byte offsets and endianness for binary protocol parsing.',
'Typed arrays provide fixed element types but their byte offsets and lengths should be validated against protocol boundaries.',
'Structured clone can transfer ownership of supported objects when listed in the transfer option.',
'Map keys use SameValueZero semantics, so NaN keys can match another NaN key.',
'Set membership also uses SameValueZero semantics and therefore treats NaN as equal to NaN.',
'Object.hasOwn avoids inherited properties and is preferable to unguarded prototype method calls for ownership checks.',
'toSorted, toReversed, and with provide non-mutating array transformations useful for functional update patterns.',
'Normalization pipelines should preserve the distinction between absent fields and explicitly supplied null when that distinction affects semantics.',
'Data schemas should specify units and numeric domains so a value such as 100 is not ambiguous between bytes, milliseconds, or percentages.'
]};
export const LARGE_JAVASCRIPT_KNOWLEDGE_V46_TEXT=Object.entries(packs).flatMap(([pack,entries])=>entries.map((text,i)=>`[JavaScript v46/${pack}/${i+1}] ${text}`)).join('\n');
export const javascriptKnowledgeV46Stats=()=>({version:'46.0',packs:Object.keys(packs).length,entries:Object.values(packs).reduce((n,x)=>n+x.length,0),characters:LARGE_JAVASCRIPT_KNOWLEDGE_V46_TEXT.length,pretrained:false,authored:true});
if(typeof window!=='undefined')window.TONYLargeJavaScriptKnowledgeV46={LARGE_JAVASCRIPT_KNOWLEDGE_V46_TEXT,javascriptKnowledgeV46Stats};
