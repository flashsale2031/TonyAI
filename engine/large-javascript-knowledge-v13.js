// TONY Large JavaScript Knowledge Expansion v13.
// Additional authored pure-JavaScript engineering knowledge for local retrieval and fitting.
// This is not a pretrained neural checkpoint.
const packs={
runtime:[
'JavaScript modules are evaluated once per module instance and subsequent imports reuse the evaluated module.',
'Live bindings exported by ES modules reflect later updates rather than copying the exported variable value.',
'Getters execute code when a property is read and should be treated as potentially effectful operations.',
'Symbol keys avoid collisions with ordinary string property names and are useful for protocol-style metadata.',
'Reflect APIs expose object meta-operations with return values that are often easier to compose than language operators.',
'Proxy traps can intercept selected object operations but should preserve expected invariants of the target object.',
'WeakMap keys do not prevent garbage collection of otherwise unreachable key objects.',
'WeakSet is suitable for tracking object identity without creating ordinary strong references to those objects.',
'BigInt represents arbitrary-size integers but cannot be mixed directly with Number arithmetic.',
'Intl APIs provide locale-aware formatting and should be preferred over hand-written locale assumptions.'
],
async:[
'Promise callbacks registered with then, catch, or finally run asynchronously even when the promise is already settled.',
'Async iterators can expose incremental asynchronous data through for await...of.',
'Async generators combine generator suspension with asynchronous iteration and can model streaming pipelines.',
'Promise chains should return the next promise when downstream work depends on the result of an earlier callback.',
'Cancellation is cooperative when an API accepts AbortSignal and code must observe the signal for prompt termination.',
'Unhandled rejection behavior depends on the host, so applications should establish explicit rejection handling at boundaries.',
'Queues of asynchronous tasks should separate admission control from task execution to make concurrency policies explicit.',
'Batching independent asynchronous work can reduce overhead while increasing latency and memory pressure.',
'Timeouts should reject or cancel work explicitly rather than relying on a stalled operation to resolve eventually.',
'Async resource cleanup belongs in finally paths when cleanup must happen for both success and failure.'
],
node:[
'Node.js URL objects provide structured parsing and serialization for absolute and relative URL operations.',
'Node.js filesystem promises provide asynchronous file operations that can be composed with async functions.',
'File descriptors are finite operating-system resources and should be closed even when downstream processing fails.',
'Path operations should use platform-aware Node path utilities instead of assuming one operating-system separator.',
'Child processes have independent lifecycles and require explicit handling of exit, error, and output streams.',
'Node HTTP request bodies are streams and applications should avoid buffering unbounded client input in memory.',
'Compression transforms can be inserted into Node streams while preserving incremental processing.',
'Node diagnostics channels can expose structured lifecycle events to instrumentation without changing business logic.',
'Clustered or multi-process Node deployments must account for independent memory, timers, and local caches per process.',
'Graceful Node shutdown should stop intake, abort or drain work, close servers, and release resources in a bounded interval.'
],
browser:[
'Event listener options can control capture, passive behavior, and automatic removal through AbortSignal.',
'RequestAnimationFrame schedules visual work near browser rendering and is preferable to timers for frame-based updates.',
'Web Workers communicate through message passing and do not share ordinary DOM access with the main thread.',
'Transferable objects can move ownership of certain buffers between workers without copying their underlying storage.',
'OffscreenCanvas can move supported canvas rendering work away from the main UI thread.',
'URL.createObjectURL creates temporary object URLs that should be revoked when their resources are no longer needed.',
'FormData represents multipart-style form fields and can include binary Blob or File values.',
'File and Blob APIs support slicing and streaming large data without requiring an application to copy everything at once.',
'VisualViewport exposes viewport geometry that can differ from the layout viewport on mobile devices.',
'Page Visibility events can help pause optional work when a document is hidden.'
],
'web-platform':[
'Web Crypto provides cryptographic primitives but applications should rely on well-reviewed protocol designs rather than inventing protocols.',
'SubtleCrypto operations are asynchronous and return promises for supported cryptographic operations.',
'Web Authentication uses authenticator-backed credentials and is designed around origin-bound public-key authentication.',
'Permissions APIs expose permission state for capabilities where browsers provide permission querying.',
'Geolocation requires explicit user permission and applications should handle denied or unavailable location results.',
'Notifications require permission and should be used sparingly because delivery is controlled by the user agent and platform.',
'Clipboard access is subject to secure-context and permission policies and should degrade gracefully when unavailable.',
'Web Share exposes platform sharing when supported and may reject when the user cancels or the data is unsupported.',
'Intersection and visibility APIs are useful for reducing unnecessary work for content outside the active viewport.',
'Browser APIs differ by origin, secure-context, user-activation, and permission requirements.'
],
'networking':[
'HTTP caching combines freshness rules and validators to avoid unnecessary network transfers while preserving correctness.',
'Cache-Control directives express client and intermediary caching behavior and should match the resource semantics.',
'Content negotiation uses request headers such as Accept to select an appropriate representation when a server supports variants.',
'HTTP redirects can change request behavior depending on status code and method, so clients should treat redirects deliberately.',
'Idempotency keys allow retryable API operations to avoid creating duplicate effects when a request is repeated.',
'Connection pools reuse network connections and can reduce handshake overhead while requiring bounded resource limits.',
'DNS failures, TLS failures, timeouts, and application errors represent different failure classes and may need different retry policies.',
'WebSocket reconnect loops should use bounded backoff and avoid creating many simultaneous replacement connections.',
'Network responses should be validated at the application boundary before their data is trusted by downstream logic.',
'Large network payloads should be streamed or paginated when the full representation is not needed simultaneously.'
],
storage:[
'IndexedDB transactions have defined scopes and should be kept focused so long-running application work does not unnecessarily hold them open.',
'IndexedDB version upgrades run through schema migration callbacks and should be designed to tolerate interrupted upgrades.',
'Cache entries should include a freshness strategy when stale content could produce incorrect application behavior.',
'Client-side storage should treat data as potentially evictable and provide recovery paths for missing cached state.',
'localStorage writes can throw quota or security exceptions and should not be assumed to succeed in every browsing context.',
'BroadcastChannel messages are ephemeral notifications rather than a durable event log.',
'Service-worker cache strategies can distinguish cache-first, network-first, stale-while-revalidate, and network-only behavior.',
'Persistent browser state should avoid storing unnecessary secrets because browser storage is not a substitute for a secure credential vault.',
'IndexedDB structured cloning supports many data types but application-specific class identity may require explicit serialization.',
'Cache invalidation should be tied to resource versions or validators instead of arbitrary assumptions about deployment timing.'
],
'algorithms':[
'Merge sort has predictable O(n log n) comparison complexity and can be implemented stably.',
'Quickselect can find an order statistic without fully sorting all input elements.',
'Heaps support efficient access to a minimum or maximum and are useful for priority queues.',
'A monotonic stack can solve next-greater or next-smaller element problems in linear time.',
'Prefix sums turn repeated contiguous-range sum queries into constant-time queries after linear preprocessing.',
'Difference arrays efficiently represent batches of range updates when point values are reconstructed later.',
'Kahn-style topological sorting uses indegrees and naturally detects cycles when not all vertices can be emitted.',
'A* search combines path cost with a heuristic and is optimal when the heuristic is admissible under the applicable model.',
'Memoization is most effective when repeated subproblems have stable inputs and bounded retained state.',
'Algorithm selection should consider data distribution, memory locality, constant factors, and workload shape in addition to asymptotic complexity.'
],
'software-design':[
'Single-responsibility boundaries make modules easier to test when each module has a narrow reason to change.',
'Pure functions are easier to reason about because their outputs depend only on explicit inputs and they avoid hidden side effects.',
'Immutable data structures can simplify concurrency reasoning by reducing accidental shared-state mutation.',
'Adapters should translate external representations into internal domain forms rather than leaking transport details inward.',
'Configuration should be validated once at process boundaries and represented internally in normalized types.',
'Feature flags should have clear ownership, default behavior, rollout scope, and removal criteria.',
'Observability metadata should use stable field names so logs and traces remain queryable across releases.',
'Error types should distinguish invalid input, unavailable dependencies, transient failures, and programming defects where useful.',
'Retries belong at boundaries where the caller understands whether repeating the operation is safe.',
'Explicit state machines are often clearer than scattered booleans when a component has mutually exclusive lifecycle states.'
],
testing:[
'Table-driven tests make families of related cases explicit and reduce duplicated assertion scaffolding.',
'Snapshot tests are most useful when the representation is stable and changes should receive deliberate review.',
'Golden tests compare output against curated expected artifacts and can catch subtle formatting regressions.',
'Load tests should separate throughput saturation from latency degradation and report both dimensions.',
'Soak tests expose leaks and gradual degradation that short test runs can miss.',
'Chaos testing evaluates recovery behavior by introducing controlled dependency, timing, or resource failures.',
'Test fixtures should minimize irrelevant setup so failures identify the behavior under examination.',
'Test doubles should model the contract actually used by the caller rather than accidentally reproducing implementation details.',
'Negative tests are essential for parsers and validators because rejected inputs define an important part of the contract.',
'Regression tests should be added for defects whose recurrence would be costly or difficult to diagnose.'
],
'performance':[
'Hot paths should be measured with representative inputs before optimization so effort targets observed costs.',
'Allocation rate can affect JavaScript performance through garbage-collection pressure even when asymptotic complexity is unchanged.',
'Batching DOM mutations can reduce repeated layout and style work compared with many isolated updates.',
'Long main-thread tasks can delay input and rendering, so expensive work should be chunked or moved to workers when appropriate.',
'Caching can improve latency but may increase memory use and invalidation complexity.',
'Lazy initialization reduces startup work when expensive features are rarely used.',
'Object shapes and predictable access patterns can influence JavaScript engine optimization, but measurements should guide low-level tuning.',
'Network performance depends on payload size, connection reuse, compression, latency, and server processing rather than bandwidth alone.',
'Performance budgets should specify measurable thresholds for latency, memory, bundle size, and resource counts.',
'Optimization changes should preserve observable behavior and include benchmark evidence rather than relying on intuition.'
]
};
const entries=[];for(const [domain,list] of Object.entries(packs))for(const text of list)entries.push({domain,text});
export const LARGE_JAVASCRIPT_KNOWLEDGE_V13=Object.freeze(entries);
export const LARGE_JAVASCRIPT_KNOWLEDGE_V13_TEXT=entries.map(x=>`[${x.domain}] ${x.text}`).join('\n');
export const javascriptKnowledgeV13Stats={version:13,domains:Object.keys(packs),entries:entries.length,characters:LARGE_JAVASCRIPT_KNOWLEDGE_V13_TEXT.length,pretrained:false,source:'authored pure-JavaScript knowledge expansion'};
if(typeof window!=='undefined')window.TONYLARGEJAVASCRIPTKNOWLEDGEV13={LARGE_JAVASCRIPT_KNOWLEDGE_V13,LARGE_JAVASCRIPT_KNOWLEDGE_V13_TEXT,javascriptKnowledgeV13Stats};
