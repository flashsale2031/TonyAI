// TONY Large JavaScript Knowledge v33.
// Authored deterministic JavaScript/web engineering knowledge; no pretrained model.
const packs={
 language:[
  'Destructuring defaults apply when the matched value is undefined, while null remains null unless explicitly handled.',
  'Rest parameters collect remaining arguments into a real array, unlike the legacy arguments object.',
  'Spread syntax expands iterables in expression contexts and object properties in object-literal contexts.',
  'Default function parameters are evaluated at call time in their own parameter environment.',
  'Arrow functions capture lexical this and do not create their own arguments, super, or new.target bindings.',
  'Function declarations and expressions differ in initialization timing, especially within block and module scopes.',
  'Closure state remains reachable through references to functions that capture the corresponding lexical environment.',
  'Private class fields use nominal private brands and cannot be accessed with ordinary property syntax.',
  'Static initialization blocks run during class definition evaluation and can initialize private static state.',
  'Accessor declarations separate getter and setter behavior from ordinary data properties.'
 ],
 collections:[
  'Map preserves insertion order and accepts arbitrary values as keys; object property keys are converted according to object-key rules.',
  'Set stores unique values using SameValueZero semantics, so NaN values compare as equal and negative zero equals positive zero.',
  'Map iteration observes entries in insertion order unless entries are deleted or reinserted.',
  'Set iteration similarly follows insertion order and can be used for deterministic de-duplication.',
  'Object.hasOwn provides a direct own-property test without requiring a potentially shadowed hasOwnProperty method.',
  'Array.prototype.at supports relative indexing from the end using negative indexes.',
  'findLast and findLastIndex search arrays from the final element toward the beginning.',
  'The newer non-mutating array methods such as toSorted, toReversed, and toSpliced preserve the original array.',
  'Array grouping operations transform collections into keyed aggregate structures and should use stable key semantics.',
  'Custom sort comparators must define a consistent ordering; returning NaN or contradictory comparisons can produce surprising results.'
 ],
 regex:[
  'The sticky regular-expression flag anchors matching at the current lastIndex rather than searching forward arbitrarily.',
  'The Unicode flag changes escape and code-point interpretation and should be used when processing Unicode text intentionally.',
  'The indices flag exposes match index ranges and can simplify precise substring accounting.',
  'Named capture groups make complex regular expressions easier to maintain by giving captures semantic identifiers.',
  'Lookahead assertions test following input without consuming it, while lookbehind tests preceding input.',
  'Backreferences require careful handling because they match previously captured text rather than a fresh pattern.',
  'Global and sticky regular expressions are stateful through lastIndex, so reuse can affect subsequent test or exec calls.',
  'Escaping user-provided regular-expression fragments is necessary when constructing patterns dynamically.',
  'Regular expressions are a poor fit for deeply nested recursive syntax and should not replace a parser where grammar structure matters.',
  'Regex performance can degrade sharply with ambiguous nested quantifiers and should be tested against adversarial inputs.'
 ],
 intl:[
  'Intl.NumberFormat formats numbers according to locale and options without requiring manual separator rules.',
  'Intl.DateTimeFormat handles locale-sensitive date and time presentation and timezone options.',
  'Intl.RelativeTimeFormat generates locale-aware relative phrases such as days or hours from a numeric difference.',
  'Intl.ListFormat formats arrays as locale-aware conjunction or disjunction lists.',
  'Intl.PluralRules determines locale-sensitive plural categories and is useful for message selection.',
  'Intl.Collator provides locale-aware comparison and sorting behavior for human-readable strings.',
  'Intl.Segmenter can segment text by grapheme, word, or sentence according to locale-sensitive rules.',
  'Intl.DisplayNames maps supported codes to localized display names for selected language and region data.',
  'Locale canonicalization should occur before caching locale-dependent formatting decisions.',
  'Internationalized applications should avoid assuming that character count, word order, date order, or decimal formatting is universal.'
 ],
 streams:[
  'ReadableStream consumers should apply backpressure so producers do not enqueue unbounded amounts of data.',
  'TransformStream composes incremental transformations between writable and readable sides of a pipeline.',
  'CompressionStream can provide browser-supported streaming compression when the target runtime implements it.',
  'Streaming response bodies permit incremental parsing and progressive processing instead of buffering an entire payload.',
  'Abort signals should cancel streaming pipelines and release resources when consumers leave or requests time out.',
  'A stream reader lock prevents other consumers from reading the same stream until it is released.',
  'Teeing a stream duplicates chunks for two consumers but can increase buffering pressure when their consumption rates differ.',
  'TextDecoderStream converts byte streams into text chunks while preserving multibyte decoding boundaries.',
  'Async iterators provide a natural interface for consuming many asynchronous stream-like sources.',
  'Stream pipelines should surface errors from both source and transformation stages rather than silently dropping failures.'
 ],
 node_web:[
  'Node URL parsing should use the WHATWG URL API for consistent structured access to protocol, host, path, and query components.',
  'HTTP request handlers should reject unsupported methods early and return explicit status codes for malformed input.',
  'Request body limits protect Node services from accidentally buffering arbitrarily large payloads.',
  'Server timeouts should distinguish connection, request, header, and response phases where the runtime permits.',
  'Graceful Node shutdown should stop new connections, drain active requests, and then close database and filesystem resources.',
  'AbortSignal can unify request cancellation with downstream fetch, filesystem, and application operations.',
  'AsyncLocalStorage can associate contextual state with asynchronous execution without passing the value through every function explicitly.',
  'Node worker threads are appropriate for CPU-heavy JavaScript that would otherwise block the main event loop.',
  'Message passing between worker threads should use explicit versioned payload schemas to tolerate application evolution.',
  'Unhandled promise rejections should be treated as observable application failures rather than ignored background events.'
 ],
 websecurity:[
  'Origin is defined by scheme, host, and port; path and query differences do not create distinct origins.',
  'Opaque origins can occur for sandboxed documents and certain other browser contexts and do not behave like ordinary host origins.',
  'CORS credentials require compatible server headers and cannot be enabled by a wildcard Access-Control-Allow-Origin value.',
  'Frame-ancestors in CSP controls which origins may embed a document and is stronger than relying on legacy framing headers alone.',
  'Sandboxed iframes should receive only the permissions necessary for their intended content.',
  'Cookie prefixes such as __Host- and __Secure- impose additional browser-enforced constraints when supported.',
  'Security headers are defense-in-depth and should complement correct server-side authorization and input validation.',
  'HTTP range requests allow partial content retrieval and can improve large-file transfer behavior when implemented correctly.',
  'ETag validators support conditional requests and cache revalidation but must be generated consistently for the represented resource.',
  'Idempotency keys are useful for safely retrying state-changing HTTP requests when the server stores and enforces the key.'
 ],
 architecture:[
  'Dependency inversion keeps high-level policy independent from concrete infrastructure by depending on stable abstractions.',
  'Composition is often preferable to inheritance when behavior needs to vary independently across multiple dimensions.',
  'Pure functions are easier to test because their outputs depend only on explicit inputs and they do not mutate shared state.',
  'Immutable data boundaries reduce accidental coupling between modules that otherwise share object references.',
  'Command handlers should validate command shape before invoking domain side effects.',
  'A state-machine transition should have one clear owner so competing asynchronous operations cannot create invalid states.',
  'Retry policies should classify transient failures and use bounded exponential backoff with jitter where appropriate.',
  'Circuit breakers should distinguish open, half-open, and closed states and record failure windows explicitly.',
  'Observability hooks should capture enough context to diagnose failures without logging secrets or unnecessary private data.',
  'Feature flags should have deterministic defaults and a cleanup plan so temporary branches of behavior do not become permanent complexity.'
 ],
 tooling:[
  'ESLint-style static analysis catches suspicious JavaScript patterns before runtime and is complementary to tests.',
  'TypeScript can provide static contracts for JavaScript applications without changing the runtime execution model after compilation.',
  'Source maps connect transformed or bundled code back to original source locations for debugging.',
  'Bundlers should preserve side-effect semantics and respect package export conditions when resolving dependencies.',
  'Tree shaking removes unreachable module exports only when module semantics permit safe elimination.',
  'Code splitting reduces initial payload by loading feature-specific chunks on demand.',
  'Import maps can provide browser-side module specifier aliases without a traditional bundler.',
  'Module workers use module semantics for worker scripts and can share ESM-oriented code with the main application.',
  'Automated formatting should be deterministic so unrelated formatting changes do not obscure functional diffs.',
  'Dependency lockfiles improve reproducibility by recording concrete dependency resolution rather than only version ranges.'
 ],
 debugging:[
  'Reproducing a bug with the smallest input that still fails reduces diagnostic search space and makes regression tests clearer.',
  'Stack traces identify call paths but should be interpreted alongside asynchronous boundaries and source maps.',
  'Unhandled rejection diagnostics should preserve the original error cause when wrapping errors for higher-level context.',
  'AggregateError is appropriate when multiple independent operations fail and their individual errors must remain inspectable.',
  'Error causes can preserve causal chains without forcing every caller to parse message strings.',
  'Timeout failures should record operation identity and elapsed duration so slow dependencies can be distinguished from immediate failures.',
  'Logging should include stable request or operation identifiers rather than relying on timestamps alone for correlation.',
  'Assertions are valuable for impossible internal states but should not replace validation of untrusted external input.',
  'A regression test should capture the externally observable failure and avoid depending unnecessarily on internal implementation details.',
  'Debug-only instrumentation should have an explicit lifecycle so diagnostic hooks cannot accumulate into production overhead.'
 ]
};
export const LARGE_JAVASCRIPT_KNOWLEDGE_V33_TEXT=Object.values(packs).flat().join('\n');
export const javascriptKnowledgeV33Stats={version:'33',packs:Object.keys(packs),entries:Object.values(packs).reduce((n,p)=>n+p.length,0),characters:LARGE_JAVASCRIPT_KNOWLEDGE_V33_TEXT.length,pretrained:false};
