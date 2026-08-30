# 🏛️ UOR-R4 System Architecture

This document details the architectural design, data pipelines, and hardware execution model of **UOR-R4 Geometric Cognitive AI**.

---

## 1. High-Level Architectural Pipeline

The UOR-R4 platform operates across three interconnected layers:
1. **The WebGPU Neural Core**: Executes quantized transformer weights on the user's local GPU using WebGPU compute pipelines and ONNX runtime shaders.
2. **The Geometric State Engine (Rust/WASM)**: A high-performance WebAssembly module that binds tokens into 512D Vector Symbolic representations, applies CORDIC Hopf phase rotations, and quantizes activations into 8D Gosset $E_8$ lattices.
3. **The 3D Holographic Rendering Engine**: A GPU-accelerated HTML5 Canvas / WebGL visualization layer rendering dynamic synaptic nodes, engram connections, pulse shockwaves, and live waveform telemetry.

```
+-------------------------------------------------------------------------+
|                           BROWSER CLIENT (100% LOCAL)                   |
|                                                                         |
|  +-----------------------+              +----------------------------+  |
|  |     USER INTERFACE    |              |  3D SYNAPTIC BRAIN MANIFOLD|  |
|  | (Obsidian Chat Theme) |              |  (WebGL / 2D Canvas)       |  |
|  +-----------+-----------+              +-------------^--------------+  |
|              | Prompt Input                           |                 |
|              v                                        | Phase / Lattice |
|  +-----------------------+     Hidden States          | Telemetry       |
|  |  WebGPU NEURAL CORE   | --------------------+      |                 |
|  | (Qwen2.5-1.5B / Llama)|                     |      |                 |
|  +-----------+-----------+                     |      |                 |
|              | Generated Tokens                v      |                 |
|              |                          +-------------+--------------+  |
|              |                          |   UOR-R4 GEOMETRIC WASM    |  |
|              |                          |  - 512D VSA Superposition  |  |
|              |                          |  - CORDIC Hopf Rotations   |  |
|              |                          |  - 8D Gosset E8 Lattice    |  |
|              v                          +----------------------------+  |
|  +-----------------------+                                             |
|  |  STREAMING UI OUTPUT  |                                             |
|  | (Markdown & Code Win) |                                             |
|  +-----------------------+                                             |
+-------------------------------------------------------------------------+
```

---

## 2. In-Browser WebGPU Neural Inference

### Transformers.js & ONNX Runtime Web
UOR-R4 uses `@huggingface/transformers` v3 with custom WebGPU pipeline execution:
* **Quantization**: 4-bit (`q4`) integer weight quantization reduces the 1.5B model footprint to ~850MB while preserving 98%+ of FP16 accuracy.
* **Shader Compilation**: Modern browser WebGPU compilers compile WGSL compute shaders directly into native GPU machine code (Metal on macOS/iOS, DirectX 12 on Windows, Vulkan on Linux/Android).
* **Zero Server Latency**: Token generation proceeds at raw hardware speeds without HTTP round-trip overhead.

---

## 3. Rust WebAssembly Bridge (`src/lib.rs`)

The WebAssembly core is compiled using `wasm-pack` with `wasm-opt -O3` optimization:
* **`DynamicSession`**: Manages the conversational state vector, dynamic vocabulary index, and geometric coordinate tracker.
* **`process_input_dynamic(input, num_tokens)`**:
  1. Computes the 512D Vector Symbolic Architecture (VSA) hypervector.
  2. Applies fixed-point CORDIC rotation to calculate Hopf Euler angles $(\chi, \delta, \alpha)$.
  3. Snaps continuous 8D projections into the nearest discrete $E_8$ Gosset lattice centroid.
  4. Returns JSON telemetry to drive the visualizer synchronously with token generation.

---

## 4. Security & Privacy Model

* **Air-Gapped Privacy**: Prompts and generated text never leave the user's browser tab.
* **No Telemetry Tracking**: Zero analytics, zero third-party tracking scripts.
* **Local Persistence**: Downloaded weights are stored in browser-managed `IndexedDB` storage, encrypted and isolated to the origin domain.
