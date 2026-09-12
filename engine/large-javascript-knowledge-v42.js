// TONY Large JavaScript Knowledge v42.
// Authored deterministic JavaScript/web engineering knowledge; no pretrained model.
const packs={
 runtime:[
  'The JavaScript event loop coordinates jobs and tasks; promise reactions are processed as microtasks before the next task proceeds.',
  'A synchronous exception propagates through the current call stack until a matching catch boundary is reached.',
  'Strict mode changes several legacy semantics and should be used consistently in modern application code.',
  'The globalThis object provides a standard cross-environment reference to the global object.',
  'Timers schedule callbacks but do not guarantee exact execution time because the event loop may be busy.',
  'queueMicrotask schedules a microtask without creating a promise solely for scheduling purposes.',
  'setTimeout with a zero delay still waits for the relevant task scheduling rules and cannot interrupt current synchronous work.',
  'JavaScript garbage collection is automatic but object reachability still determines whether memory remains collectible.',
  'WeakMap and WeakSet do not prevent their object keys from being garbage collected when no other strong references remain.',
  'FinalizationRegistry callbacks are nondeterministic and should never be used as the primary mechanism for releasing critical resources.'
 ],
 functions:[
  'Function declarations are hoisted differently from function expressions assigned through variables.',
  'Arrow functions capture lexical this and do not provide their own arguments object or construct behavior.',
  'Rest parameters collect remaining arguments into a new array-like value.',
  'Default parameters are evaluated at call time and can reference earlier parameters.',
  'Destructuring assignment can extract nested values while supplying defaults for missing properties.',
  'Closures retain references to required lexical bindings rather than snapshots of primitive values.',
  'Higher-order functions accept or return functions and are useful for composing reusable behavior.',
  'A function can be used as a constructor only when its callable form supports construction semantics.',
  'Generator functions suspend at yield points and preserve execution state between next calls.',
  'Async generator functions expose asynchronous iteration while allowing awaited operations between yields.'
 ],
 objects:[
  'Prototype lookup continues through the prototype chain until a property is found or the chain reaches null.',
  'Object.create can establish an explicit prototype and optionally define own properties in the created object.',
  'Object.getPrototypeOf and Object.setPrototypeOf expose prototype relationships, although changing prototypes dynamically can hurt performance.',
  'Enumerability affects common property enumeration mechanisms but does not make a property nonexistent.',
  'Own property keys can be inspected with Reflect.ownKeys, which includes symbol keys.',
  'Object.freeze prevents ordinary mutation of an object surface but does not recursively freeze referenced objects.',
  'Object.seal prevents adding or removing own properties while allowing permitted value changes.',
  'Object.preventExtensions stops new own properties while leaving existing descriptors subject to their individual rules.',
  'Getter and setter properties execute code on access and assignment and should be treated as behavior rather than passive data.',
  'Proxy wrappers can virtualize object operations but introduce observable traps and should preserve language invariants.'
 ],
 async:[
  'Promise chains propagate fulfillment values to the next then handler unless a handler throws or returns a rejected promise.',
  'Returning a promise from a then handler causes the outer promise to adopt that promise state.',
  'Promise.race settles with the first input promise to settle, whether fulfillment or rejection.',
  'AbortSignal can be shared among several operations when a single cancellation decision should stop all of them.',
  'Async iteration naturally supports paginated or streamed asynchronous sources without collecting everything first.',
  'A rejected promise remains rejected until a handler transforms it into a fulfillment or another rejection.',
  'Promise callbacks should avoid accidental unbounded recursion through synchronous scheduling assumptions because microtasks can starve tasks.',
  'Concurrency limits can be implemented by keeping a bounded set of active promises rather than launching every operation at once.',
  'Timeout wrappers should cancel underlying work when possible instead of merely ignoring a late result.',
  'Cleanup code should run in finally or an equivalent structured mechanism so it executes for both success and failure paths.'
 ],
 webapi:[
  'The URL API normalizes URL components and provides an origin property useful for same-origin policy decisions.',
  'URLSearchParams preserves repeated query parameters and provides append, set, delete, and iteration operations.',
  'FormData can represent text and Blob values and is commonly used for multipart form submission.',
  'AbortSignal.timeout can express a time-limited cancellation signal in runtimes that implement the API.',
  'Request and Response bodies are streams and are generally consumable once unless cloned before consumption.',
  'CacheStorage stores Request/Response pairs and is commonly used by service workers for offline strategies.',
  'The Notifications API is permission-controlled and should not be treated as a guaranteed user-interface channel.',
  'The Geolocation API requires user permission and its availability depends on browser policy and environment.',
  'The Web Locks API coordinates named asynchronous resources between same-origin contexts where supported.',
  'Page lifecycle APIs should be used to persist important state before the browser may freeze or discard a page.'
 ],
 security:[
  'Output encoding should match the context where data is inserted, such as HTML, attribute, URL, CSS, or JavaScript contexts.',
  'Allow-list validation is generally safer than trying to enumerate every malicious input form.',
  'Security-sensitive decisions should occur on trusted server components rather than relying on client-side validation.',
  'Cross-origin isolation can enable selected powerful capabilities but changes compatibility requirements for embedded resources.',
  'Origin-Agent-Cluster can request stronger origin-level memory isolation for supported documents.',
  'COOP and COEP policies can work together to establish cross-origin isolation under appropriate deployment conditions.',
  'Permissions should be requested at the point of need and the application should handle denial as a normal state.',
  'Clickjacking defenses can use frame restrictions such as CSP frame-ancestors rather than relying only on client-side checks.',
  'Sensitive responses should use appropriate cache-control directives when intermediary or browser caching would be unsafe.',
  'Security headers should be tested on the actual deployed response path because development servers may differ from production.'
 ],
 node:[
  'Node streams use readable, writable, duplex, and transform abstractions to process data incrementally.',
  'pipeline coordinates stream completion and error propagation and is preferable to manually wiring many close and error listeners.',
  'AbortSignal can integrate cancellation into Node asynchronous APIs that support it.',
  'Node worker_threads execute JavaScript on separate threads and can communicate through message ports or shared memory.',
  'The Node event loop includes multiple phases and asynchronous callbacks should not assume browser-specific scheduling details.',
  'AsyncLocalStorage can carry request-scoped context through asynchronous execution and is useful for correlation identifiers.',
  'Node child processes provide OS process isolation but require explicit handling of stdin, stdout, stderr, exit, and errors.',
  'The filesystem watch APIs can report changes but platform behavior and event coalescing should be treated carefully.',
  'Node URL and WHATWG URL APIs should be preferred over legacy string-based URL parsing.',
  'Graceful Node shutdown should stop accepting new work, finish or cancel in-flight work, and close network and file resources.'
 ],
 testing:[
  'Test doubles should model the contract required by the unit under test rather than duplicating implementation details.',
  'A flaky test is a nondeterministic signal and should be fixed rather than repeatedly retried until it passes.',
  'Concurrency tests benefit from explicit barriers and controllable scheduling points that make interleavings reproducible.',
  'API tests should verify status codes, headers, body schemas, and important failure behavior rather than only successful payloads.',
  'Security regression tests should preserve the exact class of attack input that previously bypassed a boundary.',
  'Performance tests need stable workloads and environmental controls so changes can be attributed to implementation differences.',
  'Tests should assert observable contracts instead of private implementation structure whenever practical.',
  'Mutation testing can expose tests that execute code without actually checking its important behavior.',
  'Property tests are strongest when properties describe invariants independent of one particular generated example.',
  'Test data should include Unicode, empty values, very large values, duplicate keys, and malformed structures when those cases are valid inputs.'
 ],
 architecture:[
  'Pure functions are easier to cache and test because their result depends only on explicit inputs and they do not mutate hidden state.',
  'Dependency injection makes infrastructure replaceable and allows deterministic unit tests without changing business logic.',
  'A repository abstraction can isolate persistence concerns from domain operations when the interface is kept small.',
  'Command handlers should validate input before changing state and should return explicit results or errors.',
  'Read models can be optimized independently when query patterns differ substantially from write patterns.',
  'Event schemas should include versioning or compatibility rules when producers and consumers can be deployed independently.',
  'Backpressure is an architectural property: every unbounded producer-consumer boundary can become a memory risk under load.',
  'Retries should be limited and classified because repeating a permanent failure only increases load and latency.',
  'Fallback behavior should be observable so degraded operation is not mistaken for normal full-quality operation.',
  'Configuration defaults should be safe and explicit, with environment-specific overrides validated before activation.'
 ],
 data:[
  'Map iteration follows insertion order for keys and values, making it predictable for deterministic serialization workflows.',
  'Set iteration follows insertion order while guaranteeing uniqueness under SameValueZero equality.',
  'Array methods such as map, filter, and reduce express transformations but can allocate intermediate arrays for large datasets.',
  'Typed arrays expose numeric views over binary memory and avoid many conversions required by ordinary JavaScript arrays.',
  'BigInt64Array and BigUint64Array provide typed-array views for 64-bit integer values using BigInt semantics.',
  'DataView is appropriate when binary records contain fields with varying widths or endianness.',
  'JSON.parse accepts a JSON text grammar and can invoke a reviver for controlled post-processing of parsed values.',
  'JSON.stringify supports a replacer and spacing argument, allowing filtering and deterministic human-readable formatting.',
  'Structured clone can preserve cycles in supported data graphs while JSON serialization cannot represent cyclic references.',
  'Stable identifiers should be generated independently from display labels when records must survive renaming or localization.'
 ]
};
export const LARGE_JAVASCRIPT_KNOWLEDGE_V42_TEXT=Object.entries(packs).flatMap(([pack,entries])=>entries.map((text,i)=>`[JavaScript v42/${pack}/${i+1}] ${text}`)).join('\n');
export const javascriptKnowledgeV42Stats=()=>({version:'42.0',packs:Object.keys(packs).length,entries:Object.values(packs).reduce((n,x)=>n+x.length,0),characters:LARGE_JAVASCRIPT_KNOWLEDGE_V42_TEXT.length,pretrained:false,authored:true});
if(typeof window!=='undefined')window.TONYLargeJavaScriptKnowledgeV42={LARGE_JAVASCRIPT_KNOWLEDGE_V42_TEXT,javascriptKnowledgeV42Stats};
