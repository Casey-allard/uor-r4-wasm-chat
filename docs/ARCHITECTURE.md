# 🏛️ UOR-R4 System Architecture (v3.0.0)

This document details the architectural design, data pipelines, memory model, and hardware execution layers of **UOR-R4 Geometric Cognitive AI**.

---

## 🧬 Architectural Definition: UOR-R4 vs. Weight Substrates

**UOR-R4 is a Geometric Cognitive Engine, not merely an LLM wrapper.**

Modern large language models operate on high-dimensional vector spaces, but their internal state transitions remain opaque, continuous, and computationally isolated inside closed server farms. UOR-R4 introduces an explicit, deterministic **geometric state representation and telemetry framework**:

1. **Multi-Tier Pretrained Neural Weight Substrates**:
   * **Qwen 2.5 (0.5B)**: Fast conversational reasoning (`280MB`).
   * **Gemma-4 (Flash)**: Structured, compact knowledge representation (`320MB`).
   * **Qwen 3.8 (Flash)**: Deep code generation and technical logic (`350MB`).
   * **GLM-5.3 (Flash)**: Deep multi-step analytical and mathematical inference (`380MB`).
2. **Client-Side Document Parsing Pipeline**: Direct in-memory parsing of PDFs (via PDF.js) and source code/markdown/data files (`.rs`, `.py`, `.js`, `.ts`, `.json`, `.csv`, `.toml`, etc.) before local model ingestion.
3. **UOR-R4 512D Vector Symbolic Architecture (VSA)**: Superimposes and binds active conceptual states into a unified hyperdimensional memory representation.
4. **64-bit CORDIC Hopf Phase Engine**: Rotates active semantic states on the 3-sphere $S^3$ using fixed-point CORDIC shift-and-add arithmetic, extracting continuous Euler phase angles $(\chi, \delta, lpha)$.
5. **Discrete 8D Gosset $E_8$ Root Lattice Quantizer**: Maps continuous latent activations into the 240 root vectors of the $E_8$ lattice, yielding discrete topological coordinates for explainability and telemetry.
6. **3D Holographic Synaptic Brain Visualizer**: Projects the real-time geometric and phase trajectories into a live interactive WebGL/Canvas neural manifold with real-time Tokens Per Second (TPS) speedometer.
7. **Sovereign IDE & Git Worktree Core**: Local File System Access API mounting + direct GitHub REST API v3 integration with Monaco code editor, dynamic tab strip, and side-by-side diff engine.
8. **Zero-Allocation Rust WASM Multi-File Bundler**: Inlines HTML5, CSS `<style>`, and JavaScript `<script>` into an isolated iframe sandbox running at 60 FPS with virtual console logging.

```
+-----------------------------------------------------------------------------------+
|                            BROWSER CLIENT (100% LOCAL)                            |
|                                                                                   |
|  +------------------------+                        +---------------------------+  |
|  |     USER INTERFACE     |                        | 3D SYNAPTIC BRAIN MANIFOLD|  |
|  |  (Obsidian Chat Theme) |                        | (WebGL / 2D Canvas)       |  |
|  |  - Monaco Code IDE     |                        | - Live TPS Speedometer    |  |
|  |  - Git Worktree Strip  |                        | - Waveform Oscilloscope   |  |
|  |  - KaTeX LaTeX Blocks  |                        | - Hopf / E8 Visualizer    |  |
|  +-----------+------------+                        +-------------^-------------+  |
|              | Prompt + Context                                  |                |
|              v                                                   | Phase/Lattice  |
|  +------------------------+       Hidden States                  | Telemetry      |
|  |  WebGPU NEURAL CORE    | -----------------------+             |                |
|  | (Qwen/Gemma/GLM Substr)|                        |             |                |
|  +-----------+------------+                        |             |                |
|              | Generated Tokens                    v             |                |
|              |                             +---------------------+-------------+  |
|              |                             |       UOR-R4 GEOMETRIC WASM       |  |
|              |                             |      - 512D VSA Superposition     |  |
|              |                             |      - 64-bit CORDIC Rotations    |  |
|              |                             |      - 8D Gosset E8 Lattice       |  |
|              |                             |      - wasm_bundle_project        |  |
|              v                             +---------------------+-------------+  |
|  +------------------------+                                      |                |
|  |  LIVE PREVIEW SANDBOX  | <------------------------------------+                |
|  |  (60 FPS Multi-File)   |                                                       |
|  +------------------------+                                                       |
+-----------------------------------------------------------------------------------+
```

---

## 2. In-Browser WebGPU Neural Inference

### Transformers.js & ONNX Runtime Web
UOR-R4 uses `@huggingface/transformers` v3 with custom WebGPU pipeline execution:
* **Quantization**: 4-bit (`q4`) integer weight quantization reduces model footprints to ~280–380MB while preserving 98%+ of FP16 accuracy.
* **Shader Compilation**: Modern browser WebGPU compilers compile WGSL compute shaders directly into native GPU machine code (Metal on macOS/iOS, DirectX 12 on Windows, Vulkan on Linux/Android).
* **Zero Server Latency**: Token generation proceeds at raw hardware speeds without HTTP round-trip overhead.
* **IndexedDB Local Storage**: Weight shards are cached in the browser's origin-isolated IndexedDB for instant startup on subsequent visits.

---

## 3. Rust WebAssembly Bridge (`src/lib.rs`)

The WebAssembly core is compiled using `wasm-pack` with `wasm-opt -O3` optimization:
* **`DynamicSession`**: Manages the conversational state vector, dynamic vocabulary index, and geometric coordinate tracker.
* **`process_input_dynamic(input, num_tokens)`**:
  1. Computes the 512D Vector Symbolic Architecture (VSA) hypervector.
  2. Applies fixed-point CORDIC rotation in 64-bit float precision to calculate Hopf Euler angles $(\chi, \delta, lpha)$.
  3. Snaps continuous 8D projections into the nearest discrete $E_8$ Gosset lattice centroid.
  4. Returns JSON telemetry to drive the visualizer synchronously with token generation.
* **`wasm_bundle_project(html, css, js)`**: Zero-allocation HTML document construction and `<style>`/`<script>` tag injection for live sandbox rendering.
* **`wasm_calculate_code_stats(code)`**: Microsecond AST and line/character/word statistics calculation.

---

## 4. Git Worktree & Monaco IDE Architecture

The built-in Sovereign IDE provides a complete client-side git worktree engine:
1. **Remote Upstream Cache (`remoteOriginalFiles`)**: Caches unmodified files from GitHub REST API.
2. **Active Worktree Buffers (`workspaceFiles`)**: Tracks active editor contents.
3. **Dirty State Tracker (`modifiedWorktreeFiles`)**: Automatically compares buffer divergence and updates the toolbar status (`🟢 Clean` $	o$ `🟡 N modified`).
4. **Monaco Side-by-Side Diff Engine**: Allocates paired Monaco models (`original` vs `modified`) for instant line-by-line diff inspections.
5. **Atomic Commit & Push**: Packs modified files into Base64 UTF-8 payloads and executes atomic multi-file commits via GitHub REST API Git Refs and Trees endpoints.

---

## 5. Security & Privacy Model

* **Air-Gapped Privacy**: Prompts, attached files, and generated text never leave the user's browser tab.
* **Zero Telemetry Tracking**: Zero analytics, zero cookies, zero third-party tracking scripts.
* **Local Persistence**: Downloaded weights are stored in browser-managed `IndexedDB` storage, encrypted and isolated to the origin domain.
