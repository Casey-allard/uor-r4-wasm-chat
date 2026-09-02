/* @ts-self-types="./uor_r4_wasm_bridge.d.ts" */

export class BrowserTrainingHarness {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BrowserTrainingHarnessFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_browsertrainingharness_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.browsertrainingharness_new();
        this.__wbg_ptr = ret;
        BrowserTrainingHarnessFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {string} corpus
     * @param {number} epochs
     * @param {number} learning_rate_q16
     * @returns {string}
     */
    train_on_corpus(corpus, epochs, learning_rate_q16) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passStringToWasm0(corpus, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.browsertrainingharness_train_on_corpus(this.__wbg_ptr, ptr0, len0, epochs, learning_rate_q16);
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
}
if (Symbol.dispose) BrowserTrainingHarness.prototype[Symbol.dispose] = BrowserTrainingHarness.prototype.free;

/**
 * 3-Layer Hierarchical Geometric Engine supporting deep multi-layer abstraction,
 * subword grammar modeling, and multiplier-free cross-layer attention.
 */
export class DynamicSession {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DynamicSessionFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dynamicsession_free(ptr, 0);
    }
    /**
     * Automatically compiles and trains a rich pre-packaged conversational & technical corpus
     * @param {number} vocab_size
     * @returns {string}
     */
    auto_ingest_knowledge_base(vocab_size) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.dynamicsession_auto_ingest_knowledge_base(this.__wbg_ptr, vocab_size);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Evaluates context sensitivity: compares 8D Hopf vector rotation and KL divergence
     * between two perturbed prompt prefixes to prove general attention responsiveness.
     * @param {string} prefix_a
     * @param {string} prefix_b
     * @returns {string}
     */
    evaluate_sensitivity(prefix_a, prefix_b) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(prefix_a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(prefix_b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.dynamicsession_evaluate_sensitivity(this.__wbg_ptr, ptr0, len0, ptr1, len1);
            deferred3_0 = ret[0];
            deferred3_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * Serializes current dynamic codebook to JSON string.
     * @returns {string}
     */
    export_codebook_json() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.dynamicsession_export_codebook_json(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    get_vocab_size() {
        const ret = wasm.dynamicsession_get_vocab_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Ingests a raw text corpus, accumulates new vocabulary without wiping existing words, and trains centroids.
     * @param {string} corpus
     * @param {number} epochs
     * @param {number} learning_rate_q16
     * @param {string} mode
     * @param {number} vocab_size
     * @returns {string}
     */
    ingest_corpus(corpus, epochs, learning_rate_q16, mode, vocab_size) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(corpus, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.dynamicsession_ingest_corpus(this.__wbg_ptr, ptr0, len0, epochs, learning_rate_q16, ptr1, len1, vocab_size);
            deferred3_0 = ret[0];
            deferred3_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @returns {boolean}
     */
    is_byte_mode() {
        const ret = wasm.dynamicsession_is_byte_mode(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {string} mode
     * @param {number} vocab_size
     */
    constructor(mode, vocab_size) {
        const ptr0 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.dynamicsession_new(ptr0, len0, vocab_size);
        this.__wbg_ptr = ret;
        DynamicSessionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * 3-Layer Hierarchical Autoregressive Generation:
     * Layer 1: Lexical subword VSA bundling & CORDIC Hopf phase (chi1, alpha1)
     * Layer 2: Syntactic phrase phase rotation & 2nd E8 manifold projection (chi2, alpha2)
     * Layer 3: Cross-layer attention weighting with Markov transition grammar & repetition penalty
     * @param {string} input
     * @param {number} num_tokens
     * @returns {string}
     */
    process_input_dynamic(input, num_tokens) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.dynamicsession_process_input_dynamic(this.__wbg_ptr, ptr0, len0, num_tokens);
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    reset() {
        wasm.dynamicsession_reset(this.__wbg_ptr);
    }
}
if (Symbol.dispose) DynamicSession.prototype[Symbol.dispose] = DynamicSession.prototype.free;

export class InteractiveChatSession {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        InteractiveChatSessionFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_interactivechatsession_free(ptr, 0);
    }
    /**
     * Ingests a new prompt or token string into the active 512D VSA context vector.
     * @param {string} token_str
     */
    ingest_token(token_str) {
        const ptr0 = passStringToWasm0(token_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.interactivechatsession_ingest_token(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Int32Array} flat_coords
     * @returns {boolean}
     */
    load_custom_codebook(flat_coords) {
        const ptr0 = passArray32ToWasm0(flat_coords, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.interactivechatsession_load_custom_codebook(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    constructor() {
        const ret = wasm.interactivechatsession_new();
        this.__wbg_ptr = ret;
        InteractiveChatSessionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {string} input
     * @returns {string}
     */
    process_input_run(input) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.interactivechatsession_process_input_run(this.__wbg_ptr, ptr0, len0);
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    reset() {
        wasm.interactivechatsession_reset(this.__wbg_ptr);
    }
    /**
     * Scores candidate token strings against the active E8 lattice state.
     * Returns a JSON string representing [f32; N] containing normalized dot-product
     * geometric alignment scores in [-1.0, 1.0].
     * @param {string} candidates_json
     * @returns {string}
     */
    score_candidates_json(candidates_json) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passStringToWasm0(candidates_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.interactivechatsession_score_candidates_json(this.__wbg_ptr, ptr0, len0);
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
}
if (Symbol.dispose) InteractiveChatSession.prototype[Symbol.dispose] = InteractiveChatSession.prototype.free;

/**
 * @param {string} html_content
 * @param {string} css_content
 * @param {string} js_content
 * @returns {string}
 */
export function wasm_bundle_project(html_content, css_content, js_content) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(html_content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(css_content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(js_content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.wasm_bundle_project(ptr0, len0, ptr1, len1, ptr2, len2);
        deferred4_0 = ret[0];
        deferred4_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * @param {string} code
 * @returns {string}
 */
export function wasm_calculate_code_stats(code) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(code, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasm_calculate_code_stats(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} data
 * @returns {string}
 */
export function wasm_canonical_uor_address(data) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(data, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasm_canonical_uor_address(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} expr
 * @returns {string}
 */
export function wasm_deterministic_math(expr) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(expr, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasm_deterministic_math(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} original
 * @param {string} modified
 * @returns {string}
 */
export function wasm_myers_diff(original, modified) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(original, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(modified, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasm_myers_diff(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_bb96b2010945f0bc: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./uor_r4_wasm_bridge_bg.js": import0,
    };
}

const BrowserTrainingHarnessFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_browsertrainingharness_free(ptr, 1));
const DynamicSessionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_dynamicsession_free(ptr, 1));
const InteractiveChatSessionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_interactivechatsession_free(ptr, 1));

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('uor_r4_wasm_bridge_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
