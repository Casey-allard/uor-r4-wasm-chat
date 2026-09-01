# 📚 UOR-R4 API Reference (v3.0.0)

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

const MODEL_INFO = {
    'qwen2.5-0.5b': 'onnx-community/Qwen2.5-0.5B-Instruct',
    'gemma4-flash': 'onnx-community/gemma-2-2b-it',
    'qwen3.8-flash': 'onnx-community/Qwen2.5-Coder-0.5B-Instruct',
    'glm5.3-flash': 'onnx-community/Qwen2.5-1.5B-Instruct'
};

const generator = await pipeline('text-generation', MODEL_INFO['glm5.3-flash'], {
    dtype: 'q4',
    device: navigator.gpu ? 'webgpu' : 'wasm',
    progress_callback: (progress) => {
        console.log(`Loading model: ${Math.round(progress.progress || 0)}%`);
    }
});
```

### Streaming Chat Generation with Telemetry Speed Tracking

```javascript
const messages = [
    { role: 'system', content: 'You are UOR-R4, a geometric cognitive AI assistant.' },
    { role: 'user', content: 'Explain Gosset E8 lattice geometry.' }
];

let generatedTokenCount = 0;
const genStartTime = performance.now();

const streamer = new TextStreamer(generator.tokenizer, {
    skip_prompt: true,
    callback_function: (chunk) => {
        generatedTokenCount++;
        const elapsedSec = (performance.now() - genStartTime) / 1000;
        const liveTps = (generatedTokenCount / elapsedSec).toFixed(1);
        console.log(`Live Speed: ${liveTps} tok/s`);

        // Synchronously rotate E8 coordinates in WASM
        const telemetry = JSON.parse(session.process_input_dynamic(chunk, 1));
    }
});

await generator(messages, {
    max_new_tokens: 512,
    do_sample: false,
    streamer: streamer
});
```

---

## 3. OpenAI-Compatible REST API (`server/app.py`)

The FastAPI server exposes standard OpenAI REST endpoints allowing integration with external tools, harnesses (Hermes, LangChain, AutoGen, CrewAI), and IDEs (Cursor, Continue.dev, Cline).

### `GET /v1/models`
Returns the list of available substrate models.

#### Response Example:
```json
{
  "object": "list",
  "data": [
    {
      "id": "glm5.3-flash",
      "object": "model",
      "created": 1700000000,
      "owned_by": "uor-r4"
    },
    {
      "id": "qwen2.5-0.5b",
      "object": "model",
      "created": 1700000000,
      "owned_by": "uor-r4"
    }
  ]
}
```

### `POST /v1/chat/completions`
Executes chat completions in either standard JSON or Server-Sent Events (SSE) streaming mode.

#### Request Parameters:
* **`model`** *(string)*: Model ID (e.g. `"glm5.3-flash"`, `"qwen2.5-0.5b"`).
* **`messages`** *(array)*: Array of message objects `[{"role": "user", "content": "..."}]`.
* **`temperature`** *(float, default: 0.35)*: Softmax sampling temperature.
* **`top_p`** *(float, default: 0.85)*: Nucleus sampling probability.
* **`max_tokens`** *(int, default: 1024)*: Maximum generation budget.
* **`stream`** *(bool, default: false)*: Set to `true` for SSE token streaming.

#### Streaming SSE Chunk Example:
```text
data: {"id":"chatcmpl-1725060000","object":"chat.completion.chunk","created":1725060000,"model":"glm5.3-flash","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: [DONE]
```

---

## 4. Hermes Agent Harness (`harness/uor_hermes_harness.py`)

The client harness implements multi-turn agentic tool calling over the OpenAI-compatible endpoint.

```python
from harness.uor_hermes_harness import run_agent_loop

# Run multi-turn autonomous reasoning loop with tool execution
run_agent_loop(
    prompt="Calculate 2^32 and summarize the project architecture.",
    api_base="http://localhost:8000/v1",
    model="glm5.3-flash"
)
```

---

## 🤝 Credits & Dependencies

* **[UOR Foundation](https://github.com/uor-foundation)**: Architectural standard for Universal Object Representation, 512D Vector Symbolic hyperdimensional memory, and sovereign geometric AI.
* **HELM Geometric Attention Group**: High-dimensional geometric attention mechanics and non-Euclidean manifold routing.
* **The Authors of Goldworm (`goldworm`)**: Byte-level modular codebooks and streaming token compression.
* **`w33`**: Discrete topology and high-performance symbolic computation research.
* **Nemesis Theory Mathematics**: Algebraic field structures and discrete $E_8$ Gosset root lattice dynamics.
* **Hologram**: Holographic memory projection and real-time neural manifold visualization.
* **[Alibaba Cloud / Qwen Team](https://github.com/QwenLM/Qwen2.5)** & **[Google Gemma Team](https://ai.google.dev/gemma)** (Apache 2.0).
* **[Transformers.js](https://github.com/huggingface/transformers.js)** by Hugging Face (Apache 2.0).
* **[ONNX Runtime Web](https://github.com/microsoft/onnxruntime)** by Microsoft (MIT).
* **[wasm-bindgen](https://github.com/rustwasm/wasm-bindgen)** by the Rust / WebAssembly Community (MIT / Apache 2.0).
* **[Kani Rust Verifier](https://github.com/model-checking/kani)** by Amazon Web Services (Apache 2.0 / MIT).
