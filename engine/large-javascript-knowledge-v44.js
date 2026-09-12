// TONY Large JavaScript Knowledge v44.
// Authored deterministic knowledge; no pretrained neural model.
const packs={language:[
'let and const bindings are block scoped, while var bindings are function scoped and can create surprising redeclaration behavior.',
'Nullish coalescing selects a fallback only for null or undefined, unlike logical OR which also treats other falsy values as absent.',
'Optional chaining short-circuits a property, call, or element access when its receiver is nullish.',
'Private class fields are enforced by the language and are distinct from conventionally underscored public properties.',
'Symbol keys avoid collisions with ordinary string keys but remain discoverable through Reflect.ownKeys.',
'Numeric separators improve readability of large numeric literals without changing their numeric value.',
'BigInt is for arbitrary-size integers and cannot be implicitly mixed with Number arithmetic.',
'Object.is differs from strict equality for NaN and signed zero and is useful when those distinctions matter.',
'Logical assignment operators combine a read condition with an assignment and can avoid unnecessary writes.',
'Destructuring defaults apply when a value is undefined, not merely when it is any falsy value.'
],modules:[
'ES module imports are statically analyzable and module bindings are live rather than copied snapshots.',
'Dynamic import returns a promise for a module namespace and can defer loading until a feature is needed.',
'top-level await pauses module evaluation for dependents that must wait for that module.',
'Circular modules can expose partially initialized bindings, so initialization order must be designed carefully.',
'Package exports can restrict public entry points and provide conditional mappings for different environments.',
'Import maps can remap module specifiers in browser environments without changing source import statements.',
'Module namespace objects expose read-only live views of exported bindings.',
'Side-effect-only imports execute a module without binding its exports in the importing module.',
'CommonJS and ESM interop has runtime-specific rules and should not be assumed identical across bundlers and Node versions.',
'Code splitting works best when independently useful feature boundaries align with dynamic import boundaries.'
],dom:[
'Event delegation attaches a handler to a stable ancestor and uses event.target or composedPath to identify relevant descendants.',
'CustomEvent carries application-defined event data and can preserve a clean boundary between producers and consumers.',
'DocumentFragment allows multiple DOM changes to be assembled before insertion, reducing repeated attachment and layout work.',
'HTML template elements hold inert markup that can be cloned into live DOM trees.',
'Shadow DOM encapsulates component internals while selected events can cross the boundary through composed event behavior.',
'Pointer capture keeps subsequent pointer events associated with a chosen element even when the pointer leaves its bounds.',
'MutationObserver batches DOM mutation notifications asynchronously rather than synchronously invoking application callbacks.',
'ResizeObserver reports element size changes without requiring continuous polling.',
'IntersectionObserver can detect visibility relationships without a scroll handler running for every scroll event.',
'Dialog and popover primitives provide browser-managed interaction states that can reduce custom overlay code.'
],networking:[
'Fetch abort should propagate an AbortSignal to the actual request so cancellation can release underlying resources.',
'ETag validators let clients perform conditional requests and avoid transferring unchanged representations.',
'HTTP idempotency keys can make retried creation requests safe when the server stores and reuses a prior result.',
'Response bodies are streams and should be consumed incrementally when payloads may be large.',
'WebSocket connections need explicit reconnect policy, heartbeat handling, and backoff when long-lived connectivity matters.',
'EventSource is designed for server-sent events and automatically reconnects under supported conditions.',
'BroadcastChannel communicates between same-origin contexts without requiring a server round trip.',
'MessageChannel provides paired ports for explicit message-based communication between cooperating contexts.',
'URLSearchParams preserves repeated query parameters and should be preferred over ad hoc string concatenation.',
'HTTP cache semantics depend on response headers, validators, freshness, and request directives rather than URL strings alone.'
],workers:[
'Worker messages use structured cloning by default, so object graphs are copied rather than shared by reference.',
'Transferable objects move ownership between contexts and can avoid copying large binary buffers.',
'SharedArrayBuffer enables shared memory only when the deployment meets the browser security isolation requirements.',
'Atomics provide synchronization operations for shared integer typed arrays and require careful coordination.',
'OffscreenCanvas can move selected canvas rendering work away from the main thread.',
'Service workers can intercept fetches and implement offline or cache-aware application strategies.',
'Service worker activation can be delayed by existing clients, so deployment should account for version transitions.',
'Worker termination is a lifecycle operation and should be paired with application-level cleanup of associated state.',
'Workers are useful for CPU-heavy tasks but communication and serialization costs still affect total performance.',
'Worker pools should bound concurrency so a burst of jobs does not create unbounded CPU and memory pressure.'
],node:[
'Node HTTP keep-alive reuses connections and can reduce handshake overhead for repeated requests to the same origin.',
'Node agents manage socket reuse and connection limits, so their configuration can materially affect throughput.',
'File descriptors are finite operating-system resources and should be closed promptly after use.',
'Node streams propagate backpressure when consumers cannot accept data as quickly as producers generate it.',
'AsyncLocalStorage can carry request context through supported asynchronous call chains.',
'Process signals such as SIGTERM are commonly used to begin graceful shutdown in deployed services.',
'DNS resolution can involve both local caches and network lookups, so latency and failure modes are not constant.',
'TLS certificate validation is part of the connection trust decision and should not be bypassed in production.',
'Environment variables are configuration inputs and should be parsed and validated rather than trusted as correctly typed values.',
'Readline and standard streams can build efficient command-line interfaces without loading entire input files into memory.'
],security:[
'Content Security Policy can restrict executable sources and reduce the impact of many injection vulnerabilities.',
'Trusted Types can require sensitive DOM sinks to receive approved trusted values rather than arbitrary strings.',
'Subresource Integrity verifies fetched script or style content against an expected cryptographic digest.',
'Permissions Policy controls whether selected browser capabilities are available to documents and embedded frames.',
'Referrer Policy controls how much referring URL information is sent with outbound requests.',
'HSTS tells supporting browsers to prefer HTTPS for a host after the policy has been received securely.',
'SameSite cookies reduce some cross-site request risks but do not replace server-side authorization and CSRF defenses.',
'Frame restrictions should be expressed with server-controlled policy such as CSP frame-ancestors where appropriate.',
'Input size limits protect parsers and downstream resources from unexpectedly large requests.',
'Rate limiting should distinguish abusive traffic from legitimate bursts and should fail in a controlled, observable way.'
],performance:[
'Layout thrashing occurs when code alternates DOM writes with layout reads and repeatedly forces expensive style or layout calculations.',
'RequestAnimationFrame batches visual updates near the browser rendering cycle and is preferable to arbitrary timer loops for animation.',
'Debouncing delays work until activity settles, while throttling bounds how frequently work can run during sustained activity.',
'Virtualization renders only the visible portion of a large collection and can reduce DOM and layout cost substantially.',
'content-visibility can allow browsers to skip work for content that is not currently needed for rendering.',
'PerformanceObserver can collect selected performance entries without requiring polling of timing APIs.',
'Long tasks are useful diagnostic signals because they identify periods where main-thread responsiveness may degrade.',
'Resource hints such as preload and preconnect should be used selectively for resources whose early availability is valuable.',
'Caching expensive deterministic computations can help when cache invalidation and memory bounds are explicit.',
'Core Web Vitals measure user-facing loading, responsiveness, and visual stability and should be evaluated on representative workloads.'
],testing:[
'Boundary tests should exercise the smallest, largest, empty, malformed, duplicate, and nullish inputs relevant to a contract.',
'Deterministic randomness makes tests reproducible while still allowing randomized algorithms to be exercised.',
'Metamorphic tests check relationships between related inputs when an exact expected output is difficult to enumerate.',
'Differential testing compares two implementations or execution paths against the same generated inputs.',
'Concurrency tests should make synchronization points explicit so important interleavings can be reproduced.',
'Resource cleanup belongs in test teardown as well as production code so leaked handles do not contaminate later tests.',
'Golden tests are useful for stable serialized or generated outputs when intentional changes are reviewed explicitly.',
'Integration tests should verify boundaries between real components rather than mocking every dependency.',
'Property-based tests are valuable for invariants such as round trips, conservation rules, and normalization behavior.',
'Regression tests should preserve a minimal reproduction of every important defect that is fixed.'
],architecture:[
'Ports and adapters isolate business rules from infrastructure implementations and make replacement easier.',
'Idempotent handlers can safely process duplicate delivery when the same operation may be retried.',
'Circuit breakers prevent repeatedly calling a failing dependency and allow recovery probes after a cool-down.',
'Bulkheads isolate resource pools so one overloaded workload does not consume every available worker or connection.',
'Bounded queues make overload explicit instead of silently allowing memory consumption to grow without limit.',
'Health checks should distinguish process liveness from readiness to serve traffic.',
'Structured errors should carry stable machine-readable categories while preserving useful human diagnostics.',
'Feature flags should have ownership and cleanup plans so temporary branches of behavior do not become permanent complexity.',
'Observability should correlate logs, metrics, and traces with stable request or operation identifiers.',
'Graceful degradation should define which capabilities can be reduced and how users are informed when full functionality is unavailable.'
],data:[
'Map is appropriate for dynamic key-value collections and has predictable insertion-order iteration.',
'Set enforces uniqueness using SameValueZero semantics and is useful for deduplication.',
'ArrayBuffer represents raw binary storage while typed arrays provide typed views over that storage.',
'DataView is useful when binary fields have mixed widths or endianness.',
'structuredClone can preserve supported cyclic object graphs while JSON cannot serialize cycles.',
'Object.fromEntries converts iterable key-value pairs into an ordinary object.',
'Object.hasOwn is a direct way to test whether a property belongs to an object itself.',
'toSorted returns a sorted copy and leaves the source array unchanged, unlike sort.',
'toReversed returns a reversed copy and leaves the source array unchanged.',
'Array.prototype.with returns a copied array with one indexed value replaced without mutating the original.'
]};
export const LARGE_JAVASCRIPT_KNOWLEDGE_V44_TEXT=Object.entries(packs).flatMap(([pack,entries])=>entries.map((text,i)=>`[JavaScript v44/${pack}/${i+1}] ${text}`)).join('\n');
export const javascriptKnowledgeV44Stats=()=>({version:'44.0',packs:Object.keys(packs).length,entries:Object.values(packs).reduce((n,x)=>n+x.length,0),characters:LARGE_JAVASCRIPT_KNOWLEDGE_V44_TEXT.length,pretrained:false,authored:true});
if(typeof window!=='undefined')window.TONYLargeJavaScriptKnowledgeV44={LARGE_JAVASCRIPT_KNOWLEDGE_V44_TEXT,javascriptKnowledgeV44Stats};
