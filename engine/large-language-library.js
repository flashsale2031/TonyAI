// TONY LargeLM Knowledge Library v1.
// Original, dependency-free local corpus and reasoning patterns.
// This is a larger executable knowledge library, not a pretrained neural checkpoint.

const packs={
 general:[
  'A strong answer identifies the task, constraints, assumptions, evidence, and desired output before choosing a method.',
  'When information is uncertain, state what is known, what is inferred, and what would verify the claim.',
  'Complex tasks become easier when decomposed into independent steps with explicit inputs, outputs, and checks.',
  'Examples are useful because they expose edge cases, interfaces, and the expected shape of a solution.',
  'A useful assistant should prefer precise language, reversible actions, and transparent failure handling.',
  'When several solutions work, compare them using correctness, complexity, reliability, maintainability, and cost.',
  'A good explanation starts with the simplest accurate mental model and adds implementation detail as needed.',
  'Feedback can improve a local system by recording successful patterns, weak answers, and repeated user intent.',
  'State should be persisted only when it is useful, bounded, and safe to restore.',
  'Deterministic tools are preferable to generative guessing for arithmetic, parsing, formatting, and validation.'
 ],
 javascript:[
  'JavaScript uses lexical scope, closures, prototypes, objects, modules, promises, and an event loop.',
  'An async function returns a promise and await pauses that function until the awaited promise settles.',
  'ES modules use import and export to create explicit dependency boundaries between files.',
  'The browser provides DOM, Fetch, Storage, Workers, Web Streams, Canvas, Web Audio, and WebGPU APIs.',
  'Node.js provides server-side JavaScript with filesystem, networking, process, streams, and worker APIs.',
  'Avoid blocking the main browser thread with large computations; workers can isolate CPU-heavy work.',
  'Input validation should occur at boundaries and should not rely on client-side checks alone for security.',
  'AbortController can cancel fetch requests and other abort-aware asynchronous operations.',
  'Structured cloning is useful for transferring many ordinary JavaScript data structures between workers.',
  'A robust JavaScript module should expose a small API, validate arguments, and return predictable errors.'
 ],
 web:[
  'HTTP clients send requests containing a method, URL, headers, and sometimes a body; servers return status, headers, and content.',
  'Caching improves performance but requires a deliberate invalidation strategy and appropriate cache-control semantics.',
  'Responsive interfaces adapt layout, controls, and typography to viewport size and input method.',
  'Accessible interfaces use semantic HTML, labels, keyboard navigation, focus management, and sufficient contrast.',
  'Progressive enhancement keeps core behavior available before optional JavaScript features initialize.',
  'Web workers move JavaScript execution away from the main UI thread and communicate with messages.',
  'Service workers can cache assets and intercept network requests for offline-capable web applications.',
  'Content Security Policy can reduce the impact of some classes of injection by restricting executable sources.',
  'Same-origin policy limits how documents and scripts interact across origins; explicit mechanisms are needed for controlled sharing.',
  'A web application should handle loading, success, empty, error, retry, and offline states explicitly.'
 ],
 ai:[
  'A language model maps token sequences to probability distributions over possible next tokens.',
  'Tokenization converts text into units that a model can represent numerically; subword tokenization balances vocabulary size and coverage.',
  'A decoder-only transformer applies causal attention so each position can use earlier context without seeing future tokens.',
  'Temperature changes the sharpness of sampling while top-k or nucleus sampling limits candidate tokens.',
  'Retrieval can supply relevant local documents so a smaller generator does not need every fact encoded in parameters.',
  'Mixture-of-experts systems route inputs toward specialized components instead of applying every expert equally.',
  'Evaluation should use representative test cases and metrics appropriate to the intended task.',
  'A model can be useful without being a general pretrained neural network when deterministic tools and retrieval cover important workflows.',
  'Training data quality, diversity, licensing, deduplication, and evaluation are as important as model architecture.',
  'A local inference system should expose whether an answer came from deterministic code, retrieval, a statistical model, or a neural model.'
 ],
 algorithms:[
  'Binary search repeatedly halves a sorted search interval and runs in logarithmic time.',
  'Hash tables provide expected constant-time lookup when hashing and collision handling are well behaved.',
  'Breadth-first search explores a graph by distance layers and finds shortest unweighted paths.',
  'Depth-first search is useful for reachability, traversal, cycle analysis, and many recursive graph algorithms.',
  'Dynamic programming stores solutions to overlapping subproblems so they do not need to be recomputed.',
  'Greedy algorithms make locally optimal choices and require a proof that those choices lead to a global optimum.',
  'A stable sorting algorithm preserves the relative order of equal keys.',
  'Big O notation describes asymptotic growth and should be considered alongside constants and actual workload characteristics.',
  'Amortized analysis explains why a sequence of operations can be efficient even when individual operations occasionally cost more.',
  'A correct algorithm needs explicit treatment of empty inputs, duplicates, overflow, invalid values, and boundary conditions.'
 ],
 databases:[
  'A database index accelerates lookup by maintaining an additional structure whose cost is paid during writes and storage.',
  'Transactions group operations so a database can preserve defined consistency guarantees across failures.',
  'Normalization can reduce redundant data, while deliberate denormalization can improve read performance in selected workloads.',
  'A primary key identifies rows and should be stable, unique, and appropriately indexed.',
  'A query planner chooses an execution strategy using statistics, indexes, joins, filters, and cost estimates.',
  'Pagination should use stable ordering; cursor pagination can avoid some problems caused by large offsets.',
  'Connection pooling reuses database connections and prevents each request from paying connection setup cost.',
  'Schema migrations should be versioned, observable, reversible where practical, and safe for rolling deployments.',
  'Constraints such as unique, foreign-key, and check constraints move important invariants closer to the data.',
  'Prepared statements separate query structure from values and reduce injection risk.'
 ],
 security:[
  'Least privilege grants only the permissions required for a task and limits the blast radius of mistakes.',
  'Secrets should not be committed to source repositories, logs, client bundles, or error messages.',
  'Authentication establishes identity while authorization determines what an authenticated identity may do.',
  'Defense in depth uses multiple independent controls rather than trusting a single protective mechanism.',
  'Output encoding and context-aware escaping help prevent injection when untrusted data reaches interpreters or markup.',
  'Rate limiting can reduce abuse and protect expensive endpoints from accidental or malicious overload.',
  'Audit logs should capture important security events without unnecessarily recording sensitive payloads.',
  'Threat modeling identifies assets, trust boundaries, adversaries, attack paths, and mitigations before implementation.',
  'Security controls should fail safely and should not expose credentials or private data through diagnostics.',
  'Software dependencies should be pinned or constrained, reviewed, updated, and scanned for known vulnerabilities.'
 ],
 mathematics:[
  'A function maps inputs to outputs according to a defined rule; its domain and codomain are part of the definition.',
  'Probability quantifies uncertainty and requires a sample space and event interpretation appropriate to the problem.',
  'A mean summarizes values but can be strongly affected by outliers; median and quantiles provide robust alternatives.',
  'Correlation measures association and does not by itself establish causation.',
  'A derivative describes local rate of change and is central to optimization and continuous modeling.',
  'A matrix represents a linear transformation or organized numeric data depending on context.',
  'Numerical algorithms should consider precision, stability, convergence, and the scale of inputs.',
  'A confidence interval describes uncertainty under a statistical procedure; it is not simply a probability statement about a fixed parameter.',
  'Optimization problems require an objective, variables, constraints, and a definition of acceptable solutions.',
  'Dimensional analysis can catch equations that combine incompatible physical units.'
 ],
 science:[
  'A scientific hypothesis should make a claim that can be compared with observations or experiments.',
  'Controlled experiments isolate variables where practical and define a measurable outcome before collecting results.',
  'Reproducibility improves confidence by allowing independent repetition using sufficiently documented procedures.',
  'Models are abstractions that are useful when their assumptions and domains of validity are understood.',
  'Measurement uncertainty should be reported when it materially affects interpretation.',
  'A simulation is evidence about a model, not automatically evidence that the modeled system behaves exactly the same way.',
  'Scientific conclusions should distinguish direct observations from interpretation and extrapolation.',
  'Independent variables are changed or categorized while dependent variables are measured as outcomes.',
  'A control condition provides a comparison that helps isolate the effect of an intervention.',
  'Peer review can improve scientific communication but does not guarantee that every published claim is correct.'
 ],
 data:[
  'Data pipelines commonly extract records, validate them, transform representations, and load results into a destination.',
  'Missing values should be represented deliberately rather than silently converted into misleading defaults.',
  'Outliers should be investigated before being removed because they can represent either errors or important events.',
  'A schema describes fields, types, constraints, relationships, and sometimes semantic definitions.',
  'Aggregation reduces many records into summaries such as counts, sums, means, rates, and percentiles.',
  'Joins combine related datasets and require a clear definition of matching keys and duplicate behavior.',
  'Data validation checks ranges, formats, uniqueness, referential relationships, and required fields.',
  'Sampling can reduce processing cost but introduces uncertainty and possible selection bias.',
  'A reproducible analysis records its source data, transformations, parameters, and software assumptions.',
  'Metrics should be defined precisely enough that two implementations produce comparable results.'
 ],
 software:[
  'Good software architecture separates responsibilities while keeping interfaces simple and explicit.',
  'A module boundary is valuable when it localizes change and makes dependencies understandable.',
  'Tests should cover expected behavior, important edge cases, and failure modes rather than only happy paths.',
  'Refactoring changes internal structure without intentionally changing externally observable behavior.',
  'Idempotent operations can be repeated without producing unintended additional effects.',
  'Retries require care because a failed request may have partially completed its side effect.',
  'Feature flags can decouple deployment from release but should be removed when their temporary purpose ends.',
  'Observability combines logs, metrics, traces, and context so failures can be diagnosed from production evidence.',
  'Backpressure prevents a fast producer from overwhelming a slower consumer.',
  'Graceful degradation keeps useful core behavior available when optional dependencies fail.'
 ],
 testing:[
  'Unit tests isolate a small component while integration tests verify interactions between components.',
  'Property-based testing checks general invariants across many generated inputs instead of relying only on examples.',
  'A regression test records a previously broken behavior so future changes do not silently reintroduce it.',
  'Mocks are useful for controlling boundaries but excessive mocking can make tests reflect implementation details.',
  'A flaky test is a reliability problem because it weakens trust in the test suite.',
  'Boundary tests should include empty collections, maximum values, malformed input, duplicate data, and unexpected ordering.',
  'Performance tests should use representative workloads and distinguish warm-up effects from steady-state behavior.',
  'Security tests should validate both accepted behavior and rejection of malformed or unauthorized inputs.',
  'Test names should describe behavior and expected outcome rather than internal method names.',
  'Continuous integration should run deterministic checks before expensive or environment-dependent suites.'
 ],
 networks:[
  'TCP provides reliable ordered byte streams while UDP provides datagrams without the same delivery guarantees.',
  'DNS maps names to records and can involve caching at several layers.',
  'TLS protects data in transit and authenticates endpoints using certificates and cryptographic protocols.',
  'HTTP/2 multiplexes streams over a connection and improves transport efficiency for many web workloads.',
  'HTTP/3 uses QUIC over UDP and provides stream multiplexing with transport-level improvements.',
  'A timeout bounds how long a client waits and should be chosen according to the operation and failure mode.',
  'Circuit breakers can stop repeated calls to a failing dependency and allow recovery probes later.',
  'Retries should use bounded attempts, backoff, and jitter to avoid synchronized overload.',
  'A load balancer distributes traffic among backend instances according to a routing strategy.',
  'Network failures can be partial, delayed, duplicated, or reordered, so distributed systems should not assume a perfect connection.'
 ],
 architecture:[
  'A monolith can be a sound architecture when its boundaries are clear and operational complexity matters more than independent deployment.',
  'Microservices trade deployment independence for distributed-system complexity, networking, observability, and data coordination.',
  'Event-driven architecture communicates state changes through events and can decouple producers from consumers.',
  'Queues provide buffering and asynchronous work execution but require delivery, ordering, retry, and dead-letter policies.',
  'A cache-aside design loads missing values from a source and then populates a cache for later reads.',
  'Horizontal scaling adds instances while vertical scaling increases resources available to an instance.',
  'Stateless services are easier to scale because request handling does not depend on local session state.',
  'Consistency and availability choices should follow actual product requirements rather than architecture fashion.',
  'A system boundary should have an explicit contract, ownership, monitoring, and failure behavior.',
  'Architecture decisions should record context and tradeoffs so later engineers understand why a choice was made.'
 ],
 product:[
  'Product requirements should describe the user problem, desired outcome, constraints, acceptance criteria, and non-goals.',
  'A useful MVP tests the riskiest assumptions with the smallest credible implementation.',
  'User experience includes discoverability, feedback, latency, accessibility, error recovery, and consistency.',
  'Telemetry should measure outcomes that matter to users rather than maximizing the number of tracked events.',
  'A product roadmap should balance user value, technical risk, dependencies, maintenance, and available capacity.',
  'A clear information hierarchy helps users understand what is primary, secondary, and optional.',
  'Progress indicators should communicate meaningful state without implying precision the system cannot provide.',
  'Destructive actions should be explicit and, where appropriate, reversible or confirmable.',
  'Good defaults reduce decision load while preserving user control over important behavior.',
  'Product experiments need success metrics and guardrails so local gains do not hide broader regressions.'
 ],
 writing:[
  'Clear writing puts the main point near the beginning and gives supporting detail in a logical order.',
  'Technical prose should define unfamiliar terms before relying on them repeatedly.',
  'A concise rewrite removes repetition while preserving meaning, constraints, and important qualifications.',
  'Headings and lists help readers scan complex material and locate decisions quickly.',
  'Examples should be representative and should not accidentally imply guarantees that the text does not support.',
  'Tone should match the audience, purpose, and stakes of the communication.',
  'An effective explanation moves from concept to mechanism to example to edge case when detail is needed.',
  'A good summary preserves the central claim, important evidence, decisions, and unresolved questions.',
  'Editing should check correctness and structure before optimizing individual sentences.',
  'Ambiguous pronouns and overloaded sentences can hide dependencies and should be clarified.'
 ],
 research:[
  'Research starts by turning a broad question into specific claims that can be investigated.',
  'A primary source provides direct evidence about an event, dataset, experiment, or original claim when available.',
  'Search results are leads and should be inspected for provenance, date, methodology, and context.',
  'Conflicting sources should be compared rather than silently selecting the convenient conclusion.',
  'A research synthesis separates established facts, plausible interpretations, and unresolved uncertainty.',
  'Current information requires checking publication or update dates because facts can change over time.',
  'A citation should support the exact claim it follows rather than merely being related to the topic.',
  'Evidence quality depends on relevance, authority, methodology, transparency, and independence.',
  'Research notes should preserve enough context that another person can understand how a conclusion was reached.',
  'When evidence is insufficient, the correct result can be a bounded uncertainty statement rather than a guessed answer.'
 ],
 planning:[
  'A plan identifies the objective, current state, constraints, dependencies, sequence, risks, and completion criteria.',
  'Milestones should represent observable progress rather than vague intentions.',
  'Risk management is stronger when each major risk has an owner, trigger, mitigation, and fallback.',
  'Dependencies should be ordered so blocked work is not mistaken for active progress.',
  'A reversible decision can often be made with less evidence than an expensive irreversible decision.',
  'Execution plans should include verification steps after changes are applied.',
  'A critical path identifies tasks that directly constrain completion time.',
  'Small increments make debugging easier because fewer changes are mixed together.',
  'A post-task review should compare expected and actual outcomes and record reusable lessons.',
  'Good plans adapt when new evidence changes assumptions; flexibility is part of planning, not failure.'
 ],
 privacy:[
  'Data minimization means collecting and retaining only information needed for a defined purpose.',
  'Privacy-aware systems explain what information is used, why it is needed, and how long it is retained.',
  'Access controls should restrict private data by role, purpose, and need rather than convenience.',
  'Logs should avoid unnecessary personal information and should apply appropriate retention policies.',
  'Local processing can reduce transmission of sensitive data when the local implementation is sufficiently capable.',
  'Anonymization and pseudonymization have different properties and should not be treated as interchangeable guarantees.',
  'Privacy reviews should consider collection, processing, sharing, storage, deletion, and recovery paths.',
  'User-visible privacy controls should correspond to real system behavior rather than cosmetic switches.',
  'Backups are part of data retention because deleted primary records can persist in backup systems.',
  'Privacy and security overlap but are distinct: a system can be secure while still collecting more data than necessary.'
 ],
 devops:[
  'Continuous integration validates changes automatically before they reach shared environments.',
  'Continuous delivery keeps software in a releasable state while deployment can remain a controlled decision.',
  'Immutable build artifacts make deployments more reproducible because the deployed object is not rebuilt differently later.',
  'Health checks should distinguish process liveness from readiness to serve useful traffic.',
  'Blue-green deployments maintain two environments and shift traffic between them to reduce deployment risk.',
  'Canary releases expose a small fraction of traffic to a new version before broader rollout.',
  'Infrastructure as code expresses environment configuration declaratively and enables reviewable changes.',
  'Runbooks turn operational knowledge into repeatable procedures for common incidents.',
  'Incident response should stabilize the system first, then diagnose root causes and document follow-up actions.',
  'Post-incident reviews should focus on system improvements rather than blame.'
 ],
 concurrency:[
  'A race condition occurs when correctness depends on timing between concurrent operations.',
  'A mutex provides mutual exclusion so only one protected operation executes at a time.',
  'Deadlock can occur when concurrent actors wait indefinitely for resources held by each other.',
  'Atomic operations appear indivisible to observers and can simplify synchronization for specific state changes.',
  'Message passing can reduce shared mutable state and make ownership of data more explicit.',
  'Backpressure is necessary when producers can generate work faster than consumers can process it.',
  'A worker pool bounds concurrency and prevents unlimited task creation from exhausting resources.',
  'Cancellation should propagate through nested asynchronous work so abandoned operations do not continue indefinitely.',
  'Idempotency keys allow clients to retry certain operations without creating duplicate effects.',
  'Concurrency bugs often disappear under debugging and require deterministic tests or instrumentation to reproduce.'
 ],
 graphics:[
  'Raster graphics represent images as discrete pixels while vector graphics represent geometry and can be scaled analytically.',
  'A color can be represented in RGB, HSV, HSL, or other spaces chosen for a particular operation.',
  'Nearest-neighbor scaling preserves hard pixel edges and is useful for pixel art.',
  'Dithering approximates colors with patterns when a limited palette is available.',
  'A framebuffer is a memory representation of pixels that can be transformed before display or encoding.',
  'Alpha compositing combines foreground and background using an opacity value.',
  'A procedural renderer can construct images from deterministic primitives without a pretrained image model.',
  'Noise functions can provide controlled variation for terrain, clouds, textures, and other synthetic imagery.',
  'Animation can be modeled as frames or a timeline of parameter changes sampled at a chosen rate.',
  'Image pipelines should separate generation, composition, encoding, caching, and display when those responsibilities differ.'
 ]
};

export const LARGE_LIBRARY_PACKS=packs;
export const LARGE_LIBRARY_TEXT=Object.values(packs).flat().join(' ');
export const LARGE_LIBRARY_SIZE=Object.values(packs).reduce((n,a)=>n+a.length,0);
export const LARGE_LIBRARY_DOMAINS=Object.keys(packs);

export function libraryFor(question,limit=12){
 const q=String(question??'').toLowerCase();
 const scored=Object.entries(packs).map(([domain,items])=>({domain,score:(q.match(new RegExp(domain,'i'))?3:0)+items.reduce((s,x)=>s+(x.toLowerCase().split(/\W+/).filter(Boolean).some(w=>q.includes(w))?.03:0),0),items}));
 scored.sort((a,b)=>b.score-a.score);
 return scored.flatMap(x=>x.items.map(text=>({role:`library:${x.domain}`,text,score:x.score}))).slice(0,limit);
}

export function libraryStats(){return{version:'1.0',domains:LARGE_LIBRARY_DOMAINS.length,entries:LARGE_LIBRARY_SIZE,characters:LARGE_LIBRARY_TEXT.length,local:true,neuralWeightsIncluded:false};}
