---
name: scientific-paper-writer
description: >-
  Publication-grade scientific research paper authoring, formal proof integration,
  and LaTeX compilation pipeline adhering to top-tier ML/systems standards (arXiv cs.LG,
  MLSys, NeurIPS, ICLR). Enforces the Anti-AI-Slop Voice Protocol, truth-in-benchmarking,
  and formal verification grounding.
---

# 🎓 Scientific Paper Writer Skill & Publication Pipeline

This skill guides the preparation, drafting, technical refinement, and compilation of publication-grade research manuscripts for top-tier computer science venues (arXiv `cs.LG`, `cs.AI`, `cs.SE`, NeurIPS, ICLR, MLSys).

---

## 1. The Anti-AI-Slop Voice Protocol

arXiv moderators and conference reviewers reject papers that exhibit typical AI-generated language patterns. When authoring or revising research papers:

### 🚫 Prohibited Vocabulary & Tropes
* **Hyperbolic Marketing Adjectives**: *groundbreaking, revolutionary, unprecedented, paradigm shift, game-changing, magnificent, breathtaking, profound, miraculous, transcendent*.
* **LLM Clichés**: *testament, tapestry, beacon, beacon of hope, delves into, navigate the complexities, poised to, seamlessly, flawlessly*.
* **Vague Hand-Waving**: Avoid sentences that say "X represents a novel approach that unlocks new possibilities" without explaining the concrete mathematical or algorithmic mechanism.

### ✍️ Mandated Scientific Voice
* **Active, Sober, and Precise**: State facts directly.
  - *Poor*: "UOR-R4 represents a revolutionary, breathtaking paradigm shift in decentralized artificial intelligence."
  - *Scientific*: "UOR-R4 implements a client-side neural runtime that eliminates external network requests by executing 4-bit quantized transformer weights directly within WebGPU compute shaders."
* **Mechanical Explanations**: Explain *why* an operation achieves its properties.
  - *Example*: "Hadamard binding compiles to conditional sign-inversion (bitwise two's complement negation) on 16-bit integer registers, bypassing hardware floating-point multiplier units."
* **Mandatory Limitations & Threat Model**:
  - Always include an explicit **Limitations** section discussing VRAM boundaries, hardware requirements (WebGPU support), quantization noise, and failure cases.

---

## 2. Truth-in-Benchmarking Standard

arXiv has a strict zero-tolerance policy against hallucinated data or unverified comparisons.

1. **Every Number Must Be Grounded**: Every throughput value (tok/s), latency metric (ms), or memory footprint (MB) in any table or plot **must** correspond to an actual reproducible benchmark script in the repository (e.g., `scripts/run_benchmarks.py` $\to$ `results/benchmark_data.json`).
2. **Identifiable Model Checkpoints**: Reference exact model identifiers (e.g., `onnx-community/Qwen2.5-0.5B-Instruct`) rather than fictitious model names.
3. **Reproducible Hardware Environment**: Document the exact testbed: OS version, browser version, GPU model, unified memory capacity, and seed count.

---

## 3. Mathematical & Formal Verification Integration

1. **Formal Theorem Environment**:
   - Every theorem must have a clear, rigorous statement followed by a step-by-step mathematical proof.
   - Use standard AMS theorem environments (`\newtheorem{theorem}{Theorem}`).
2. **Machine-Checked Proof Grounding**:
   - When referencing formal verification, include the actual machine-checked proof (e.g., **Lean 4** or **Coq**) in the text or appendix.
   - Accurately state what was proven: do not claim a formal proof of an entire language model if the proof verifies the algebraic properties of the state representation layer (e.g., hypervector unbinding involution).

---

## 4. Citation Integrity & Bibliography Protocol

1. **Real Citations Only**: Every entry in `references.bib` must be an authentic, verifiable publication indexed in Google Scholar, DBLP, arXiv, IEEE, or ACM.
2. **Standard BibTeX Schema**: Include authors, title, booktitle/journal, volume, pages, year, and DOI or arXiv ID.
3. **Compile Self-Contained `.bbl`**: arXiv requires either self-contained `.bbl` files or an included `.bib` processed by standard BibTeX.

---

## 5. LaTeX Compilation & Packaging Pipeline

1. **Primary Compiler**: Use **Tectonic** (or `pdflatex` + `bibtex`).
   ```bash
   tectonic paper/main.tex -o paper/
   ```
2. **Visual Inspection**:
   - Verify that all equations fit within column bounds (no margin overruns).
   - Ensure vector figures (PDF/SVG) are crisp and vector-based.
   - Check that all `\ref` and `\cite` references resolve cleanly with zero `[?]` placeholders.
3. **arXiv Submission Tarball**:
   Package only the essential source files into a flat tarball:
   ```bash
   tar -czf paper/arxiv_submission.tar.gz -C paper main.tex main.bbl figures/
   ```
