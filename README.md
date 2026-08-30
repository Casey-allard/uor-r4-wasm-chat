# UOR-R4 High-Performance WASM Generative AI & Verification Workspace

This repository unifies the complete **UOR-R4 cognitive routing substrate** into an interactive WebAssembly-powered browser interface, complete with in-browser alignment training and Kani formal verification suites.

## Project Layout

*   `.github/workflows/deploy.yml`: Automated GitHub Actions deployment to GitHub Pages.
*   `index.html`: Standalone browser dashboard containing local-first chat REPL and local SGD alignment.
*   `src/lib.rs`: WebAssembly wrapper module exposing client-side APIs.
*   `tests/`: Bounded model checking files (Kani) verifying absolute memory and integer overflow safety.
*   `src/bin/`: Standalone optimized utilities (Generative chatbot REPL, parallel E8 database compression and mmap loader, ANSI metrics dashboard).

## Compiling WebAssembly Locally

```bash
# Compile and package WASM bridge
wasm-pack build --target web --release
```

## Running Verification

```bash
# Run Kani verification proofs
cargo kani --file tests/unicode_lexical_parser_kani.rs
```
