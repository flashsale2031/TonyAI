// TONY Large JavaScript Knowledge v45.
// Authored deterministic JavaScript/web engineering knowledge; no pretrained model.
const packs={
 runtime:[
'JavaScript equality uses different algorithms in different operations, so code should choose strict equality, Object.is, or SameValueZero intentionally.',
'Coercion in arithmetic and comparison can invoke primitive conversion hooks, making explicit normalization useful at API boundaries.',
'The this value of a normal function depends on its call form, while an arrow function captures this lexically.',
'Function constructors and eval can create dynamic code and should be avoided when static code structure is sufficient.',
'Generator return values are distinct from yielded values and are observable through the iterator result object when the generator completes.',
'Async functions always return promises even when their body returns an ordinary value.',
'Promise resolution adopts thenables, so foreign promise-like objects can influence asynchronous settlement.',
'Microtask chains can delay rendering and other tasks if code continuously schedules more microtasks without yielding.',
'Automatic garbage collection does not release resources such as sockets or file descriptors unless application code closes those resources.',
'Weak references are advanced memory tools and should not be used to build correctness-critical ownership protocols.'
],
 modules:[
'Module resolution maps a specifier to a module record before evaluation, so resolution failures can occur before application code executes.',
'Import assertions or attributes can communicate expected module types where the host supports them.',
'Export-star aggregation can create ambiguous exports when multiple dependencies expose the same name.',
'Top-level await can serialize portions of an otherwise parallel module graph, so startup dependencies should remain intentional.',
'Conditional package exports can create different module graphs for different consumers and therefore require compatibility testing.',
'Package import maps and aliases should have one canonical source of truth to prevent environment-specific resolution drift.',
'Bundlers may transform module syntax and tree-shake unused exports, but side effects can prevent safe elimination.',
'Dynamic import is useful for feature isolation but should not be used as an accidental substitute for dependency architecture.',
'Circular dependencies are easier to reason about when initialization is separated from declarations and side effects.',
'Module APIs should expose narrow stable contracts so implementation files can evolve without forcing consumers to change.'
],
 dom:[
'composedPath can reveal the event propagation path across shadow boundaries when event composition permits it.',
'Event listeners should be removed or scoped with AbortSignal when component lifetimes are shorter than the document lifetime.',
'Custom elements should keep attribute/property synchronization rules explicit to avoid surprising recursive updates.',
'connectedCallback and disconnectedCallback define important custom-element lifecycle boundaries for attaching and releasing resources.',
'IntersectionObserver thresholds describe ratios at which notifications are delivered and do not provide pixel-perfect visibility measurements.',
'ResizeObserver callbacks should avoid immediate size-changing writes that can create feedback loops.',
'DocumentFragment insertion moves its child nodes into the destination rather than retaining an independent duplicate tree.',
'Shadow roots can use delegatesFocus where supported to control keyboard focus behavior at component boundaries.',
'Dialog focus management should preserve a predictable path back to the invoking control when the dialog closes.',
'Popover interaction should be designed around explicit trigger and dismissal behavior instead of relying on document-wide click heuristics.'
],
 webapi:[
'ReadableStream controllers should respect desiredSize and cancellation so producers do not outrun consumers indefinitely.',
'TransformStream separates input and output flow and can express streaming conversions without buffering the entire payload.',
'TextDecoderStream incrementally decodes byte streams while correctly handling multibyte character boundaries.',
'CompressionStream and DecompressionStream can process supported compressed formats as streams in capable environments.',
'File and Blob objects represent immutable byte sequences, while streams can provide incremental access to their contents.',
'Object URLs keep a browser-managed reference to a Blob-like resource and should be revoked when the owning view no longer needs them.',
'Clipboard operations are permission- and user-activation-sensitive and should provide a graceful fallback when unavailable.',
'Web Locks can coordinate named resources across tabs but should not be the sole correctness mechanism for critical server state.',
'Page Visibility changes can be used to reduce optional background work while preserving required synchronization.',
'History API state is application-owned metadata and should not be treated as a secure storage location.'
],
 security:[
'Origin checks should compare normalized origins rather than user-controlled host strings assembled from unrelated URL fields.',
'CORS controls browser read access and does not grant authorization to a server resource by itself.',
'CSRF tokens protect state-changing requests when the server validates them against the appropriate session context.',
'CSP nonces or hashes can permit specific inline code while keeping broad unsafe-inline policy disabled.',
'Trusted Types reduce unsafe string-to-DOM flows but do not replace authorization or server-side validation.',
'SRI hashes protect against modified static resources but do not validate dynamically generated application data.',
'Sandboxed iframes should receive only the capabilities necessary for their intended content and communication model.',
'Noopener behavior prevents a newly opened page from receiving an opener reference that could otherwise enable reverse-tabnabbing patterns.',
'Cross-origin isolation requirements should be tested with all embedded assets because one incompatible resource can prevent isolation.',
'Security boundaries should fail closed when required policy metadata is absent or malformed.'
],
 node:[
'Node streams can be composed with pipeline so errors and completion propagate through a connected processing graph.',
'AbortController can provide a shared cancellation signal to request, filesystem, and custom asynchronous operations that support it.',
'Worker threads are useful for CPU-bound JavaScript but should use bounded pools and explicit message protocols.',
'AsyncLocalStorage context should be treated as request metadata rather than a replacement for explicit function parameters in core logic.',
'Node timers keep the process alive unless their handles are configured appropriately, so lifecycle-sensitive code must manage them.',
'File reads should prefer streaming when input size is unbounded or large enough to create avoidable memory pressure.',
'HTTP request bodies are streams and should be consumed or rejected deliberately so connections can be reused safely.',
'DNS and TLS failures should be categorized separately because retry and remediation strategies can differ.',
'Environment configuration should be validated at process startup when invalid values would make the service unsafe or unusable.',
'Graceful shutdown should include a bounded deadline so a stalled dependency cannot prevent process termination forever.'
],
 data:[
'Array iteration callbacks should avoid mutating the same collection in ways that make the intended traversal order ambiguous.',
'Sparse arrays have holes that differ from explicit undefined elements for several array iteration operations.',
'Typed array constructors can copy from iterables or create views over existing buffers depending on the constructor form.',
'Endianness must be specified when interpreting multi-byte binary protocols because network and host conventions can differ.',
'JSON numbers do not preserve arbitrary integer precision beyond the exact range of JavaScript Number semantics.',
'BigInt serialization requires an explicit representation because JSON.stringify does not directly serialize BigInt values.',
'Structured cloning handles supported Maps, Sets, typed arrays, and cyclic references without preserving ordinary prototype behavior.',
'Immutable update helpers such as toSorted, toReversed, and with make copy-on-write transformations explicit.',
'Object key ordering has defined rules but should not be used as a substitute for a semantic ordering field in business data.',
'Normalization before comparison can prevent equivalent Unicode or serialized representations from being treated as different application values.'
],
 architecture:[
'Command Query Separation keeps state-changing commands distinct from read-only queries, which can simplify authorization and caching.',
'Deduplication keys should represent operation identity rather than payload equality when retries are possible.',
'Leases should include expiration and renewal behavior because a process holding a resource may disappear without releasing it.',
'Clock skew makes distributed timestamps imperfect ordering signals, so systems should distinguish event time from receipt time.',
'Configuration snapshots make behavior reproducible and can prevent one request from observing half-applied configuration changes.',
'Graceful shutdown is easier when admission, processing, and resource-release phases are modeled explicitly.',
'Queue consumers should make acknowledgement semantics explicit so a crash cannot silently turn successful work into lost work.',
'At-least-once delivery requires idempotent handlers or durable deduplication to tolerate duplicate messages.',
'Observability sampling should preserve important failures and boundary transitions rather than sampling uniformly without context.',
'Architecture tests can enforce dependency direction and prevent infrastructure modules from leaking into domain logic.'
],
 testing:[
'Fuzzing parsers with malformed Unicode, truncated input, oversized fields, and invalid encodings can reveal assumptions missed by ordinary tests.',
'Golden outputs should be versioned when intentional output changes are expected so updates remain reviewable.',
'End-to-end tests should verify the deployed integration path for critical user flows rather than relying only on isolated mocks.',
'Contract tests can verify that producers and consumers agree on field types, optionality, and error behavior.',
'Fake clocks make time-dependent tests deterministic and expose assumptions about wall-clock versus monotonic time.',
'Cleanup assertions can detect leaked event listeners, workers, timers, sockets, and temporary files.',
'Boundary matrices are useful when several independent limits interact, such as size, count, nesting depth, and timeout.',
'Replayable fixtures allow production-shaped failures to be tested repeatedly without depending on the original environment.',
'Differential tests are strongest when both implementations are independently constructed rather than sharing the same helper bug.',
'Performance regression tests should track distributions or stable percentiles rather than relying on a single noisy timing sample.'
],
 tooling:[
'Source maps connect generated code locations back to source locations and should be published with compatible generated artifacts.',
'Lint rules are most useful when they encode project invariants rather than stylistic preferences that developers routinely disable.',
'Type declaration files should describe the public API accurately because consumers may rely on them without reading implementation code.',
'Build reproducibility improves when dependency versions, lockfiles, compiler options, and generated inputs are controlled.',
'Minification changes identifier names and whitespace but should preserve program semantics under the assumptions of the toolchain.',
'Code splitting should be measured against network latency and parse cost because more chunks are not automatically faster.',
'Package managers resolve dependency graphs and lockfiles capture the chosen graph for reproducible installations.',
'Bundler tree shaking relies on side-effect information and static module structure, so dynamic patterns can limit optimization.',
'Continuous integration should validate the same build and test commands that are required for a production artifact.',
'Automated formatting reduces incidental diffs and leaves human review focused on behavior and architecture.'
]
};
export const LARGE_JAVASCRIPT_KNOWLEDGE_V45_TEXT=Object.entries(packs).flatMap(([pack,entries])=>entries.map((text,i)=>`[JavaScript v45/${pack}/${i+1}] ${text}`)).join('\n');
export const javascriptKnowledgeV45Stats=()=>({version:'45.0',packs:Object.keys(packs).length,entries:Object.values(packs).reduce((n,x)=>n+x.length,0),characters:LARGE_JAVASCRIPT_KNOWLEDGE_V45_TEXT.length,pretrained:false,authored:true});
if(typeof window!=='undefined')window.TONYLargeJavaScriptKnowledgeV45={LARGE_JAVASCRIPT_KNOWLEDGE_V45_TEXT,javascriptKnowledgeV45Stats};
