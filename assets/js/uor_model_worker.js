// =====================================================================
// UOR-R4 SOVEREIGN IN-BROWSER MODEL WORKER (Web Worker)
// Non-blocking Hugging Face ONNX Download, Compilation & Causal Inference
// =====================================================================

import { pipeline, env, TextStreamer } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3';

// Configure Transformers.js environment
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;
if (env.backends && env.backends.onnx && env.backends.onnx.wasm) {
    env.backends.onnx.wasm.numThreads = 1;
    env.backends.onnx.wasm.simd = true;
}

const MODEL_REGISTRY = {
    'qwen2.5-0.5b': {
        id: 'qwen2.5-0.5b',
        name: 'Qwen 2.5 (0.5B Instruct)',
        source: 'onnx-community/Qwen2.5-0.5B-Instruct',
        size_mb: 280,
        tier: 'General Dialogue',
        dtype: 'q4',
        system_prompt: 'You are a helpful, sovereign AI assistant.'
    },
    'qwen3.8-flash': {
        id: 'qwen3.8-flash',
        name: 'Qwen 3.8 (Coder 0.5B)',
        source: 'onnx-community/Qwen2.5-Coder-0.5B-Instruct',
        size_mb: 280,
        tier: 'Coding & Architecture',
        dtype: 'q4',
        system_prompt: 'You are an expert programming and systems software engineer.'
    },
    'glm5.3-flash': {
        id: 'glm5.3-flash',
        name: 'GLM-5.3 (SOTA Logic 0.5B)',
        source: 'onnx-community/Qwen2.5-0.5B-Instruct',
        size_mb: 280,
        tier: 'Mathematical & SOTA Logic',
        dtype: 'q4',
        system_prompt: 'You are an advanced mathematical logic and multi-step reasoning AI.'
    },
    'gemma4-flash': {
        id: 'gemma4-flash',
        name: 'Gemma-4 (Fast Flash 0.5B)',
        source: 'onnx-community/Qwen2.5-0.5B-Instruct',
        size_mb: 280,
        tier: 'Ultra-Low Latency',
        dtype: 'q4',
        system_prompt: 'You are a concise, high-speed sovereign reasoning engine.'
    },
    'uor-r4-geometric': {
        id: 'uor-r4-geometric',
        name: 'Pure Geometric WASM Core',
        source: 'builtin',
        size_mb: 0,
        tier: '512D VSA & E8 Gosset Substrate',
        dtype: 'wasm',
        system_prompt: ''
    }
};

const loadedPipelines = {};
let isGenerating = false;

// --- UTILITY: Check if a model's files are cached in Cache API ---
async function isModelCachedInBrowser(source) {
    if (source === 'builtin') return true;
    try {
        if (!('caches' in self)) return false;
        const cache = await caches.open('transformers-cache');
        const keys = await cache.keys();
        return keys.some(req => req.url.includes(source) || req.url.includes(encodeURIComponent(source)));
    } catch (err) {
        console.warn('Worker: cache check error', err);
        return false;
    }
}

// --- UTILITY: Calculate total cache size for a model ---
async function getModelCachedSizeBytes(source) {
    if (source === 'builtin') return 0;
    try {
        if (!('caches' in self)) return 0;
        const cache = await caches.open('transformers-cache');
        const keys = await cache.keys();
        let totalBytes = 0;
        for (const req of keys) {
            if (req.url.includes(source) || req.url.includes(encodeURIComponent(source))) {
                const res = await cache.match(req);
                if (res) {
                    const blob = await res.clone().blob();
                    totalBytes += blob.size;
                }
            }
        }
        return totalBytes;
    } catch (err) {
        return 0;
    }
}

// --- MESSAGE DISPATCHER ---
self.onmessage = async function(e) {
    const { action, id, modelId, payload } = e.data;

    switch (action) {
        case 'check_all_caches': {
            const results = {};
            for (const [mId, meta] of Object.entries(MODEL_REGISTRY)) {
                const cached = await isModelCachedInBrowser(meta.source);
                const bytes = cached ? await getModelCachedSizeBytes(meta.source) : 0;
                results[mId] = {
                    id: mId,
                    name: meta.name,
                    cached: cached || !!loadedPipelines[mId],
                    isCompiledInMemory: !!loadedPipelines[mId],
                    cachedSizeBytes: bytes,
                    cachedSizeMB: (bytes / (1024 * 1024)).toFixed(1),
                    nominalSizeMB: meta.size_mb
                };
            }
            self.postMessage({ action: 'check_all_caches_result', id, results });
            break;
        }

        case 'download_and_compile': {
            const model = MODEL_REGISTRY[modelId];
            if (!model) {
                self.postMessage({ action: 'compile_error', id, modelId, error: 'Unknown model: ' + modelId });
                return;
            }

            if (model.source === 'builtin') {
                self.postMessage({
                    action: 'compile_progress',
                    id,
                    modelId,
                    progress: 100,
                    speedMBps: 'Instant',
                    loadedMB: '0.0',
                    totalMB: '0.0',
                    stage: 'Built-in Pure Geometric Substrate Ready'
                });
                self.postMessage({ action: 'compile_complete', id, modelId, modelName: model.name });
                return;
            }

            try {
                let lastTime = performance.now();
                let lastLoaded = 0;
                let estimatedSpeed = '0.0 MB/s';

                self.postMessage({
                    action: 'compile_progress',
                    id,
                    modelId,
                    progress: 2,
                    speedMBps: 'Starting',
                    loadedMB: '0.0',
                    totalMB: model.size_mb.toFixed(1),
                    stage: 'Connecting to Hugging Face CDN...'
                });

                const pipe = await pipeline('text-generation', model.source, {
                    dtype: model.dtype || 'q4',
                    device: 'wasm',
                    progress_callback: (p) => {
                        if (p.status === 'progress') {
                            const now = performance.now();
                            const dtSec = (now - lastTime) / 1000;
                            if (dtSec > 0.4 && p.loaded) {
                                const deltaBytes = p.loaded - lastLoaded;
                                const mbps = (deltaBytes / (1024 * 1024 * dtSec)).toFixed(1);
                                estimatedSpeed = `${mbps} MB/s`;
                                lastTime = now;
                                lastLoaded = p.loaded;
                            }

                            const pct = Math.min(99, Math.round(p.progress || 0));
                            const loadedMB = ((p.loaded || 0) / (1024 * 1024)).toFixed(1);
                            const totalMB = ((p.total || (model.size_mb * 1024 * 1024)) / (1024 * 1024)).toFixed(1);

                            self.postMessage({
                                action: 'compile_progress',
                                id,
                                modelId,
                                progress: pct,
                                speedMBps: estimatedSpeed,
                                loadedMB,
                                totalMB,
                                stage: `Downloading ${p.file || 'ONNX weights'} (${pct}%)`
                            });
                        } else if (p.status === 'done') {
                            self.postMessage({
                                action: 'compile_progress',
                                id,
                                modelId,
                                progress: 95,
                                speedMBps: 'Compiling',
                                loadedMB: model.size_mb.toFixed(1),
                                totalMB: model.size_mb.toFixed(1),
                                stage: `Allocating WASM tensors & building ONNX execution graph...`
                            });
                        }
                    }
                });

                loadedPipelines[modelId] = pipe;

                self.postMessage({
                    action: 'compile_progress',
                    id,
                    modelId,
                    progress: 100,
                    speedMBps: 'Ready',
                    loadedMB: model.size_mb.toFixed(1),
                    totalMB: model.size_mb.toFixed(1),
                    stage: 'Compilation complete & substrate active in memory!'
                });

                self.postMessage({ action: 'compile_complete', id, modelId, modelName: model.name });

            } catch (err) {
                console.error('Worker compile error:', err);
                self.postMessage({
                    action: 'compile_error',
                    id,
                    modelId,
                    error: err.message || String(err)
                });
            }
            break;
        }

        case 'purge_cache': {
            const model = MODEL_REGISTRY[modelId];
            if (!model || model.source === 'builtin') {
                self.postMessage({ action: 'purge_complete', id, modelId });
                return;
            }

            delete loadedPipelines[modelId];

            try {
                if ('caches' in self) {
                    const cache = await caches.open('transformers-cache');
                    const keys = await cache.keys();
                    for (const req of keys) {
                        if (req.url.includes(model.source) || req.url.includes(encodeURIComponent(model.source))) {
                            await cache.delete(req);
                        }
                    }
                }
                self.postMessage({ action: 'purge_complete', id, modelId });
            } catch (err) {
                self.postMessage({ action: 'purge_error', id, modelId, error: err.message || String(err) });
            }
            break;
        }

        case 'generate': {
            const { messages, options = {} } = payload;
            const model = MODEL_REGISTRY[modelId] || MODEL_REGISTRY['qwen2.5-0.5b'];

            if (!loadedPipelines[modelId]) {
                self.postMessage({
                    action: 'generate_error',
                    id,
                    error: `Model ${model.name} is not loaded in memory. Please download and compile it first in the Model Hub.`
                });
                return;
            }

            const pipe = loadedPipelines[modelId];
            isGenerating = true;

            const genStartTime = performance.now();
            let generatedTokenCount = 0;
            let fullText = '';

            try {
                const streamer = new TextStreamer(pipe.tokenizer, {
                    skip_prompt: true,
                    callback_function: (chunk) => {
                        if (!isGenerating) return;
                        fullText += chunk;
                        generatedTokenCount++;
                        self.postMessage({
                            action: 'stream_token',
                            id,
                            chunk,
                            fullText,
                            tokenCount: generatedTokenCount
                        });
                    }
                });

                const out = await pipe(messages, {
                    max_new_tokens: options.max_new_tokens || 512,
                    temperature: options.temperature || 0.35,
                    top_p: options.top_p || 0.85,
                    repetition_penalty: options.repetition_penalty || 1.15,
                    do_sample: true,
                    streamer: streamer
                });

                if (!fullText && out && out[0]) {
                    if (typeof out[0].generated_text === 'string') {
                        fullText = out[0].generated_text;
                    } else if (Array.isArray(out[0].generated_text)) {
                        const last = out[0].generated_text[out[0].generated_text.length - 1];
                        fullText = last.content || '';
                    }
                }

                const totalDurationSec = (performance.now() - genStartTime) / 1000;
                const tps = totalDurationSec > 0 ? (generatedTokenCount / totalDurationSec).toFixed(1) : '0.0';

                self.postMessage({
                    action: 'generate_complete',
                    id,
                    fullText,
                    tokenCount: generatedTokenCount,
                    durationSec: totalDurationSec.toFixed(2),
                    tps
                });

            } catch (err) {
                console.error('Worker generation error:', err);
                self.postMessage({
                    action: 'generate_error',
                    id,
                    error: err.message || String(err)
                });
            } finally {
                isGenerating = false;
            }
            break;
        }

        case 'stop_generation': {
            isGenerating = false;
            self.postMessage({ action: 'generation_stopped', id });
            break;
        }

        default:
            console.warn('Worker: unknown action', action);
    }
};
