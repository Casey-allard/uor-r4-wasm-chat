# 📚 UOR-R4 API Reference

This document provides the API specifications for the Rust WebAssembly interface and JavaScript bridge.

---

## 1. WebAssembly Interface (`pkg/uor_r4_wasm_bridge.js`)

### `class DynamicSession`

#### `constructor(mode: string, capacity: number)`
Initializes a new dynamic geometric session.
* `mode`: Tokenization mode (`"words"` or `"bytes"`).
* `capacity`: Maximum vocabulary capacity (e.g. `2048`).

#### `ingest_corpus(corpus: string, order: number, prime: number, mode: string, capacity: number): void`
Ingests and indexes textual corpus into 512D hypervectors and discrete $E_8$ semantic passage attractors.

#### `process_input_dynamic(input: string, num_tokens: number): string`
Processes an input string and returns a JSON-serialized geometric telemetry payload:
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

#### `reset(): void`
Resets the session state, clearing accumulated context hypervectors.

---

## 2. JavaScript / WebGPU Integration

### `loadNeuralModel(modelId: string): Promise<void>`
Downloads and initializes the specified model via Transformers.js WebGPU pipeline:
* Supported models:
  * `onnx-community/Qwen2.5-1.5B-Instruct`
  * `onnx-community/Llama-3.2-1B-Instruct`
  * `onnx-community/Qwen2.5-0.5B-Instruct`

### `sendChat(): Promise<void>`
Executes streaming inference and synchronizes live token embeddings with the 3D Synaptic Brain visualizer.
