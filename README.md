<div align="center">

![UOR-R4 Hero Banner](assets/images/hero_banner.jpg)

# 🌐 UOR-R4 Geometric Cognitive AI (v2.0.0)
### *The 100% Sovereign In-Browser AI Studio • High-Dimensional Geometric Substrates • Native Git Worktree & Live Monaco IDE*

[![Live Demo](https://img.shields.io/badge/🌐_Live_App-GitHub_Pages-00f3ff?style=for-the-badge&logo=googlechrome&logoColor=white)](https://casey-allard.github.io/uor-r4-wasm-chat/)
[![Release v2.0.0](https://img.shields.io/github/v/release/Casey-allard/uor-r4-wasm-chat?style=for-the-badge&color=8A2BE2&label=Release)](https://github.com/Casey-allard/uor-r4-wasm-chat/releases/tag/v2.0.0)
[![CI/CD](https://img.shields.io/github/actions/workflow/status/Casey-allard/uor-r4-wasm-chat/deploy.yml?branch=main&style=for-the-badge&label=WASM%20Build%20%26%20Deploy)](https://github.com/Casey-allard/uor-r4-wasm-chat/actions)
[![Rust](https://img.shields.io/badge/Rust-2021_Edition-orange?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![WebGPU](https://img.shields.io/badge/WebGPU-Hardware_Accelerated-green?style=for-the-badge&logo=webgpu)](https://www.w3.org/TR/webgpu/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-Wasm32_SIMD-654FF0?style=for-the-badge&logo=webassembly)](https://webassembly.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

[**🚀 Launch In-Browser Studio**](https://casey-allard.github.io/uor-r4-wasm-chat/) • [**🏛️ Architecture Deep Dive**](docs/ARCHITECTURE.md) • [**📐 Geometric Mathematics**](docs/GEOMETRIC_MATHEMATICS.md) • [**🔌 API Reference**](docs/API_REFERENCE.md)

</div>

---

## ⚡ What is UOR-R4?

**UOR-R4** is an open-source, fully sovereign artificial intelligence engineering studio and cognitive reasoning runtime executing **100% locally inside your web browser**.

Powered by native **WebGPU WGSL hardware acceleration** and a high-performance **Rust WebAssembly (WASM)** core, UOR-R4 bridges **quantized transformer neural networks** with **deterministic high-dimensional geometric state spaces**:

* 🔒 **100% Sovereign & Air-Gapped**: Runs entirely on your local GPU/CPU hardware. Zero server calls for inference, zero API keys, zero cloud compute rental fees, zero subscriptions, and zero tracking telemetry.
* 🌌 **Geometric Cognitive Substrate**: Continuous attention activations are projected onto the **8D Gosset $E_8$ Root Lattice (240 Roots)** and rotated via **64-bit CORDIC Fixed-Point Hopf Fibrations ($S^3 \to S^2$)** to modulate temperature and dynamic logit manifolds.
* 💻 **Complete Sovereign IDE & Git Worktree**: Mount local directories via the File System Access API or explore any remote GitHub repository without tokens. Features dynamic Monaco editor tabs, side-by-side visual diffing, branch switching, atomic multi-file commit pushes, and pull request creation.
* ⚡ **Zero-Allocation Rust WASM Multi-File Bundler**: Live in-browser compilation and execution of multi-file HTML5/CSS/JavaScript projects running at a smooth 60 FPS in an isolated, sandboxed environment.
* 📐 **Rigorous KaTeX Typography & Multi-Doc Ingest**: Native LaTeX mathematical rendering with multi-document client-side extraction (PDFs, source code, JSON, TOML, Markdown).

---

## 📸 Sovereign AI Studio in Action

<div align="center">

### 1. Monaco Editor with Direct GitHub Cloud Worktree & Branch Management
![Remote GitHub Repository File in Monaco](assets/images/github_repo_monaco.png)
*Browse any GitHub repository (e.g. `Casey-allard/uor-r4-wasm-chat`), load recursive file trees, edit files with syntax highlighting, and track worktree status.*

---

### 2. Side-by-Side Monaco Diff Engine
![Monaco Side-by-Side Diff View](assets/images/monaco_diff_view.png)
*Real-time visual diffing between remote upstream repository files and local modifications with instant line addition and deletion markers.*

---

### 3. Holographic Synaptic Brain Manifold & KaTeX Mathematical Chat
![Sovereign AI Studio Overview](assets/images/sovereign_studio_live.png)
*Live 3D synaptic projections, real-time generation speed (tok/s), and KaTeX mathematical equation rendering.*

</div>

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Browser ["Client Browser Subsystem (100% In-Browser & Local)"]
        UI["Sovereign AI Studio UI<br/>(Obsidian Theme + Dynamic Tab Strip)"]
        
        subgraph NeuralCore ["Hardware-Accelerated Neural Core"]
            WebGPU["WebGPU Pipeline (WGSL Compute Shaders)<br/>(Metal / DirectX 12 / Vulkan)"]
            ONNXRuntime["ONNX Runtime Web + Transformers.js<br/>(Q4_F16 Quantized Model Weights)"]
            WebGPU --> ONNXRuntime
        end

        subgraph GeometricCore ["Rust WebAssembly (WASM) Engine"]
            VSA["512D Vector Symbolic Architecture (VSA)<br/>(Hadamard Binding & Bundling)"]
            CORDIC["64-bit CORDIC Hopf Fibration<br/>(Euler Angles χ, δ, α on S³ → S²)"]
            E8["8D Gosset E8 Root Lattice<br/>(240 Minimal Root Centroids)"]
            Bundler["wasm_bundle_project<br/>(Zero-Allocation Multi-File HTML5 Sandbox)"]
            
            VSA --> CORDIC --> E8
        end

        subgraph IDECore ["Sovereign IDE & Git Worktree"]
            Monaco["Monaco Code Editor & Side-by-Side Diff"]
            GitWorktree["Git Worktree State Machine<br/>(Remote Cache vs. Modified Buffers)"]
            Sandbox["Isolated Live Preview Sandbox<br/>(60 FPS Canvas + Virtual Console)"]
            
            Monaco <--> GitWorktree
            Monaco --> Bundler --> Sandbox
        end

        UI <--> NeuralCore
        NeuralCore <--> GeometricCore
        UI <--> IDECore
    end

    subgraph External ["Optional Remote Ecosystem"]
        GitHub["GitHub REST API v3<br/>(Trees, Blobs, Branches, Commits, PRs)"]
        LocalServer["Local Python Server<br/>(FastAPI /v1/chat/completions)"]
        
        IDECore <-->|Fetch / Commit / PR| GitHub
        UI -.->|Mode 2: Local API| LocalServer
    end
```

---

## 🧬 How the Geometry Meshes with Neural Weights

Unlike typical AI applications that treat neural model outputs as opaque vectors, UOR-R4 integrates an explicit **geometric cognitive manifold**:

```
Continuous Token Latents (d=512) ──► 512D VSA Hypervector Superposition (S = Σ v_k)
                                              │
                                              ▼
                             64-bit Fixed-Point CORDIC Rotation
                                 q ∈ S³ ──(Hopf π)──► p ∈ S²
                                              │
                                              ▼
                             Discrete 8D Gosset E8 Root Lattice Snapping
                                    w = argmin ||p - r_i|| (240 Roots)
                                              │
                                              ▼
                             Dynamic Temperature & Manifold Warping:
                                    T_geom = T_0 · (1 + γ · sin(χ))
```

1. **512D Vector Symbolic Architecture (VSA)**:
   Tokens and contextual history are represented as high-dimensional hypervectors in $\mathbb{R}^{512}$. Conceptual binding is performed via circular convolution / Hadamard multiplication ($B = R \odot F$), and semantic memory bundling is preserved via normalized vector summation ($S = \text{sign}(\sum v_k)$).
2. **64-bit CORDIC Hopf Fibrations**:
   The active semantic state is rotated on the 3-sphere $S^3 \subset \mathbb{R}^4$ using fixed-point CORDIC shift-and-add arithmetic. The Hopf map $\pi: S^3 \to S^2$ yields continuous invariant phase coordinates $(\chi, \delta, \alpha)$ without floating-point division or transcendental approximations.
3. **8D Gosset $E_8$ Root Lattice Quantization**:
   The phase coordinates are projected into $\mathbb{R}^8$ and snapped to the nearest of the **240 root vectors** $\Delta(E_8) = \{x \in \mathbb{Z}^8 \cup (\mathbb{Z} + \frac{1}{2})^8 : \sum x_i \equiv 0 \pmod 2, \|x\|^2 = 2\}$. This provides deterministic topological coordinate snapping for state explainability and telemetry.
4. **Dynamic Geometric Manifold Warping**:
   The instantaneous Hopf phase angle $\chi$ continuously modulates the sampling temperature ($T_{\text{geom}} = T_0 \cdot (1 + \gamma \sin\chi)$) and logit penalties, preventing repetitive loops and maintaining coherence during extended reasoning chains.

---

## 🌟 Comprehensive Feature Matrix

| Feature | UOR-R4 Sovereign AI Studio | Standard Web AI (ChatGPT, Claude) | Traditional Local Web (Ollama WebUI) |
| :--- | :---: | :---: | :---: |
| **Inference Location** | **100% In-Browser Client-Side (WebGPU)** | Closed Server Cloud | Local Native Daemon Required |
| **Server Requirement** | **Zero (Static GitHub Pages Hosting)** | Dedicated Cloud Servers | Backend Process (Ollama / vLLM) |
| **Privacy & Telemetry** | **Zero Data Leaves Machine (Air-Gapped)** | Logged / Retained on Server | Local (Varies) |
| **Geometric Cognitive Core** | **8D Gosset $E_8$ + CORDIC Hopf Fibration** | None (Standard Softmax) | None (Standard Softmax) |
| **Built-in Monaco IDE** | **Yes (Multi-Tab, Diff, Syntax Highlight)** | Limited / Code Blocks Only | No (Chat Only) |
| **Git Worktree Integration** | **Direct GitHub API + Branch / Push / PR** | No | No |
| **Live Multi-File Preview** | **60 FPS Rust WASM Bundler & Sandbox** | No | No |
| **Mathematical Rendering** | **Native KaTeX LaTeX Typography** | Standard Markdown / KaTeX | Basic Markdown |
| **Cost & Subscriptions** | **100% Free & Open Source (MIT)** | $20–$200 / month | Free (Requires Hardware Daemon) |

---

## 🚀 Quick Start Guide

### 🌐 Instant In-Browser Experience (Zero Installation)

1. Open the hosted application: **[https://casey-allard.github.io/uor-r4-wasm-chat/](https://casey-allard.github.io/uor-r4-wasm-chat/)**
2. In the left sidebar under **Neural Substrates**, select your model:
   * **⚡ Qwen 2.5 (0.5B)** (`280MB`): Ultra-fast instruction following and dialogue.
   * **🔮 Gemma-4 (Flash)** (`320MB`): Structured knowledge and logic.
   * **⚡ Qwen 3.8 (Flash)** (`350MB`): Technical coding and algorithmic workflows.
   * **🧬 GLM-5.3 (Flash)** (`380MB`): Deep multi-step analytical and mathematical inference.
3. Click **Download & Compile**. The weights will download and compile into your local GPU cache via `IndexedDB`.
4. Start coding, reasoning, and building!

---

### 💻 GitHub Cloud & Git Worktree Workflow

1. Switch to the **GitHub Repos** view or click **Workspace** in the sidebar.
2. **Explore Public Repos**: Enter any repository (e.g. `Casey-allard/uor-r4-wasm-chat` or `mrdoob/three.js`) to browse files immediately without a token.
3. **Authenticate for Collaborative Pushes**: Click **🔑 Connect Account** and paste a GitHub Personal Access Token (`repo` scope).
4. **Open & Edit Files**: Click any file in the workspace tree to open it in Monaco.
5. **Inspect Diffs**: Click **⚖️ View Diff** to see your changes compared side-by-side with upstream.
6. **Commit & Push**: Click **🚀 Commit & Push**, select your target branch, and push directly to GitHub!

---

### 🔌 Optional: OpenAI-Compatible Local Python API Server

If you wish to expose UOR-R4 to external agent frameworks (LangChain, AutoGen, Cursor, Cline, Aider):

```bash
# 1. Clone the repository
git clone https://github.com/Casey-allard/uor-r4-wasm-chat.git
cd uor-r4-wasm-chat

# 2. Install Python dependencies
pip install -r server/requirements.txt

# 3. Start the high-performance FastAPI server
python server/app.py
```

Your server is now live at `http://localhost:8000/v1` with full streaming SSE support:

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="uor-local")

stream = client.chat.completions.create(
    model="glm5.3-flash",
    messages=[{"role": "user", "content": "Explain 8D Gosset lattice geometry."}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
print()
```

---

## 🛠️ Building & Compiling from Source

### Prerequisites
* [Rust](https://rustup.rs/) (2021 Edition or newer)
* [`wasm-pack`](https://rustwasm.github.io/wasm-pack/installer/)
* [Node.js](https://nodejs.org/) (v18+)

```bash
# 1. Compile the Rust WebAssembly module with release optimizations
wasm-pack build --target web --release

# 2. Run wasm-opt for maximum binary shrinking
wasm-opt -O3 pkg/uor_r4_wasm_bridge_bg.wasm -o pkg/uor_r4_wasm_bridge_bg.wasm

# 3. Build the Sovereign AI Studio distribution
python3 scratch/build_sovereign_dev_studio.py
```

---

## 📚 Mathematical References & Foundational Literature

1. **[UOR Foundation](https://github.com/uor-foundation)**: Architectural standard for Universal Object Representation, 512D Vector Symbolic hyperdimensional memory, and sovereign geometric AI.
2. **HELM Geometric Attention Group**: High-dimensional geometric attention mechanisms, non-Euclidean manifold routing, and topological transformer state spaces.
3. **The Authors of Goldworm (`goldworm`)**: Byte-level modular codebooks ($	ext{mod } 256$), streaming token compression, and SIMD parsing.
4. **`w33`**: Discrete topology and high-performance symbolic computation research.
5. **Nemesis Theory Mathematics**: Algebraic field structures, discrete $E_8$ Gosset root lattice dynamics, and non-linear phase equilibria.
6. **Kanerva, P.** (2009). *Hyperdimensional Computing: An Introduction to Computing in Distributed Representation with High-Dimensional Random Vectors*. Cognitive Computation, 1(2), 139–159.
7. **Gosset, T.** (1900). *On the regular and semi-regular figures in space of n dimensions*. Messenger of Mathematics, 29, 43–48.
8. **Conway, J. H., & Sloane, N. J. A.** (1988). *Sphere Packings, Lattices and Groups*. Springer-Verlag.
9. **Volder, J. E.** (1959). *The CORDIC Trigonometric Computing Technique*. IRE Transactions on Electronic Computers, EC-8(3), 330–334.
10. **Hopf, H.** (1931). *Über die Abbildungen der dreidimensionalen Sphäre auf die Kugelfläche*. Mathematische Annalen, 104(1), 637–665.

---

## 📜 License

This project is open-source software licensed under the [MIT License](LICENSE).
