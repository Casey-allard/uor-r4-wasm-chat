# 📚 UOR-R4 API Reference (v1.0.0)

This document provides the complete API specifications, usage guides, and data structures for the **UOR-R4 Rust WebAssembly Engine** and **JavaScript WebGPU Bridge**.

---

## 1. WebAssembly Interface (`pkg/uor_r4_wasm_bridge.js`)

The Rust WebAssembly core exposes the high-performance geometric computation layer compiled from `src/lib.rs`.

### `class DynamicSession`

The main stateful engine managing 512D Vector Symbolic hypervectors, CORDIC Hopf phase tracking, and 8D Gosset $E_8$ lattice quantization.

#### `constructor(mode: string, capacity: number)`
Initializes a new dynamic geometric session.
* **`mode`**: Tokenization mode (`"words"` or `"bytes"`).
* **`capacity`**: Maximum vocabulary capacity (e.g. `2048`).

```javascript
import init, { DynamicSession } from './pkg/uor_r4_wasm_bridge.js';

await init('./pkg/uor_r4_wasm_bridge_bg.wasm');
const session = new DynamicSession("words", 2048);
```

#### `ingest_corpus(corpus: string, order: number, prime: number, mode: string, capacity: number): void`
Ingests and indexes textual corpus into 512D hypervectors and discrete $E_8$ semantic passage attractors.
* **`corpus`**: Text content string to ingest.
* **`order`**: N-gram order context (e.g., `2`).
* **`prime`**: Hashing modulus prime (e.g., `6553`).
* **`mode`**: `"words"` or `"bytes"`.
* **`capacity`**: Maximum vocabulary entries.

```javascript
session.ingest_corpus("Continuous geometric telemetry for neural inference...", 2, 6553, "words", 2048);
```

#### `process_input_dynamic(input: string, num_tokens: number): string`
Processes an input token string and returns a JSON-serialized geometric telemetry payload:
```typescript
interface GeometricTelemetry {
    snapped: [number, number, number, number, number, number, number, number]; // 8D E8 coordinates
    chi: number;       // Hopf rotation angle χ
    delta: number;     // Hopf rotation angle δ
    alpha: number;     // Hopf rotation angle α
    entropy: number;   // Shannon semantic entropy
    winner: string;    // Nearest semantic concept attractor
    completion: string;// Contextual completion text
}
```

```javascript
const telemetryJson = session.process_input_dynamic("quantum computation", 5);
const telemetry = JSON.parse(telemetryJson);
console.log("E8 Root Coordinate:", telemetry.snapped);
console.log("Hopf Phase (χ, α):", telemetry.chi, telemetry.alpha);
```

#### `reset(): void`
Resets the session state, clearing accumulated context hypervectors and resetting phase angles to initial state.

---

## 2. JavaScript / WebGPU Neural Integration

### `pipeline('text-generation', modelId, options)`
Initializes the in-browser transformer model via Transformers.js v3 on WebGPU.

```javascript
import { pipeline, env, TextStreamer } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true; // Caches weights permanently in IndexedDB

const generator = await pipeline('text-generation', 'onnx-community/Qwen2.5-0.5B-Instruct', {
    dtype: 'q4',
    device: navigator.gpu ? 'webgpu' : 'wasm',
    progress_callback: (progress) => {
        console.log(`Loading model: ${Math.round(progress.progress || 0)}%`);
    }
});
```

### Streaming Chat Generation with ChatML Templates

```javascript
const messages = [
    { role: 'system', content: 'You are UOR-R4, a geometric cognitive AI assistant.' },
    { role: 'user', content: 'Explain Gosset E8 lattice geometry.' }
];

const prompt = generator.tokenizer.apply_chat_template(messages, {
    tokenize: false,
    add_generation_prompt: true,
});

const streamer = new TextStreamer(generator.tokenizer, {
    skip_prompt: true,
    callback_function: (chunk) => {
        process.stdout.write(chunk);
        // Synchronously rotate E8 coordinates in WASM
        const telemetry = JSON.parse(session.process_input_dynamic(chunk, 1));
    }
});

await generator(prompt, {
    max_new_tokens: 1024,
    temperature: 0.6,
    top_p: 0.9,
    repetition_penalty: 1.15,
    do_sample: true,
    streamer: streamer
});
```

---

## 🤝 Credits & Dependencies

* **[Qwen 2.5](https://github.com/QwenLM/Qwen2.5)** by Alibaba Cloud (Apache 2.0).
* **[Transformers.js](https://github.com/huggingface/transformers.js)** by Hugging Face (Apache 2.0).
* **[ONNX Runtime Web](https://github.com/microsoft/onnxruntime)** by Microsoft (MIT).
* **[wasm-bindgen](https://github.com/rustwasm/wasm-bindgen)** by the Rust / WebAssembly Community (MIT / Apache 2.0).
* **[Kani Rust Verifier](https://github.com/model-checking/kani)** by Amazon Web Services (Apache 2.0 / MIT).
