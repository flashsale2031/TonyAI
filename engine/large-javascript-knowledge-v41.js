// TONY Large JavaScript Knowledge v41.
// Authored deterministic JavaScript/web engineering knowledge; no pretrained model.
const packs={
 modules:[
  'ES module bindings are live views of exported bindings rather than copied values, which matters for cyclic and stateful modules.',
  'Dynamic import returns a promise and can defer loading until a feature actually needs a module.',
  'Import maps let browsers map bare module specifiers to URLs without a bundler-specific resolver at runtime.',
  'Top-level await pauses module evaluation and can delay dependents, so it should be used deliberately in dependency graphs.',
  'Module namespace objects expose exported bindings through a special immutable namespace interface.',
  'Package exports can restrict public entry points and provide conditional mappings for different environments.',
  'Circular module dependencies are valid but execution order can expose partially initialized bindings.',
  'Module preload can begin fetching a module graph before the parser reaches the eventual module import.',
  'ES module evaluation is distinct from fetching; a fetched module can still be waiting for dependency evaluation.',
  'CommonJS and ES modules have different loading and binding semantics, so interoperability should be tested at the boundary.'
 ],
 errors:[
  'Error.cause preserves the originating failure as structured causal context instead of flattening diagnostics into a string.',
  'AggregateError represents multiple failures and is useful for operations that evaluate several alternatives.',
  'Custom error classes should retain a stable name or code while preserving stack and cause information.',
  'Throwing inside a promise executor converts the exception into a rejection rather than escaping synchronously.',
  'Error stack formatting is runtime-dependent and should not be treated as a portable machine-readable protocol.',
  'Validation errors should identify the invalid field or invariant while avoiding exposure of sensitive internal data.',
  'Errors crossing worker or network boundaries should be serialized into explicit safe data rather than passing Error objects directly.',
  'Retryable errors and permanent errors should be represented distinctly so callers do not retry invalid requests forever.',
  'An abort is often a control-flow outcome rather than an application failure and should be classified separately when appropriate.',
  'Error handling should preserve enough context to diagnose the root cause without leaking secrets into logs.'
 ],
 performance:[
  'A single large synchronous loop can block the browser event loop; chunking work gives input and rendering opportunities to run.',
  'Idle callbacks are useful for deferrable work but should not be treated as a guaranteed execution deadline.',
  'Memoization trades memory for computation and requires keys that fully represent every input affecting the result.',
  'Structural sharing can reduce allocation when immutable updates replace only a small portion of a large data graph.',
  'Batching DOM mutations reduces repeated style and layout calculations compared with many isolated updates.',
  'Offloading CPU-heavy work to a Worker can preserve main-thread responsiveness while introducing serialization and scheduling overhead.',
  'Compression reduces transfer size at the cost of CPU work and should be evaluated against the actual network and device mix.',
  'Performance budgets turn vague optimization goals into measurable limits for bundle size, latency, memory, and responsiveness.',
  'Resource timing data can reveal connection, DNS, request, and response phases that aggregate page metrics hide.',
  'A performance optimization is valuable only when it improves a meaningful workload without introducing disproportionate complexity.'
 ],
 security:[
  'SameSite cookies can reduce cross-site request risks, but authorization must still be enforced on the server for every protected operation.',
  'No opener relationships prevent a newly opened page from retaining an unintended scripting reference to its opener.',
  'Frame sandboxing should use the minimum capability allowances required by the embedded application.',
  'Origin checks are security decisions and should use parsed URL origins rather than brittle string prefix comparisons.',
  'Server authorization must be based on trusted server-side identity and resource ownership, never solely on hidden frontend fields.',
  'Secrets should not be placed in browser JavaScript bundles because delivered client code is observable by users and intermediaries.',
  'Input validation should enforce expected structure and limits before expensive processing to reduce abuse and accidental resource exhaustion.',
  'Rate limits and quotas provide operational protection against accidental or malicious request amplification.',
  'Security logging should record useful event context while excluding passwords, tokens, payment data, and other secrets.',
  'Least privilege reduces the blast radius when a component, dependency, or credential is compromised.'
 ],
 browser:[
  'The Page Visibility API lets applications pause or reduce nonessential work when a document is hidden.',
  'beforeunload should not be used as a general persistence mechanism; state should be saved incrementally during normal operation.',
  'The History API can change client-side URLs without a full navigation, while popstate reports history traversal.',
  'URL objects provide parsed origin, path, query, and fragment components and are safer than manual URL string slicing.',
  'FormData represents multipart-style form fields and file values and can be passed directly to fetch in supported browser contexts.',
  'File and Blob objects represent browser-accessible data and can be read through streams or array-buffer/text methods.',
  'Object URLs expose local Blob data through temporary URLs and should be revoked when no longer needed.',
  'The Clipboard API is permission-sensitive and should be invoked from user-relevant interactions where browser policy permits it.',
  'Storage events can notify other same-origin documents about localStorage changes but do not fire in the document that made the change.',
  'Visibility, focus, online state, and page lifecycle events represent different conditions and should not be conflated.'
 ],
 streams:[
  'ReadableStream backpressure communicates downstream demand so producers do not indefinitely outrun consumers.',
  'TransformStream composes streaming transformations without requiring the entire payload in memory.',
  'WritableStream provides a sink abstraction with controlled writes and close or abort semantics.',
  'TextDecoderStream converts byte streams to text incrementally and correctly handles multibyte character boundaries.',
  'Streaming JSON requires framing or a parser designed for incremental input because JSON text is not generally self-delimiting by arbitrary chunks.',
  'Teeing a stream duplicates consumption paths but can increase memory pressure when one consumer falls behind.',
  'Stream cancellation should propagate to the underlying source when continuing production has no remaining consumer.',
  'Pipelines should define what happens when a transform fails so upstream and downstream resources are closed predictably.',
  'Chunk boundaries are transport details and should not be mistaken for application message boundaries.',
  'Streaming interfaces are most useful when latency and memory improvements outweigh the complexity of incremental processing.'
 ],
 tooling:[
  'Source maps connect generated code positions back to source code and improve debugging of transformed JavaScript.',
  'Lint rules encode repeatable code-quality policies and are most effective when violations are actionable rather than stylistic noise.',
  'TypeScript declarations describe static contracts but do not replace runtime validation at untrusted boundaries.',
  'Bundlers construct dependency graphs and can remove unreachable code when module semantics allow safe tree shaking.',
  'Minification changes source representation while preserving behavior under the tool assumptions; tests should run against production-like builds.',
  'Code splitting lets applications defer loading rarely used features and reduce initial transfer costs.',
  'Lockfiles make dependency resolution reproducible by recording exact package versions and integrity information.',
  'Semantic version ranges express compatibility intent but do not guarantee that a dependency upgrade is behaviorally harmless.',
  'Package managers distinguish direct dependencies from transitive dependencies and their resolution rules affect reproducibility.',
  'Build pipelines should fail early on malformed artifacts, missing dependencies, or inconsistent generated output.'
 ],
 architecture:[
  'Dependency inversion keeps high-level policy independent from concrete infrastructure and makes testing easier.',
  'Ports and adapters isolate external systems behind explicit interfaces so the core application can remain deterministic.',
  'State machines make allowed transitions explicit and prevent impossible combinations of status flags.',
  'Command-query separation distinguishes operations that change state from operations that return information.',
  'Event-driven systems should define delivery semantics such as at-most-once, at-least-once, or effectively-once processing.',
  'Deduplication is safest when based on stable operation identifiers rather than heuristics over payload text.',
  'Lease-based coordination requires expiry and renewal semantics so abandoned work can eventually be recovered.',
  'Distributed clocks cannot be assumed to agree perfectly, so ordering and timeout logic should tolerate skew.',
  'Configuration should be validated at startup and represented internally with explicit typed values and defaults.',
  'A small stable core with explicit extension points is easier to reason about than a large collection of implicit cross-module coupling.'
 ],
 data:[
  'Map preserves insertion order for iteration and uses SameValueZero semantics for key equality.',
  'Set membership uses SameValueZero equality, so NaN is considered equal to itself for set membership purposes.',
  'TypedArray views share underlying buffer storage unless a copy is explicitly created, so mutations can be observable across views.',
  'ArrayBuffer slicing creates a copied buffer region, while typed-array subarray creates another view over shared storage.',
  'DataView is useful for binary protocols where fields have mixed widths and explicit endianness.',
  'JSON.stringify omits undefined object properties and serializes array positions containing undefined as null.',
  'JSON cannot directly represent BigInt, cyclic object graphs, Map, Set, or arbitrary class instances without custom conversion.',
  'Structured cloning preserves supported built-in data structures more faithfully than JSON serialization.',
  'Sorting large arrays mutates the array with sort, while toSorted produces a new sorted array.',
  'Stable data schemas should define field types, optionality, limits, and compatibility rules rather than relying on informal conventions.'
 ],
 workers:[
  'Worker messages use structured cloning by default, which can copy data and impose costs for large object graphs.',
  'Transferable objects can move ownership of underlying resources between contexts without copying their contents.',
  'SharedArrayBuffer permits shared memory between agents when required security isolation headers are correctly configured.',
  'Atomics operations coordinate access to shared integer typed arrays and can provide wait/notify synchronization primitives.',
  'Dedicated workers have one owning document while shared workers can be connected to by multiple browsing contexts.',
  'Service workers can intercept network requests for controlled scopes and can enable offline application behavior.',
  'Worker lifecycle management should terminate workers that no longer have useful work to avoid unnecessary resource usage.',
  'OffscreenCanvas allows supported rendering work to occur outside the main window context.',
  'Worker communication protocols should version messages when independently deployed components may evolve.',
  'Moving work to a worker does not automatically make it faster; serialization, startup, and coordination costs must be measured.'
 ],
 testing:[
  'Tests for asynchronous code should control both promise scheduling and timer advancement when timing affects behavior.',
  'Integration tests should exercise real boundaries while unit tests can isolate deterministic business logic for fast feedback.',
  'Fuzzing explores malformed or unusual inputs and is especially valuable for parsers, decoders, and protocol handlers.',
  'Differential tests compare two implementations or versions on the same generated inputs to discover behavioral divergence.',
  'Concurrency tests should vary interleavings and delays rather than relying on one lucky execution order.',
  'Resource cleanup should be asserted explicitly when tests create timers, listeners, workers, sockets, or temporary files.',
  'Regression tests should reproduce a previously observed failure and remain small enough to explain why the bug cannot return.',
  'Test fixtures should avoid hidden global state because shared mutable setup makes failures order-dependent.',
  'Golden files should be reviewed when intentionally changing output formats so accidental broad changes are not silently accepted.',
  'A useful test suite balances fast deterministic checks with a smaller number of slower end-to-end scenarios.'
 ]
};
export const LARGE_JAVASCRIPT_KNOWLEDGE_V41_TEXT=Object.entries(packs).flatMap(([pack,entries])=>entries.map((text,i)=>`[JavaScript v41/${pack}/${i+1}] ${text}`)).join('\n');
export const javascriptKnowledgeV41Stats=()=>({version:'41.0',packs:Object.keys(packs).length,entries:Object.values(packs).reduce((n,x)=>n+x.length,0),characters:LARGE_JAVASCRIPT_KNOWLEDGE_V41_TEXT.length,pretrained:false,authored:true});
if(typeof window!=='undefined')window.TONYLargeJavaScriptKnowledgeV41={LARGE_JAVASCRIPT_KNOWLEDGE_V41_TEXT,javascriptKnowledgeV41Stats};
