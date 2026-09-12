// TONY Large JavaScript Knowledge v36. Authored deterministic knowledge; no pretrained model.
const packs={
 language:[
 'Nullish coalescing selects the right operand only when the left operand is null or undefined.',
 'Logical assignment operators combine a read test with an assignment and can invoke getters and setters.',
 'Object property enumeration has defined ordering rules for integer-index keys followed by string keys and symbols.',
 'Property descriptors distinguish configurable, enumerable, writable, value, get, and set attributes.',
 'Reflect methods provide predictable object-operation return values and are useful inside Proxy traps.',
 'Proxy traps should preserve invariants because violating non-configurable or non-extensible target constraints throws.',
 'Revocable proxies provide an explicit lifetime boundary after which operations fail.',
 'WeakMap keys are objects and entries do not prevent those keys from being garbage collected.',
 'WeakSet tracks object membership without creating strong references to its members.',
 'FinalizationRegistry callbacks are nondeterministic and should never be used for essential application correctness.'
 ],
 async:[
 'Promise.all rejects when any input rejects, while Promise.allSettled waits for every input and reports each outcome.',
 'Promise.any fulfills on the first fulfillment and rejects with AggregateError only when every input rejects.',
 'Promise.race settles according to the first settled input, whether fulfilled or rejected.',
 'Promise.finally runs after settlement and normally preserves the original fulfillment value or rejection reason.',
 'Await suspends the current async function until the awaited promise settles without blocking the JavaScript thread.',
 'Async functions always return promises, including when their body returns an ordinary value.',
 'Cancellation requires cooperation: AbortSignal can communicate cancellation but does not forcibly terminate arbitrary JavaScript.',
 'AbortController signals can be composed so one parent cancellation propagates to several downstream operations.',
 'Async generators combine asynchronous iteration with generator-style pause and resume semantics.',
 'Long synchronous loops can starve promise callbacks because microtasks cannot run until the current task yields.'
 ],
 browser:[
 'Event delegation attaches one handler to a stable ancestor and uses event.target or composedPath to identify descendants.',
 'Shadow DOM retargeting can hide internal nodes from outside listeners, while composedPath can expose the composed event path.',
 'CustomEvent carries application-defined detail data and can cross ordinary DOM event boundaries.',
 'DocumentFragment lets code assemble many nodes before inserting the resulting structure into the document.',
 'The template element stores inert markup that can be cloned before activation in the document.',
 'Slotchange reports changes to assigned nodes in a shadow tree and is distinct from ordinary child mutation events.',
 'The dialog element provides modal and non-modal dialog behavior with browser-managed focus and lifecycle semantics.',
 'The popover API provides browser-managed transient UI that can participate in declarative invocation and dismissal.',
 'Page Visibility changes can be used to reduce background work, polling, animation, and synchronization frequency.',
 'Browser lifecycle transitions require cleanup because pages may be frozen, discarded, restored, or placed into the back-forward cache.'
 ],
 webapis:[
 'URLSearchParams preserves ordered query parameters and permits duplicate names, unlike a simple object map.',
 'Headers normalizes header-name handling but still enforces forbidden and restricted header rules in browser contexts.',
 'Response.clone creates another readable response body but can increase buffering when consumers read at different speeds.',
 'Request.clone similarly duplicates a request body stream and should be used with awareness of stream consumption.',
 'BroadcastChannel communicates between same-origin browsing contexts using structured-clone serialization.',
 'MessageChannel creates a pair of entangled message ports for direct asynchronous communication.',
 'WebSocket has an explicit opening, open, closing, and closed lifecycle and should handle close events deliberately.',
 'EventSource provides a persistent server-sent event connection and reconnect behavior for compatible HTTP streams.',
 'Web Locks coordinates cooperative access to named resources among same-origin browser contexts.',
 'File System Access APIs require explicit permission and should handle permission loss and user cancellation.'
 ],
 node:[
 'Node HTTP keep-alive reuses connections when agent and server configuration permit, reducing repeated connection setup.',
 'A Node Agent manages connection pooling and should be tuned for the expected concurrency and remote service behavior.',
 'DNS lookup behavior can vary by resolver and address-family policy, so network code should not assume one fixed address.',
 'TLS configuration should use modern protocol and certificate validation defaults rather than weakening verification for convenience.',
 'Filesystem promises should use file handles carefully and close them in finally paths when manual handles are acquired.',
 'Recursive directory operations should bound concurrency so thousands of filesystem tasks do not exhaust descriptors or memory.',
 'Node signals such as SIGTERM are useful for graceful shutdown but application cleanup must be idempotent.',
 'Readline interfaces should be closed when interactive streams are no longer needed to release listeners and resources.',
 'Worker termination should be coordinated with application state so partially completed work is not mistaken for success.',
 'Node diagnostic channels can provide instrumentation hooks without coupling application logic directly to a particular logger.'
 ],
 security:[
 'CSRF defenses should use same-site cookies, origin checks, CSRF tokens, or equivalent protections appropriate to the application.',
 'Content Security Policy should minimize script sources and avoid unsafe-inline and unsafe-eval unless there is a documented reason.',
 'Trusted Types can constrain dangerous DOM sinks by requiring approved policy-generated values in supporting browsers.',
 'Subresource Integrity verifies expected fetched resource hashes and can reduce supply-chain risk for static dependencies.',
 'Permissions Policy controls which powerful browser features embedded documents may access.',
 'Referrer Policy limits how much referring URL information is sent with outbound requests.',
 'Secure cookies should use HttpOnly where script access is unnecessary and appropriate SameSite settings.',
 'Frame isolation should consider CSP frame-ancestors, sandboxing, and cross-origin opener relationships together.',
 'Input validation should occur before interpretation and should enforce structural constraints rather than only rejecting known bad strings.',
 'Secrets should not be emitted into logs, client bundles, error messages, URLs, or telemetry payloads.'
 ],
 performance:[
 'Layout thrashing occurs when code alternates DOM writes and layout reads, forcing repeated style and layout calculation.',
 'Batching DOM writes and reads reduces forced synchronous layout and improves rendering predictability.',
 'Virtualization renders only the visible subset of large lists while maintaining a logical model for off-screen items.',
 'Debouncing coalesces bursts of events until activity pauses, while throttling limits invocation frequency during sustained activity.',
 'Memoization is useful when repeated computations are expensive and inputs have stable identity or serialization semantics.',
 'Resource hints such as preload and preconnect should be used selectively because unnecessary hints compete for bandwidth.',
 'PerformanceObserver can consume browser performance entries without requiring polling of timing APIs.',
 'Long tasks indicate main-thread work that blocks responsiveness and should be traced to the responsible synchronous operation.',
 'Interaction to Next Paint measures responsiveness after user interactions and complements other Core Web Vitals.',
 'Caching should define invalidation, freshness, and memory limits rather than assuming that retained data is always beneficial.'
 ],
 testing:[
 'Property-based testing checks broad input properties across generated cases instead of relying only on hand-picked examples.',
 'Metamorphic testing verifies predictable relationships between outputs when inputs are transformed in known ways.',
 'Contract tests verify that producers and consumers agree on externally visible interfaces and schemas.',
 'Mutation testing evaluates test strength by introducing controlled code changes and checking whether tests detect them.',
 'Golden tests compare stable outputs against approved fixtures and should update deliberately rather than automatically.',
 'Fake timers make time-dependent logic deterministic but require explicit flushing of timers and microtasks.',
 'Boundary tests should exercise empty, minimal, maximal, malformed, duplicated, and near-limit inputs.',
 'Deterministic randomness can be injected through a seeded generator so tests reproduce failures consistently.',
 'Replay testing captures an observable sequence and reruns it to diagnose intermittent asynchronous failures.',
 'Failure triage should preserve the smallest reproducer, expected behavior, actual behavior, and environment assumptions.'
 ],
 architecture:[
 'Idempotent commands can be safely retried when repeated execution produces the same intended external state.',
 'A retry budget prevents transient recovery logic from becoming an unbounded source of latency and load.',
 'Bulkhead isolation limits the blast radius when one workload or dependency becomes saturated.',
 'Circuit breakers should reopen only after controlled health checks and should record transition reasons.',
 'Adapters translate between external protocols and internal domain models while keeping domain logic independent.',
 'Facades provide stable simplified interfaces over complex subsystems without requiring callers to understand internals.',
 'Observer relationships should unsubscribe explicitly when lifetimes end to prevent stale references and unintended work.',
 'Command objects can make operations serializable, auditable, testable, and suitable for queued execution.',
 'State machines make legal transitions explicit and are preferable to scattered boolean flags for complex lifecycles.',
 'Dependency inversion allows infrastructure implementations to change without rewriting high-level application policy.'
 ]
};
export const LARGE_JAVASCRIPT_KNOWLEDGE_V36_TEXT=Object.values(packs).flat().join('\n');
export const javascriptKnowledgeV36Stats={version:'36',packs:Object.keys(packs),entries:Object.values(packs).reduce((n,p)=>n+p.length,0),characters:LARGE_JAVASCRIPT_KNOWLEDGE_V36_TEXT.length,pretrained:false};
