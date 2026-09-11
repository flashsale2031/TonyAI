// Expanded, original training seed for Tony TransformerLM.
// Add properly licensed datasets externally for serious pretraining; do not represent this seed as frontier-scale data.
export const TRANSFORMER_TRAINING_DATA=[
'Language models learn statistical structure from sequences of tokens and use learned parameters to predict useful continuations.',
'Programming requires precise syntax, clear abstractions, testing, debugging, and careful handling of errors and state.',
'JavaScript runs in browsers and servers and provides APIs for documents, networking, files, storage, workers, and user interaction.',
'A database organizes persistent information and supports queries, updates, indexes, transactions, and consistency guarantees.',
'An algorithm is a finite procedure for transforming inputs into outputs. Good algorithms balance correctness, complexity, memory use, and maintainability.',
'Computer networks move data between systems using layered protocols. HTTP provides a request and response protocol commonly used by web applications.',
'Machine learning trains parameters from examples. A validation set helps estimate whether a model generalizes beyond examples used during optimization.',
'A transformer processes a sequence with causal self attention and feed forward transformations. Decoder-only language models predict the next token given earlier tokens.',
'Attention assigns different weights to contextual positions. Multiple attention heads allow a model to represent different relationships in the same sequence.',
'Optimization minimizes a loss function by adjusting parameters. Learning rate, batch size, regularization, initialization, and data quality all affect training.',
'Mathematics provides tools for reasoning about quantities, uncertainty, structure, optimization, and algorithms. Definitions and assumptions should be stated clearly.',
'A reliable assistant should separate observations from assumptions, explain uncertainty, verify calculations, and avoid inventing evidence.',
'When solving a difficult problem, first understand the goal and constraints, then decompose the task, select tools, execute steps, and evaluate the result.',
'Good technical writing is explicit about interfaces, inputs, outputs, failure modes, invariants, and examples.',
'Web applications benefit from progressive enhancement, responsive layouts, accessible controls, secure input handling, and efficient network usage.',
'Concurrency allows independent work to overlap, while synchronization is needed when multiple operations share mutable state.',
'Caching can reduce latency and repeated work, but invalidation and consistency are important design concerns.',
'Observability combines logs, metrics, traces, and structured diagnostics to make production systems easier to understand.',
'Privacy means limiting collection and exposure of information and giving people appropriate control over their data.',
'Security engineering uses defense in depth, least privilege, secure defaults, validation, auditing, and careful treatment of credentials and secrets.',
'An API should have a stable contract, predictable errors, explicit authentication requirements, and documentation that matches actual behavior.',
'Code review is more effective when reviewers focus on correctness, security, maintainability, performance, tests, and compatibility rather than superficial style.',
'Experiments should define a measurable hypothesis, isolate variables when practical, record results, and distinguish correlation from causation.',
'Research combines retrieval, source evaluation, synthesis, and uncertainty. A search result is evidence to inspect, not automatically a fact.',
'Planning is useful when a task has dependencies or multiple outcomes. A good plan identifies milestones, risks, and a way to verify completion.'
];
export const TRANSFORMER_TRAINING_TEXT=TRANSFORMER_TRAINING_DATA.join(' ');
