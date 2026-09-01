# 🔌 UOR-R4 API & Web Worker Reference (v3.1.0)

This document describes the message protocol, Web Worker API, and Rust WebAssembly exports for **UOR-R4**.

---

## 1. Web Worker Message Protocol (`assets/js/uor_model_worker.js`)

The Web Worker communicates via asynchronous `postMessage` exchanges.

### Inbound Actions (Client $\to$ Worker)

#### `generate`
Starts streaming token generation for a prompt:
```javascript
worker.postMessage({
    action: 'generate',
    id: 'req_12345',
    modelId: 'qwen2.5-coder-0.5b', // 'qwen2.5-coder-0.5b' | 'glm5.3-flash' | 'qwen2.5-0.5b'
    payload: {
        messages: [
            { role: 'system', content: 'You are an expert coder.' },
            { role: 'user', content: 'Write a quick Rust function.' }
        ],
        options: {
            max_new_tokens: 1024,
            temperature: 0.2
        }
    }
});
```

#### `stop_generation`
Aborts active token streaming immediately:
```javascript
worker.postMessage({ action: 'stop_generation', id: 'req_12345' });
```

#### `get_storage_status`
Queries current browser `CacheStorage` usage and quota:
```javascript
worker.postMessage({ action: 'get_storage_status', id: 'req_storage' });
```

#### `purge_all_caches`
Deletes all cached model files from browser `CacheStorage`:
```javascript
worker.postMessage({ action: 'purge_all_caches', id: 'req_purge' });
```

---

### Outbound Actions (Worker $\to$ Client)

| Action | Payload Fields | Description |
| :--- | :--- | :--- |
| `compile_stage` | `id, modelId, stage, progress, text` | Emitted during weight downloading and shader compilation. |
| `stream_token` | `id, chunk, fullText, tokenCount, tps, hitLimit` | Emitted on every generated token with streaming TPS. |
| `generate_complete` | `id, fullText, tokenCount, tps` | Emitted when generation completes or hits early stop. |
| `generate_error` | `id, error` | Emitted if WebGPU or inference fails. |
| `storage_status_result` | `id, storage: { usageMB, quotaMB }` | Reports cache storage allocation. |

---

## 2. Rust WebAssembly Functions (`pkg/uor_r4_wasm_chat.d.ts`)

Exported WebAssembly functions accessible in JavaScript via `import init, * as wasm from './pkg/uor_r4_wasm_chat.js'`:

```typescript
// Initializes a new geometric chat session
export class WasmChatSession {
    constructor();
    ingest_token(token: string): void;
    process_input_run(input: string): string; // Returns JSON telemetry
    reset(): void;
}

// Zero-allocation HTML/CSS/JS project bundler
export function wasm_bundle_project(html: string, css: string, js: string): string;

// Code line, word, character, and structure calculator
export function wasm_calculate_code_stats(code: string): string;
```
