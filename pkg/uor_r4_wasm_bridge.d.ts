/* tslint:disable */
/* eslint-disable */

export class BrowserTrainingHarness {
    free(): void;
    [Symbol.dispose](): void;
    constructor();
    train_on_corpus(corpus: string, epochs: number, learning_rate_q16: number): string;
}

/**
 * 3-Layer Hierarchical Geometric Engine supporting deep multi-layer abstraction,
 * subword grammar modeling, and multiplier-free cross-layer attention.
 */
export class DynamicSession {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Automatically compiles and trains a rich pre-packaged conversational & technical corpus
     */
    auto_ingest_knowledge_base(vocab_size: number): string;
    /**
     * Evaluates context sensitivity: compares 8D Hopf vector rotation and KL divergence
     * between two perturbed prompt prefixes to prove general attention responsiveness.
     */
    evaluate_sensitivity(prefix_a: string, prefix_b: string): string;
    /**
     * Serializes current dynamic codebook to JSON string.
     */
    export_codebook_json(): string;
    get_vocab_size(): number;
    /**
     * Ingests a raw text corpus, accumulates new vocabulary without wiping existing words, and trains centroids.
     */
    ingest_corpus(corpus: string, epochs: number, learning_rate_q16: number, mode: string, vocab_size: number): string;
    is_byte_mode(): boolean;
    constructor(mode: string, vocab_size: number);
    /**
     * 3-Layer Hierarchical Autoregressive Generation:
     * Layer 1: Lexical subword VSA bundling & CORDIC Hopf phase (chi1, alpha1)
     * Layer 2: Syntactic phrase phase rotation & 2nd E8 manifold projection (chi2, alpha2)
     * Layer 3: Cross-layer attention weighting with Markov transition grammar & repetition penalty
     */
    process_input_dynamic(input: string, num_tokens: number): string;
    reset(): void;
}

export class InteractiveChatSession {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Ingests a new prompt or token string into the active 512D VSA context vector.
     */
    ingest_token(token_str: string): void;
    load_custom_codebook(flat_coords: Int32Array): boolean;
    constructor();
    process_input_run(input: string): string;
    reset(): void;
    /**
     * Scores candidate token strings against the active E8 lattice state.
     * Returns a JSON string representing [f32; N] containing normalized dot-product
     * geometric alignment scores in [-1.0, 1.0].
     */
    score_candidates_json(candidates_json: string): string;
}

export function uor_fast_hadamard_transform(input: Int32Array): Int32Array;

export function uor_matmul(input: Int32Array, weights: Int32Array, rows: number, cols: number): Int32Array;

export function uor_vsa_bind_vectors(vec_a: Int16Array, vec_b: Int16Array): Int16Array;

export function uor_vsa_bundle_vectors(vec_a: Int16Array, vec_b: Int16Array): Int16Array;

export function wasm_bundle_project(html_content: string, css_content: string, js_content: string): string;

export function wasm_calculate_code_stats(code: string): string;

export function wasm_canonical_uor_address(data: string): string;

export function wasm_deterministic_math(expr: string): string;

export function wasm_myers_diff(original: string, modified: string): string;

export function wasm_uor_dot_exact(a: Int32Array, b: Int32Array): bigint;

export function wasm_uor_gemm_mod256(a: Uint8Array, b: Uint8Array, m: number, k: number, n: number): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_browsertrainingharness_free: (a: number, b: number) => void;
    readonly __wbg_dynamicsession_free: (a: number, b: number) => void;
    readonly __wbg_interactivechatsession_free: (a: number, b: number) => void;
    readonly browsertrainingharness_new: () => number;
    readonly browsertrainingharness_train_on_corpus: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly dynamicsession_auto_ingest_knowledge_base: (a: number, b: number) => [number, number];
    readonly dynamicsession_evaluate_sensitivity: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly dynamicsession_export_codebook_json: (a: number) => [number, number];
    readonly dynamicsession_get_vocab_size: (a: number) => number;
    readonly dynamicsession_ingest_corpus: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly dynamicsession_is_byte_mode: (a: number) => number;
    readonly dynamicsession_new: (a: number, b: number, c: number) => number;
    readonly dynamicsession_process_input_dynamic: (a: number, b: number, c: number, d: number) => [number, number];
    readonly dynamicsession_reset: (a: number) => void;
    readonly interactivechatsession_ingest_token: (a: number, b: number, c: number) => void;
    readonly interactivechatsession_load_custom_codebook: (a: number, b: number, c: number) => number;
    readonly interactivechatsession_new: () => number;
    readonly interactivechatsession_process_input_run: (a: number, b: number, c: number) => [number, number];
    readonly interactivechatsession_reset: (a: number) => void;
    readonly interactivechatsession_score_candidates_json: (a: number, b: number, c: number) => [number, number];
    readonly uor_fast_hadamard_transform: (a: number, b: number) => [number, number];
    readonly uor_matmul: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly uor_vsa_bind_vectors: (a: number, b: number, c: number, d: number) => [number, number];
    readonly uor_vsa_bundle_vectors: (a: number, b: number, c: number, d: number) => [number, number];
    readonly wasm_bundle_project: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly wasm_calculate_code_stats: (a: number, b: number) => [number, number];
    readonly wasm_canonical_uor_address: (a: number, b: number) => [number, number];
    readonly wasm_deterministic_math: (a: number, b: number) => [number, number];
    readonly wasm_myers_diff: (a: number, b: number, c: number, d: number) => [number, number];
    readonly wasm_uor_dot_exact: (a: number, b: number, c: number, d: number) => bigint;
    readonly wasm_uor_gemm_mod256: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
