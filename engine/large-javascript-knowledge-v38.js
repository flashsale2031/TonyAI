// TONY Large JavaScript Knowledge v38.
// Authored deterministic JavaScript/web engineering knowledge; no pretrained model.
const packs={
 language:[
 'The JavaScript specification defines completion records for evaluation; abrupt completions such as throw propagate unless an enclosing construct handles them.',
 'Lexical environments form nested scopes, while environment records determine how bindings are resolved during identifier lookup.',
 'A const binding prevents reassignment of the binding itself, but an object referenced by that binding can still have mutable properties.',
 'The typeof operator has a special historical result of object for null; explicit null checks should therefore use equality or Object.is as appropriate.',
 'The void operator evaluates its operand and always produces undefined, which can be useful when an expression result must be intentionally discarded.',
 'String primitives are immutable; methods such as slice, replace, and toUpperCase create new strings rather than changing the original value.',
 'Template literals evaluate interpolated expressions and can be customized through tagged template functions.',
 'Unicode code points and UTF-16 code units are different concepts; codePointAt and Array.from can be useful when processing characters beyond the basic multilingual plane.',
 'Number represents IEEE 754 binary64 values, so decimal fractions such as 0.1 may not have an exact binary representation.',
 'Number.isNaN checks whether a value is the numeric NaN value without coercing unrelated types.'
 ],
 functions:[
 'Function length reports the number of parameters before the first parameter with a default value, rest parameter, or otherwise non-counted parameter position.',
 'A function declaration inside a block has block-scoped semantics under modern JavaScript rules, subject to the specified Annex B web-compatibility behavior in some scripts.',
 'The arguments object in ordinary functions is array-like and may have linkage with named parameters in non-strict functions.',
 'Arrow functions cannot be used as constructors with new because they do not provide a [[Construct]] internal method.',
 'Function.prototype.call invokes a function with an explicit this value and individual arguments, while apply accepts an argument array-like object.',
 'Recursive algorithms should include a base case; JavaScript engines can eventually throw RangeError when call-stack depth is exceeded.',
 'Callback APIs should document whether callbacks may execute synchronously, asynchronously, once, or multiple times because timing is part of their contract.',
 'Currying transforms a multi-argument operation into a sequence of single-argument functions and can simplify composable functional pipelines.',
 'A closure captures bindings rather than frozen values, so later assignments to captured variables are observable by the closure.',
 'Function names can improve stack traces and diagnostics, but generated anonymous functions may receive inferred names from surrounding syntax.'
 ],
 promises:[
 'A promise is settled exactly once; later attempts to fulfill or reject it do not change its settled state.',
 'Promise callbacks are queued as jobs rather than invoked inline by then, which establishes predictable microtask ordering.',
 'Thenable assimilation can invoke a foreign then method, so promise resolution is deliberately defensive around multiple calls and exceptions.',
 'Promise.all rejects as soon as an input rejects, although already-started underlying operations are not automatically canceled.',
 'Promise.allSettled is appropriate when every operation should report an outcome regardless of individual failures.',
 'Promise.any rejects with AggregateError only after all inputs reject or when the iterable contains no fulfillments.',
 'Promise.race does not cancel losing promises; cancellation requires an explicit mechanism such as AbortController.',
 'Async iterators expose next methods returning promises and are consumed naturally with for await...of.',
 'Awaiting a non-promise value still creates an asynchronous suspension point before the continuation resumes.',
 'A rejected promise that is never handled can trigger an unhandled rejection diagnostic according to the host environment.'
 ],
 collections:[
 'Map preserves insertion order for iteration and uses SameValueZero equality for keys.',
 'Set iteration follows insertion order and exposes values rather than key-value pairs.',
 'Object.create(null) produces an object without Object.prototype, which can make it useful as a dictionary when prototype keys are undesirable.',
 'Object.hasOwn provides a direct own-property check without requiring access through Object.prototype.hasOwnProperty.',
 'Reflect.ownKeys returns both string and symbol own keys, including non-enumerable properties.',
 'Array.from can consume iterables and array-like values and can apply a mapping function during construction.',
 'Array.fromAsync consumes asynchronous or synchronous iterables and resolves mapped values while constructing an array.',
 'Sorting an array mutates it; to preserve the input, copy it first or use newer non-mutating array methods where available.',
 'Stable sorting means elements that compare equal retain their relative order in modern ECMAScript implementations.',
 'Typed-array views share underlying ArrayBuffer storage, so mutations through one compatible view can be observed through another.'
 ],
 dom:[
 'Event propagation has capture, target, and bubble phases; listeners can choose capture behavior explicitly.',
 'stopPropagation prevents further propagation through the event path, while stopImmediatePropagation also prevents later listeners on the same target.',
 'preventDefault requests cancellation of a cancelable default action and does not itself stop event propagation.',
 'Passive event listeners indicate that preventDefault will not be used and can allow browsers to optimize certain input paths.',
 'Element.closest walks ancestors including the element itself and returns the first matching selector or null.',
 'Node.contains determines whether a node is an inclusive descendant of another node.',
 'DocumentFragment insertion moves its child nodes into the destination rather than inserting the fragment node as a permanent wrapper.',
 'Custom elements can observe selected attributes through observedAttributes and receive changes in attributeChangedCallback.',
 'The connectedCallback and disconnectedCallback lifecycle hooks should be used carefully because DOM nodes may be attached and detached repeatedly.',
 'Shadow DOM event retargeting can expose the host as event.target outside a shadow boundary while composedPath reveals the propagation path where permitted.'
 ],
 webapis:[
 'AbortSignal can represent cancellation state independently of the operation being canceled and can be shared by multiple cooperating APIs.',
 'AbortSignal.timeout creates a signal that aborts automatically after a specified duration in supporting environments.',
 'Fetch treats HTTP error statuses such as 404 and 500 as fulfilled responses; applications normally inspect response.ok or status explicitly.',
 'Streaming fetch responses can process large payloads incrementally and avoid buffering an entire response in memory.',
 'ReadableStream backpressure allows consumers to communicate demand so producers do not indefinitely outrun downstream processing.',
 'TransformStream connects a writable side to a readable side and is useful for incremental encoding, decoding, compression, and transformation.',
 'CompressionStream and DecompressionStream expose streaming compression primitives in supporting browsers.',
 'URL objects normalize and expose parsed URL components and are preferable to ad hoc string manipulation for URL handling.',
 'URLPattern can match structured URL components in environments that implement the API, reducing repeated manual route parsing.',
 'WebTransport provides modern bidirectional transport capabilities over HTTP/3 in supporting environments and has different reliability semantics from WebSocket.'
 ],
 workers:[
 'A worker message is delivered through the message event and its data is normally passed through the structured clone algorithm.',
 'Structured cloning copies supported object graphs while preserving many built-in types and handling cycles, but functions are not cloneable.',
 'Transferable objects move ownership rather than cloning their underlying storage and can improve performance for large binary buffers.',
 'Atomics.wait is intended for worker contexts and can block the calling agent on supported shared integer arrays; main-thread blocking should be avoided.',
 'Atomics.notify wakes waiting agents associated with a shared memory location.',
 'SharedArrayBuffer availability in browsers depends on the deployment security model and cross-origin isolation requirements.',
 'Service worker clients can be enumerated and messaged, but lifecycle timing means a newly installed worker may not control all existing pages immediately.',
 'CacheStorage stores Request/Response pairs and should use explicit cache versioning and invalidation policies.',
 'Service worker fetch handlers can respond from cache, network, or synthesized responses, but must respect request mode and origin constraints.',
 'Worker pools amortize worker startup overhead by reusing a bounded number of workers for independent tasks.'
 ],
 node:[
 'Node.js EventEmitter listeners execute synchronously in registration order when an event is emitted unless the listener itself schedules asynchronous work.',
 'Node streams should respect the return value of writable.write and wait for drain when backpressure signals that producers should pause.',
 'pipeline from node:stream helps connect streams and propagate completion and errors with centralized cleanup.',
 'Readable async iteration can consume Node streams with for await...of and provides a convenient sequential processing model.',
 'AbortSignal support in Node APIs enables coordinated cancellation when operations are designed to observe it.',
 'Node timers keep process activity alive unless explicitly unrefed, so background timers can affect process shutdown behavior.',
 'The node:crypto module provides cryptographic primitives, but application protocols should prefer well-reviewed constructions rather than inventing algorithms.',
 'Buffer is a Node-specific binary data type that extends Uint8Array semantics and is widely used for network and filesystem data.',
 'fs streams are useful for large files because they avoid loading the entire file into memory at once.',
 'Graceful Node shutdown should close listeners, stop new work, and bound the time spent waiting for in-flight operations.'
 ],
 security:[
 'Input validation should occur at trust boundaries and should enforce type, size, format, and authorization requirements rather than relying on client-side checks.',
 'Output encoding should match the target context such as HTML, URL, JavaScript string, CSS, or shell-like syntax; one generic escaping function is not sufficient for every context.',
 'CSP nonce values should be unpredictable and scoped to the individual response when nonce-based script authorization is used.',
 'Trusted Types policies should centralize creation of values accepted by dangerous DOM sinks and keep policy surface area small.',
 'SameSite cookie settings reduce some cross-site request risks but do not replace server-side authorization and request validation.',
 'Cookie prefixes such as __Host- impose stricter requirements that can reduce accidental scope changes when used correctly.',
 'Subresource Integrity protects static subresources when the expected cryptographic hash is known and correctly deployed.',
 'Frame-ancestors in Content Security Policy controls which origins may embed a page and is stronger than relying only on UI conventions.',
 'Cross-origin isolation can enable certain powerful capabilities such as SharedArrayBuffer while changing the compatibility requirements of a deployment.',
 'Security logging should avoid secrets and sensitive payloads while retaining enough structured context to support incident investigation.'
 ],
 performance:[
 'Batching DOM writes and reads reduces forced synchronous layout caused by repeatedly alternating mutations and geometry queries.',
 'requestAnimationFrame callbacks should perform bounded visual work because excessive work in a frame can still produce dropped frames.',
 'Idle callbacks are best treated as opportunistic background time because they may be delayed when the browser remains busy.',
 'IntersectionObserver can replace repeated scroll geometry polling for many visibility-triggered behaviors.',
 'ResizeObserver reports element size changes and should avoid feedback loops where callbacks immediately trigger unbounded size changes.',
 'Virtualized lists should preserve keyboard navigation, focus behavior, and accessible semantics while reducing rendered node count.',
 'Memoization trades memory for repeated computation savings and requires a correct cache key plus an invalidation policy.',
 'Object pooling can reduce allocation pressure in specialized hot paths but adds lifecycle complexity and can retain memory unexpectedly.',
 'Long-task instrumentation can reveal main-thread work that blocks input and rendering for extended intervals.',
 'Performance optimization should begin with measurement because reducing one operation can expose a different bottleneck elsewhere.'
 ],
 testing:[
 'Tests should assert externally meaningful behavior rather than implementation details that can change without affecting the public contract.',
 'Fuzz tests are valuable for parsers and boundary-sensitive logic because they explore malformed and unexpected input combinations.',
 'Differential testing compares two implementations or versions against the same inputs to identify behavioral divergence.',
 'Concurrency tests should exercise ordering, cancellation, duplicate delivery, and resource cleanup rather than only the happy path.',
 'Idempotency tests repeat an operation and verify that repeated application produces the documented effect.',
 'Serialization round-trip tests verify that encode followed by decode preserves the intended semantic state.',
 'Error tests should distinguish type errors, validation errors, transient failures, permanent failures, and cancellation where those categories affect recovery.',
 'Test fixtures should be small and representative so failures remain understandable and execution remains fast.',
 'Randomized test generation should record seeds so a failing generated case can be reproduced exactly.',
 'Integration tests should verify real boundaries between modules while unit tests can isolate deterministic transformations.'
 ]
};
export const LARGE_JAVASCRIPT_KNOWLEDGE_V38_TEXT=Object.entries(packs).flatMap(([domain,items])=>items.map((text,index)=>`[javascript-v38:${domain}:${index+1}] ${text}`)).join('\n');
export const javascriptKnowledgeV38Stats=()=>({version:38,packs:Object.keys(packs).length,entries:Object.values(packs).reduce((n,x)=>n+x.length,0),characters:LARGE_JAVASCRIPT_KNOWLEDGE_V38_TEXT.length,pretrained:false});
if(typeof window!=='undefined')window.TONYLargeJavaScriptKnowledgeV38={LARGE_JAVASCRIPT_KNOWLEDGE_V38_TEXT,javascriptKnowledgeV38Stats};
