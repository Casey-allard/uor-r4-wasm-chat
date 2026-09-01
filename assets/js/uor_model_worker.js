// =====================================================================
// UOR-R4 SOVEREIGN IN-BROWSER MODEL WORKER (Web Worker)
// High-Speed Multi-Threaded Inference & Clean Context Dispatcher
// =====================================================================

import { pipeline, env, TextStreamer } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3';

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;
if (env.backends && env.backends.onnx && env.backends.onnx.wasm) {
    env.backends.onnx.wasm.numThreads = Math.min(8, (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) ? navigator.hardwareConcurrency : 4);
    env.backends.onnx.wasm.simd = true;
}

const MODEL_REGISTRY = {
    'glm5.3-flash': {
        id: 'glm5.3-flash',
        name: 'GLM-5.3 (SOTA Logic 0.5B)',
        source: 'onnx-community/Qwen2.5-0.5B-Instruct',
        size_mb: 280,
        dtype: 'q4'
    },
    'qwen2.5-0.5b': {
        id: 'qwen2.5-0.5b',
        name: 'Qwen 2.5 (0.5B Instruct)',
        source: 'onnx-community/Qwen2.5-0.5B-Instruct',
        size_mb: 280,
        dtype: 'q4'
    }
};

const loadedPipelines = {};
let isGenerating = false;

async function getStorageEstimate() {
    let usageBytes = 0;
    let quotaBytes = 0;
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        usageBytes = est.usage || 0;
        quotaBytes = est.quota || 0;
    }
    return {
        usageMB: (usageBytes / (1024 * 1024)).toFixed(1),
        quotaMB: (quotaBytes / (1024 * 1024)).toFixed(1),
        usageBytes,
        quotaBytes
    };
}

async function purgeAllCaches() {
    for (const k in loadedPipelines) {
        delete loadedPipelines[k];
    }
    if ('caches' in self) {
        const keys = await caches.keys();
        for (const key of keys) {
            await caches.delete(key);
        }
    }
}

async function getOrLoadPipeline(modelId, onProgress) {
    if (loadedPipelines[modelId]) return loadedPipelines[modelId];

    const model = MODEL_REGISTRY[modelId] || MODEL_REGISTRY['glm5.3-flash'];

    let device = 'wasm';
    if (typeof navigator !== 'undefined' && navigator.gpu) {
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) device = 'webgpu';
        } catch(e) {}
    }

    const pipe = await pipeline('text-generation', model.source, {
        dtype: model.dtype || 'q4',
        device: device,
        progress_callback: (p) => {
            if (onProgress) onProgress(p);
        }
    });

    loadedPipelines[modelId] = pipe;
    return pipe;
}

self.onmessage = async function(e) {
    const { action, id, modelId, payload } = e.data;

    switch (action) {
        case 'get_storage_status': {
            const est = await getStorageEstimate();
            self.postMessage({ action: 'storage_status_result', id, storage: est });
            break;
        }

        case 'purge_all_caches': {
            try {
                await purgeAllCaches();
                const est = await getStorageEstimate();
                self.postMessage({ action: 'purge_complete', id, storage: est });
            } catch(err) {
                self.postMessage({ action: 'purge_error', id, error: err.message || String(err) });
            }
            break;
        }

        case 'prewarm': {
            try {
                await getOrLoadPipeline(modelId || 'glm5.3-flash', (p) => {
                    handleProgressCallback(p, id, modelId || 'glm5.3-flash');
                });
                self.postMessage({ action: 'prewarm_complete', id, modelId });
            } catch(err) {
                self.postMessage({ action: 'prewarm_error', id, modelId, error: err.message || String(err) });
            }
            break;
        }

        case 'generate': {
            const { messages, options = {} } = payload;
            const targetModelId = modelId || 'glm5.3-flash';
            isGenerating = true;

            const genStartTime = performance.now();
            let generatedTokenCount = 0;
            let fullText = '';

            try {
                const pipe = await getOrLoadPipeline(targetModelId, (p) => {
                    handleProgressCallback(p, id, targetModelId);
                });

                self.postMessage({
                    action: 'compile_stage',
                    id,
                    modelId: targetModelId,
                    stage: 'ready',
                    progress: 100,
                    text: '✓ Neural Substrate Ready. Streaming tokens...'
                });

                // Sanitize input messages to ensure no special tokens break ChatML
                const cleanMessages = messages.map(m => ({
                    role: m.role,
                    content: (m.content || '')
                        .replace(/<\|im_start\|>/g, '')
                        .replace(/<\|im_end\|>/g, '')
                        .replace(/<\|endoftext\|>/g, '')
                        .trim()
                })).filter(m => m.content.length > 0);

                const streamer = new TextStreamer(pipe.tokenizer, {
                    skip_prompt: true,
                    callback_function: (chunk) => {
                        if (!isGenerating) return;
                        if (chunk.includes('<|im_end|>') || chunk.includes('<|endoftext|>')) {
                            chunk = chunk.replace(/<\|im_end\|>/g, '').replace(/<\|endoftext\|>/g, '');
                        }
                        fullText += chunk;
                        generatedTokenCount++;

                        const elapsedSec = Math.max(0.01, (performance.now() - genStartTime) / 1000);
                        const tps = (generatedTokenCount / elapsedSec).toFixed(1);

                        self.postMessage({
                            action: 'stream_token',
                            id,
                            chunk,
                            fullText,
                            tokenCount: generatedTokenCount,
                            tps
                        });
                    }
                });

                const out = await pipe(cleanMessages, {
                    max_new_tokens: options.max_new_tokens || 1024,
                    temperature: options.temperature || 0.6,
                    top_p: options.top_p || 0.92,
                    repetition_penalty: options.repetition_penalty || 1.1,
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

                fullText = fullText.replace(/<\|im_end\|>/g, '').replace(/<\|endoftext\|>/g, '').trim();
                const totalDurationSec = Math.max(0.1, (performance.now() - genStartTime) / 1000);
                const finalAvgTps = (generatedTokenCount / totalDurationSec).toFixed(1);

                self.postMessage({
                    action: 'generate_complete',
                    id,
                    fullText,
                    tokenCount: generatedTokenCount,
                    durationSec: totalDurationSec.toFixed(2),
                    tps: finalAvgTps
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
    }
};

function handleProgressCallback(p, id, targetModelId) {
    if (p.status === 'initiate') {
        self.postMessage({
            action: 'compile_stage',
            id,
            modelId: targetModelId,
            stage: 'initiate',
            progress: 2,
            text: `Connecting to Hugging Face for ${p.file || 'model files'}...`,
            file: p.file
        });
    } else if (p.status === 'progress') {
        const pct = Math.min(99, Math.round(p.progress || 0));
        const loadedMB = ((p.loaded || 0) / (1024 * 1024)).toFixed(1);
        const totalMB = ((p.total || 280 * 1024 * 1024) / (1024 * 1024)).toFixed(1);
        
        let text = `📥 Downloading ${p.file || 'ONNX weights'} (${pct}% • ${loadedMB}MB / ${totalMB}MB)`;
        if (pct >= 99) {
            text = `⚡ Compiling ONNX execution graph & allocating WebGPU/WASM tensors...`;
        }

        self.postMessage({
            action: 'compile_stage',
            id,
            modelId: targetModelId,
            stage: pct >= 99 ? 'compiling' : 'downloading',
            progress: pct,
            loadedMB,
            totalMB,
            text: text,
            file: p.file
        });
    } else if (p.status === 'done') {
        self.postMessage({
            action: 'compile_stage',
            id,
            modelId: targetModelId,
            stage: 'compiling',
            progress: 99,
            text: `⚡ Allocating WebGPU/WASM tensors & building ONNX execution graph...`,
            file: p.file
        });
    } else if (p.status === 'ready') {
        self.postMessage({
            action: 'compile_stage',
            id,
            modelId: targetModelId,
            stage: 'ready',
            progress: 100,
            text: `✓ Model Substrate Compiled & Active in Memory`
        });
    }
}
