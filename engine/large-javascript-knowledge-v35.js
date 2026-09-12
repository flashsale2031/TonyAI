// TONY Large JavaScript Knowledge v35.
// Authored deterministic JavaScript/web engineering knowledge; no pretrained model.
const packs={
 semantics:[
  'Nullish coalescing chooses its right operand only when the left operand is null or undefined.',
  'Logical assignment operators preserve JavaScript short-circuit behavior while assigning only when their condition requires it.',
  'Object.is differs from strict equality for NaN and signed zero and is useful when exact identity semantics matter.',
  'Numeric separators improve readability of numeric literals without changing their numeric value.',
  'Number.isFinite avoids coercion and is safer for validating that an input is already a finite Number.',
  'Number.isSafeInteger checks whether an integer can be represented exactly within JavaScript safe-integer bounds.',
  'BigInt arithmetic cannot be mixed directly with Number arithmetic and should use deliberate conversions at boundaries.',
  'Symbols are unique primitive property keys and are useful for avoiding accidental string-key collisions.',
  'Property descriptors distinguish writable, enumerable, and configurable data properties from accessor properties.',
  'Reflect operations provide return-value-oriented primitives that compose naturally with Proxy traps.'
 ],
 promises:[
  'Promise.all rejects when any input rejects and otherwise preserves the input ordering of fulfilled values.',
  'Promise.allSettled waits for every input and reports fulfillment or rejection for each operation.',
  'Promise.any fulfills on the first fulfillment and rejects with AggregateError when every input rejects.',
  'Promise.race settles according to the first input promise to settle, whether fulfilled or rejected.',
  'Promise.finally is useful for cleanup because it runs after settlement without normally changing the result.',
  'An async function always returns a Promise even when its body returns an ordinary value.',
  'Awaiting a rejected promise throws at the await expression and should be handled at an intentional boundary.',
  'Cancellation should be propagated explicitly because rejecting a promise does not automatically stop underlying work.',
  'AbortController can fan one cancellation signal out to multiple cooperating asynchronous operations.',
  'Promise chains should return downstream promises so callers can observe failures instead of creating detached work.'
 ],
 iterators:[
  'The iterable protocol supplies Symbol.iterator so a value can participate in for-of and spread operations.',
  'The iterator protocol returns objects containing done and value fields and can represent lazy computation.',
  'Generator functions produce iterators whose execution pauses at yield and resumes when next is called.',
  'Generator return closes iteration and can provide a final value that for-of intentionally does not emit.',
  'Generator throw injects an exception at the suspended yield point and allows generator-local cleanup.',
  'Iterator closing matters when iteration exits early and enables generators and resources to perform cleanup.',
  'Async iterables use Symbol.asyncIterator and integrate with for-await-of for asynchronous sequences.',
  'Custom iterables should avoid mutating shared iteration state unless single-consumer behavior is intentional.',
  'Lazy iterator pipelines can reduce intermediate allocations by producing values only when requested.',
  'Iterator helpers are best treated as composable lazy transformations when the target runtime supports them.'
 ],
 dom:[
  'Event delegation attaches one listener to a stable ancestor and uses event propagation to handle dynamic descendants.',
  'CustomEvent can carry application-defined detail data while remaining part of the DOM event model.',
  'DocumentFragment enables construction of a group of nodes before attaching them to the live document.',
  'Template elements hold inert markup that can be cloned into documents without immediately executing as live DOM.',
  'The slotchange event reports changes to assigned nodes in a shadow DOM slot.',
  'The dialog element provides native modal and non-modal dialog behavior with focus-management semantics.',
  'The details element provides disclosure behavior without requiring a custom visibility state machine.',
  'The popover API provides browser-managed popover visibility and light-dismiss behavior where supported.',
  'Pointer Events unify mouse, touch, and pen input under a common event model.',
  'MutationObserver batches DOM mutation notifications asynchronously instead of firing synchronously for every mutation.'
 ],
 storage:[
  'IndexedDB transactions group related object-store operations and have explicit lifecycle and completion behavior.',
  'IndexedDB schema upgrades occur through version changes and upgrade transactions rather than arbitrary runtime mutation.',
  'CacheStorage stores Request and Response pairs and is commonly used by service workers for controlled offline behavior.',
  'localStorage is synchronous and should not be used for large or latency-sensitive application state.',
  'sessionStorage is scoped to a browsing context and is not a replacement for durable shared storage.',
  'Structured cloning supports many built-in data types while rejecting values that cannot be cloned.',
  'Transferable objects can move ownership of underlying resources instead of copying their contents.',
  'ArrayBuffer provides raw binary storage while typed arrays provide structured numeric views over its bytes.',
  'DataView permits explicit byte-offset and endianness handling for binary formats.',
  'Storage migrations should be versioned and idempotent so interrupted upgrades can be safely retried.'
 ],
 networking:[
  'Fetch Request and Response objects can be cloned when their bodies have not been consumed in a way that prevents reuse.',
  'A response body is a stream and should be consumed deliberately when large payloads or progressive processing matter.',
  'Headers normalize HTTP header names and should be treated as structured metadata rather than a generic object map.',
  'URLSearchParams encodes query parameters according to URL form rules and supports repeated parameter names.',
  'WebSocket connections transition through connecting, open, closing, and closed states.',
  'EventSource provides a reconnecting server-sent event channel for one-way server-to-browser messaging.',
  'BroadcastChannel communicates between same-origin browsing contexts without requiring a shared DOM window.',
  'MessageChannel creates two linked MessagePorts for explicit message-passing between cooperating execution contexts.',
  'WebRTC separates signaling from peer connection establishment; applications still need a signaling mechanism.',
  'HTTP conditional requests with validators such as ETag can avoid transferring unchanged representations.'
 ],
 node:[
  'Node filesystem promises should use explicit encoding or Buffer handling according to whether data is textual or binary.',
  'File handles should be closed in finally-style cleanup paths even when asynchronous operations fail.',
  'Node HTTP agents manage connection reuse and can reduce connection setup overhead for repeated requests.',
  'Keep-alive configuration should account for server timeouts so clients do not reuse connections the server is about to close.',
  'DNS lookup and DNS resolution have different runtime behavior and should be selected based on whether custom resolver behavior is needed.',
  'TLS configuration should make certificate verification and protocol policy explicit rather than disabling validation for convenience.',
  'Readline interfaces should close their input resources when interactive or line-oriented processing finishes.',
  'Environment variables are strings and should be parsed and validated before being used as typed application configuration.',
  'Process signal handlers should coordinate graceful shutdown instead of abruptly terminating resources that need cleanup.',
  'Node diagnostic channels can provide structured instrumentation for supported runtime subsystems without scattering logging calls everywhere.'
 ],
 security:[
  'Trusted Types can reduce DOM XSS risk by requiring explicit trusted values for selected injection-sensitive sinks.',
  'Subresource Integrity lets browsers verify that fetched resources match an expected cryptographic digest.',
  'Permissions Policy controls which browser features are available to a document and embedded frames.',
  'Referrer Policy controls how much referrer information browsers send on outbound requests.',
  'HSTS tells compatible browsers to prefer HTTPS for a host after receiving an appropriate security policy.',
  'CSRF defenses should bind state-changing requests to an origin or unpredictable request token where applicable.',
  'SameSite cookie behavior can reduce cross-site request exposure but should be configured with the application flow in mind.',
  'Noopener prevents a newly opened page from receiving an opener reference and reduces certain reverse-tabnabbing risks.',
  'Iframe sandboxing should be configured with the smallest permission set that supports the embedded feature.',
  'Authorization checks belong on the server and should not rely on client-side visibility or route guards alone.'
 ],
 performance:[
  'Layout thrashing occurs when code repeatedly alternates DOM writes and layout reads and forces unnecessary synchronous recalculation.',
  'RequestAnimationFrame is appropriate for visual updates that should align with browser rendering opportunities.',
  'Debouncing waits for a quiet period before running an operation, while throttling limits execution frequency during sustained activity.',
  'Virtualization renders only the visible portion of a large collection and can reduce DOM and layout costs substantially.',
  'content-visibility can let browsers skip rendering work for content that is not currently relevant to the viewport.',
  'PerformanceObserver can collect supported performance entries without requiring manual timestamp instrumentation everywhere.',
  'Long tasks can block user input and rendering and should be identified when diagnosing responsiveness problems.',
  'Resource hints such as preload, preconnect, and modulepreload should be used selectively based on actual critical-path dependencies.',
  'Caching improves latency but requires explicit invalidation and versioning rules to prevent stale data from becoming incorrect data.',
  'Core Web Vitals should be measured in realistic user conditions rather than inferred solely from local development machines.'
 ],
 testing:[
  'Property-based tests generate many inputs from general invariants instead of enumerating only a few hand-picked examples.',
  'Metamorphic tests verify predictable relationships between outputs when the input undergoes a controlled transformation.',
  'Contract tests check that independently deployed components continue to agree on an explicit interface.',
  'Snapshot tests are useful for stable structured output but can become noisy when snapshots capture incidental implementation detail.',
  'Fake timers make timer-dependent behavior deterministic when the code under test isolates its clock and scheduler interactions.',
  'Boundary tests should target empty, minimum, maximum, malformed, and unusually large inputs.',
  'Mutation testing evaluates test strength by introducing small controlled code changes and checking whether tests detect them.',
  'Golden tests compare outputs against carefully reviewed fixtures and are useful for parsers, formatters, and serializers.',
  'Deterministic randomness can make flaky randomized tests reproducible by injecting a controlled random source.',
  'Replay tests can preserve a real failure input as a regression fixture without depending on the original runtime timing.'
 ]
};
export const LARGE_JAVASCRIPT_KNOWLEDGE_V35_TEXT=Object.values(packs).flat().join('\n');
export const javascriptKnowledgeV35Stats={version:'35',packs:Object.keys(packs),entries:Object.values(packs).reduce((n,p)=>n+p.length,0),characters:LARGE_JAVASCRIPT_KNOWLEDGE_V35_TEXT.length,pretrained:false};
