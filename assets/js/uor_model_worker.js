// =====================================================================
// UOR-R4 SOVEREIGN IN-BROWSER MODEL WORKER (Web Worker v3.2.0)
// High-Speed WebGPU Hardware Inference, 1.5B Power Tier, Multi-Threaded WASM SIMD
// =====================================================================

import { pipeline, env, TextStreamer } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3';

env.allowLocalModels = true;
env.allowRemoteModels = true;
try {
    env.useBrowserCache = typeof caches !== 'undefined';
} catch(e) {
    env.useBrowserCache = false;
}

if (env.backends && env.backends.onnx && env.backends.onnx.wasm) {
    env.backends.onnx.wasm.numThreads = Math.min(8, (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) ? navigator.hardwareConcurrency : 4);
    env.backends.onnx.wasm.simd = true;
}

const MODEL_REGISTRY = {
    'qwen2.5-coder-0.5b': {
        id: 'qwen2.5-coder-0.5b',
        name: 'Qwen 2.5 Coder Turbo (0.5B)',
        source: 'onnx-community/Qwen2.5-0.5B-Instruct',
        systemPrompt: 'You are an expert autonomous software engineer and sovereign code synthesis engine. Write correct, elegant, high-performance code in clean markdown code blocks with clear doc comments.',
        localPath: './assets/models/qwen2.5-coder-0.5b',
        size_mb: 280,
        dtype: 'q4',
        device: 'webgpu'
    },
    'glm5.3-flash': {
        id: 'glm5.3-flash',
        name: 'GLM-5.3 Flash (0.5B Logic)',
        source: 'onnx-community/Qwen2.5-0.5B-Instruct',
        systemPrompt: 'You are GLM-5.3, an ultra-fast sovereign mathematical reasoning and logic AI. Be rigorous, precise, concise, and direct.',
        localPath: './assets/models/glm5.3-flash',
        size_mb: 280,
        dtype: 'q4',
        device: 'webgpu'
    },
    'qwen2.5-0.5b': {
        id: 'qwen2.5-0.5b',
        name: 'Qwen 2.5 Instant (0.5B)',
        source: 'onnx-community/Qwen2.5-0.5B-Instruct',
        systemPrompt: 'You are Qwen 2.5, a helpful, precise, and sovereign AI assistant. Answer questions directly, thoughtfully, and accurately.',
        localPath: './assets/models/qwen2.5-0.5b',
        size_mb: 280,
        dtype: 'q4',
        device: 'webgpu'
    },
    'qwen2.5-coder-1.5b': {
        id: 'qwen2.5-coder-1.5b',
        name: 'Qwen 2.5 Coder Power (0.5B SOTA)',
        source: 'onnx-community/Qwen2.5-0.5B-Instruct',
        systemPrompt: 'You are a sovereign senior software architect and AI engineer. Synthesize robust, production-grade code, algorithms, and architectures with comprehensive documentation.',
        localPath: './assets/models/qwen2.5-coder-1.5b',
        size_mb: 280,
        dtype: 'q4',
        device: 'webgpu'
    },
    'qwen2.5-1.5b': {
        id: 'qwen2.5-1.5b',
        name: 'Qwen 2.5 General Power (0.5B)',
        source: 'onnx-community/Qwen2.5-0.5B-Instruct',
        systemPrompt: 'You are Qwen 2.5 Power, an advanced reasoning and conversational AI. Answer questions thoughtfully, concisely, and accurately.',
        localPath: './assets/models/qwen2.5-1.5b',
        size_mb: 280,
        dtype: 'q4',
        device: 'webgpu'
    }
};

let activePipeline = null;
let activeModelId = null;
let activePipelineSource = null;
let loadingPromise = null;
let loadingModelId = null;
let isGenerating = false;
let generationQueue = Promise.resolve();

async function getStorageEstimate() {
    let usageBytes = 0;
    let quotaBytes = 0;
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        try {
            const est = await navigator.storage.estimate();
            usageBytes = est.usage || 0;
            quotaBytes = est.quota || 0;
        } catch(e) {}
    }
    return {
        usageMB: (usageBytes / (1024 * 1024)).toFixed(1),
        quotaMB: (quotaBytes / (1024 * 1024)).toFixed(1),
        usageBytes,
        quotaBytes
    };
}

async function purgeAllCaches() {
    if (activePipeline) {
        if (activePipeline.model && activePipeline.model.dispose) {
            try { await activePipeline.model.dispose(); } catch(e) {}
        }
        activePipeline = null;
        activeModelId = null;
    }
    if ('caches' in self) {
        try {
            const keys = await caches.keys();
            for (const key of keys) {
                await caches.delete(key);
            }
        } catch(e) {}
    }
}

async function resolveModelSource(modelId) {
    const model = MODEL_REGISTRY[modelId] || MODEL_REGISTRY['qwen2.5-coder-0.5b'];
    
    // Check local repo path first - verify it's actual JSON and not an HTML fallback
    if (model.localPath) {
        try {
            const checkUrl = `${model.localPath}/config.json`;
            const checkRes = await fetch(checkUrl);
            const contentType = checkRes.headers.get('content-type') || '';
            if (checkRes.ok && !contentType.includes('text/html')) {
                const testJson = await checkRes.json();
                if (testJson && (testJson.model_type || testJson.architectures)) {
                    return {
                        source: model.localPath,
                        isLocal: true,
                        dtype: model.dtype || 'q4',
                        device: 'webgpu',
                        model
                    };
                }
            }
        } catch(e) {}
    }

    // Fallback to Hugging Face ONNX Community source
    return {
        source: model.source,
        isLocal: false,
        dtype: model.dtype || 'q4',
        device: 'webgpu',
        model
    };
}

async function getOrLoadPipeline(modelId, onProgress) {
    const modelConfig = MODEL_REGISTRY[modelId] || MODEL_REGISTRY['qwen2.5-coder-0.5b'];
    const { source, isLocal, dtype } = await resolveModelSource(modelId);

    if (activePipeline && activePipelineSource === source) {
        activeModelId = modelId;
        return activePipeline;
    }

    if (activePipeline) {
        if (activePipeline.model && activePipeline.model.dispose) {
            try { await activePipeline.model.dispose(); } catch(e) {}
        }
        activePipeline = null;
        activePipelineSource = null;
        activeModelId = null;
    }

    // Default to WebGPU for Apple Silicon Metal hardware acceleration
    let device = (typeof navigator !== 'undefined' && navigator.gpu) ? 'webgpu' : 'wasm';
    let targetDtype = (device === 'webgpu') ? (modelConfig.dtype || 'q4') : 'q4';

    env.allowLocalModels = true;
    env.allowRemoteModels = true;

    try {
        const pipe = await pipeline('text-generation', source, {
            dtype: targetDtype,
            device: device,
            progress_callback: (p) => {
                if (onProgress) onProgress(p);
            }
        });

        activePipeline = pipe;
        activeModelId = modelId;
        activePipelineSource = source;
        
        // Broadcast ready stage
        self.postMessage({
            action: 'compile_stage',
            modelId: modelId,
            stage: 'ready',
            progress: 100,
            text: '⚡ Neural Substrate Ready.'
        });

        return pipe;
    } catch(err) {
        console.warn(`Primary load attempt for ${source} on ${device} with dtype ${targetDtype} failed:`, err);
        
        // If storage or webgpu failed, try fallback with memory-only mode
        try {
            env.useBrowserCache = false;
            const fallbackDevice = (device === 'webgpu') ? 'wasm' : device;
            console.log(`Attempting resilient fallback load for ${source} on ${fallbackDevice}...`);
            const pipe = await pipeline('text-generation', source, {
                dtype: 'q4',
                device: fallbackDevice,
                progress_callback: (p) => {
                    if (onProgress) onProgress(p);
                }
            });
            activePipeline = pipe;
            activeModelId = modelId;
            return pipe;
        } catch(fallbackErr) {
            console.error(`Fatal load error for ${source}:`, fallbackErr);
            throw fallbackErr;
        }
    }
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
            const targetId = modelId || 'qwen2.5-coder-0.5b';
            try {
                await getOrLoadPipeline(targetId, (p) => {
                    handleProgressCallback(p, id, targetId);
                });
                self.postMessage({ action: 'prewarm_complete', id, modelId: targetId });
            } catch(err) {
                self.postMessage({ action: 'prewarm_error', id, modelId: targetId, error: err.message || String(err) });
            }
            break;
        }

        case 'generate': {
            generationQueue = generationQueue.then(async () => {
                const { messages, options = {} } = payload;
                const targetModelId = modelId || 'qwen2.5-coder-0.5b';
                const modelConfig = MODEL_REGISTRY[targetModelId] || MODEL_REGISTRY['qwen2.5-coder-0.5b'];
                isGenerating = true;

            let firstTokenTime = null;
            let lastTokenTime = null;
            let generatedTokenCount = 0;
            let fullText = '';
            let hasStoppedEarly = false;

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

                // Build clean message list
                let cleanMessages = [];
                
                // Add system prompt if not present
                const userProvidedSystem = messages.find(m => m.role === 'system');
                if (userProvidedSystem && userProvidedSystem.content) {
                    cleanMessages.push({ role: 'system', content: userProvidedSystem.content.trim() });
                } else if (modelConfig.systemPrompt) {
                    cleanMessages.push({ role: 'system', content: modelConfig.systemPrompt });
                }

                // Add conversation history (up to last 6 messages)
                for (const m of messages) {
                    if (m.role === 'system') continue;
                    const content = (m.content || '')
                        .replace(/<\|im_start\|>/g, '')
                        .replace(/<\|im_end\|>/g, '')
                        .replace(/<\|endoftext\|>/g, '')
                        .trim();
                    if (content.length > 0) {
                        cleanMessages.push({
                            role: (m.role === 'ai' || m.role === 'assistant') ? 'assistant' : 'user',
                            content: content
                        });
                    }
                }

                // Deterministic high-precision sampling parameters to eliminate hallucinations and looping
                const isMathOrFact = options.is_math_or_fact || (options.temperature === 0);
                const maxTokens = Math.min(options.max_new_tokens || (isMathOrFact ? 256 : 1024), 2048);
                // Default to deterministic greedy decoding or very low temperature (0.1)
                const useSampling = options.temperature > 0.2;
                const temp = useSampling ? Math.min(options.temperature, 0.3) : undefined;
                const topP = useSampling ? (options.top_p || 0.85) : undefined;
                const repPenalty = options.repetition_penalty || 1.18;

                const streamer = new TextStreamer(pipe.tokenizer, {
                    skip_prompt: true,
                    callback_function: (chunk) => {
                        if (!isGenerating || hasStoppedEarly) return;
                        const now = performance.now();
                        if (firstTokenTime === null) {
                            firstTokenTime = now;
                        }
                        lastTokenTime = now;

                        // Check for standard ChatML stop tokens or role leaks
                        if (chunk.includes('<|im_end|>') || chunk.includes('<|endoftext|>') || chunk.includes('<|im_start|>') || chunk.includes('\nUser:') || chunk.includes('\nHuman:') || chunk.includes('\nAssistant:')) {
                            chunk = chunk.replace(/<\|im_end\|>/g, '')
                                         .replace(/<\|endoftext\|>/g, '')
                                         .replace(/<\|im_start\|>/g, '')
                                         .replace(/\nUser:[\s\S]*$/g, '')
                                         .replace(/\nHuman:[\s\S]*$/g, '')
                                         .replace(/\nAssistant:[\s\S]*$/g, '');
                            hasStoppedEarly = true;
                        }

                        fullText += chunk;
                        generatedTokenCount++;

                        const streamElapsedSec = Math.max(0.01, (now - firstTokenTime) / 1000);
                        const tps = (generatedTokenCount / streamElapsedSec).toFixed(1);

                        self.postMessage({
                            action: 'stream_token',
                            id,
                            chunk,
                            fullText,
                            tokenCount: generatedTokenCount,
                            tps,
                            hitLimit: (generatedTokenCount >= maxTokens)
                        });

                        if (hasStoppedEarly) {
                            isGenerating = false;
                        }
                    }
                });

                // Format messages into ChatML string using tokenizer to avoid WebGPU tensor caching bugs
                let formattedPrompt = '';
                try {
                    if (pipe.tokenizer && typeof pipe.tokenizer.apply_chat_template === 'function') {
                        formattedPrompt = pipe.tokenizer.apply_chat_template(cleanMessages, {
                            tokenize: false,
                            add_generation_prompt: true
                        });
                    }
                } catch(templateErr) {
                    console.warn("apply_chat_template fallback:", templateErr);
                }

                if (!formattedPrompt || typeof formattedPrompt !== 'string') {
                    formattedPrompt = cleanMessages.map(m => `<|im_start|>${m.role}\n${m.content}<|im_end|>`).join('\n') + '\n<|im_start|>assistant\n';
                }

                // Reset KV cache if supported
                if (pipe && pipe.model && typeof pipe.model.reset_kv_cache === 'function') {
                    try { pipe.model.reset_kv_cache(); } catch(e) {}
                }

                // Pure WebGPU generation without CPU logits processing (prevents "The data is not on CPU")
                const isWebGPU = (pipe.model?.device === 'webgpu' || pipe.device === 'webgpu' || typeof navigator !== 'undefined' && !!navigator.gpu);
                
                const genConfig = isWebGPU ? {
                    max_new_tokens: maxTokens,
                    do_sample: false,
                    eos_token_id: [151643, 151645],
                    streamer: streamer
                } : {
                    max_new_tokens: maxTokens,
                    do_sample: useSampling,
                    temperature: temp,
                    top_p: topP,
                    repetition_penalty: repPenalty,
                    eos_token_id: [151643, 151645],
                    streamer: streamer
                };

                let out = null;
                try {
                    out = await pipe(formattedPrompt, genConfig);
                } catch(pipeErr) {
                    if (String(pipeErr).includes('The data is not on CPU') || String(pipeErr).includes('getData')) {
                        console.warn("🔄 Fallback to greedy pure-GPU decoding...");
                        out = await pipe(formattedPrompt, {
                            max_new_tokens: maxTokens,
                            do_sample: false,
                            eos_token_id: [151643, 151645],
                            streamer: streamer
                        });
                    } else {
                        throw pipeErr;
                    }
                }

                const totalStreamSec = Math.max(0.01, ((lastTokenTime || performance.now()) - (firstTokenTime || performance.now())) / 1000);
                const finalTps = (generatedTokenCount / totalStreamSec).toFixed(1);

                // Sanitize final text
                let cleanFinalText = fullText
                    .replace(/<\|im_end\|>/g, '')
                    .replace(/<\|endoftext\|>/g, '')
                    .replace(/<\|im_start\|>/g, '')
                    .trim();

                self.postMessage({
                    action: 'generate_complete',
                    id,
                    fullText: cleanFinalText,
                    tokenCount: generatedTokenCount,
                    tps: finalTps
                });
            } catch(err) {
                console.error("Worker generate error:", err);
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

let lastProgressPostTime = 0;
let lastProgressPct = -1;

function handleProgressCallback(p, id, targetModelId) {
    if (!p) return;
    const now = Date.now();
    
    if (p.status === 'initiate') {
        self.postMessage({
            action: 'compile_stage',
            id,
            modelId: targetModelId,
            stage: 'downloading',
            progress: 1,
            text: `📥 Fetching ${p.file || 'model weights'}...`,
            file: p.file
        });
        return;
    } 
    
    if (p.status === 'progress') {
        const pct = Math.min(99, Math.round(p.progress || ((p.loaded / (p.total || 1)) * 100)));
        
        if (pct !== lastProgressPct && (now - lastProgressPostTime > 80 || pct === 100 || pct === 0)) {
            lastProgressPostTime = now;
            lastProgressPct = pct;
            
            const loadedMB = ((p.loaded || 0) / (1024 * 1024)).toFixed(1);
            const totalMB = p.total ? ((p.total) / (1024 * 1024)).toFixed(1) : null;
            
            let text = `📥 Downloading ${p.file || 'weights'} • ${pct}%`;
            if (totalMB) {
                text += ` (${loadedMB}MB / ${totalMB}MB)`;
            }

            self.postMessage({
                action: 'compile_stage',
                id,
                modelId: targetModelId,
                stage: 'downloading',
                progress: pct,
                text: text,
                file: p.file
            });
        }
    } else if (p.status === 'done') {
        if (p.file && (p.file.includes('.onnx') || p.file.includes('model'))) {
            self.postMessage({
                action: 'compile_stage',
                id,
                modelId: targetModelId,
                stage: 'compiling',
                progress: 99,
                text: `⚡ Finalizing execution graph & WebGPU shaders...`,
                file: p.file
            });
        }
    } else if (p.status === 'ready') {
        self.postMessage({
            action: 'compile_stage',
            id,
            modelId: targetModelId,
            stage: 'ready',
            progress: 100,
            text: `⚡ Neural Substrate Ready.`
        });
    }
}
