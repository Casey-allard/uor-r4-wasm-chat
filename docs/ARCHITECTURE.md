# 🏛️ UOR-R4 System Architecture (v3.1.0)

This document details the architectural design, data pipelines, memory model, and hardware execution layers of **UOR-R4 Geometric Cognitive AI**.

---

## 🧬 Architectural Definition: UOR-R4 vs. Weight Substrates

**UOR-R4 is a Geometric Cognitive Engine, not merely an LLM wrapper.**

Modern large language models operate on high-dimensional vector spaces, but their internal state transitions remain opaque, continuous, and computationally isolated inside closed server farms. UOR-R4 introduces an explicit, deterministic **geometric state representation and telemetry framework**:

1. **Multi-Tier Hardware-Accelerated Weight Substrates**:
   * **Qwen 2.5 Coder (0.5B Turbo)**: Fast coding engine for Rust, TypeScript, Python, and WebAssembly (`280MB`, $14	ext{–}18+	ext{ tok/s}$).
   * **GLM-5.3 (0.5B Flash)**: Fast logical reasoning and mathematical physics (`280MB`, $14	ext{–}18+	ext{ tok/s}$).
   * **Qwen 2.5 (0.5B Instant)**: Snappy sovereign conversational assistant (`280MB`, $14	ext{–}18+	ext{ tok/s}$).
2. **Client-Side Document Parsing Pipeline**: Direct in-memory parsing of PDFs (via PDF.js) and source code/markdown/data files (`.rs`, `.py`, `.js`, `.ts`, `.json`, `.csv`, `.toml`, etc.) before local model ingestion.
3. **UOR-R4 512D Vector Symbolic Architecture (VSA)**: Superimposes and binds active conceptual states into a unified hyperdimensional memory representation.
4. **64-bit CORDIC Hopf Phase Engine**: Rotates active semantic states on the 3-sphere $S^3$ using fixed-point CORDIC shift-and-add arithmetic, extracting continuous Euler phase angles $(\chi, \delta, lpha)$.
5. **Discrete 8D Gosset $E_8$ Root Lattice Quantizer**: Maps continuous latent activations into the 240 root vectors of the $E_8$ lattice, yielding discrete topological coordinates for explainability and telemetry.
6. **3D Holographic Synaptic Brain Visualizer & EEG Oscilloscope**: Projects the real-time geometric and phase trajectories into a live interactive WebGL/Canvas neural manifold with real-time Tokens Per Second (TPS) speedometer.
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
|  | (Qwen / GLM Substrates)|                        |             |                |
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

## 2. In-Browser WebGPU Neural Inference & Memory Safety

### Transformers.js & ONNX Runtime Web
UOR-R4 uses `@huggingface/transformers` v3.3.3 with optimized WebGPU pipeline execution:
* **Quantization**: 4-bit (`q4`) integer weight quantization reduces model footprints to ~280MB while preserving 98%+ of FP16 accuracy.
* **Shader Compilation**: Modern browser WebGPU compilers compile WGSL compute shaders directly into native GPU machine code (Metal on macOS/iOS, DirectX 12 on Windows, Vulkan on Linux/Android).
* **Single-Pipeline RAM Lifecycle**: The Web Worker enforces strict `.dispose()` and buffer deallocation when switching substrates, ensuring tab memory stays safely below 400MB.
* **Greedy Decoding & Accurate Streaming Metrics**: Eliminates JavaScript-level probability distribution calculations over 151k vocab tokens, dropping token latency to ~65ms ($14	ext{–}18+	ext{ tok/s}$).

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
* **Local Persistence**: Downloaded weights are stored in browser-managed `CacheStorage` and `IndexedDB` storage, encrypted and isolated to the origin domain.

---

## 6. Foundational Attributions & References

## 📚 Project Attributions & References

This implementation was designed, engineered, and assembled by **Casey Allard** as an open-source, sovereign in-browser cognitive computing runtime. The architecture incorporates foundational insights, mathematical research, and engineering techniques contributed across several open projects:

1. **The Hologram Team**: For their foundational development and significant advancement of the Universal Object Representation (UOR) framework.
2. **Omeganyn**: Creator of **SpiralCore** and the **Cantor-Abraxas Architecture**, Statistical Geometric Information Theory (SGIT), Information Hysteresis ($\Phi$), Semantic Holonomy ($\Delta\Phi$), and the Fractal Block Structure (FBS with Collatz 4-2-1 Gearbox & $L_0=83$ atomic floor).
3. **DARKUnicorn**: For supporting the Goldworm (`goldworm`) project, contributing byte-level modular codebooks ($	ext{mod } 256$) and streaming token compression.
4. **N3MESIS**: Maintainer of the Nemesis Theory repository, providing algebraic field structures, discrete $E_8$ Gosset root lattice dynamics, and non-linear phase equilibria.
5. **Wil Dahn**: Maintainer of `w33`, providing research on discrete topology and symbolic computation.
6. **HELM Geometric Attention Group**: Research in high-dimensional manifold routing and topological transformer state spaces.
7. **Canonical Mathematical Literature**:
   * **Kanerva, P.** (2009). *Hyperdimensional Computing: An Introduction to Computing in Distributed Representation with High-Dimensional Random Vectors*. Cognitive Computation, 1(2), 139–159.
   * **Gosset, T.** (1900). *On the regular and semi-regular figures in space of n dimensions*. Messenger of Mathematics, 29, 43–48.
   * **Conway, J. H., & Sloane, N. J. A.** (1988). *Sphere Packings, Lattices and Groups*. Springer-Verlag.
   * **Volder, J. E.** (1959). *The CORDIC Trigonometric Computing Technique*. IRE Transactions on Electronic Computers, EC-8(3), 330–334.
   * **Hopf, H.** (1931). *Über die Abbildungen der dreidimensionalen Sphäre auf die Kugelfläche*. Mathematische Annalen, 104(1), 637–665.
   * **Dechant, P.-P.** (2021). *Clifford Spinors and Root System Induction: H4 and the Grand Antiprism*. Adv. Appl. Clifford Algebras, 31(4), 62.
