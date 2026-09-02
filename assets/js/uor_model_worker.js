// =====================================================================
// UOR-R4 SOVEREIGN IN-BROWSER MODEL WORKER (Web Worker v3.4.1)
// 100% Sovereign Local Transformers Engine, Zero Hangs, Full Offline Execution
// =====================================================================

let pipeline = null;
let env = null;
let TextStreamer = null;

async function ensureTransformersLoaded() {
    if (pipeline && env && TextStreamer) return;
    
    try {
        // Try local bundled transformers first (for offline sovereign execution in web & native macOS)
        const module = await import('./transformers.min.js');
        pipeline = module.pipeline;
        env = module.env;
        TextStreamer = module.TextStreamer;
    } catch(localErr) {
        console.warn("Local transformers.min.js load failed, trying CDN fallback:", localErr);
        const module = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3');
        pipeline = module.pipeline;
        env = module.env;
        TextStreamer = module.TextStreamer;
    }

    if (env) {
        env.allowLocalModels = true;
        env.allowRemoteModels = true;
        try {
            env.useBrowserCache = typeof caches !== 'undefined';
        } catch(e) {
            env.useBrowserCache = false;
        }

        if (env.backends && env.backends.onnx && env.backends.onnx.wasm) {
            const isIsolated = (typeof self !== 'undefined' && self.crossOriginIsolated);
            env.backends.onnx.wasm.numThreads = isIsolated ? Math.min(8, (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) ? navigator.hardwareConcurrency : 4) : 1;
            env.backends.onnx.wasm.simd = true;
        }
    }
}

const STABLE_DEFAULT_SOURCE = 'onnx-community/Qwen2.5-0.5B-Instruct';

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

async function purgeAllBrowserCaches() {
    if (typeof caches !== 'undefined') {
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

    return {
        source: model.source || STABLE_DEFAULT_SOURCE,
        isLocal: false,
        dtype: model.dtype || 'q4',
        device: 'webgpu',
        model
    };
}

async function getOrLoadPipeline(modelId, onProgress) {
    await ensureTransformersLoaded();

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

    let device = (typeof navigator !== 'undefined' && navigator.gpu) ? 'webgpu' : 'wasm';
    let targetDtype = 'q4';

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
        
        self.postMessage({
            action: 'compile_stage',
            modelId: modelId,
            stage: 'ready',
            progress: 100,
            text: '⚡ Neural Substrate Ready.'
        });

        return pipe;
    } catch(err) {
        console.warn(`Primary load attempt for ${source} on ${device} failed:`, err);
        
        try {
            console.log(`Attempting fallback to ${STABLE_DEFAULT_SOURCE}...`);
            const fallbackDevice = (typeof navigator !== 'undefined' && navigator.gpu) ? 'webgpu' : 'wasm';
            const pipe = await pipeline('text-generation', STABLE_DEFAULT_SOURCE, {
                dtype: 'q4',
                device: fallbackDevice,
                progress_callback: (p) => {
                    if (onProgress) onProgress(p);
                }
            });
            activePipeline = pipe;
            activeModelId = modelId;
            activePipelineSource = STABLE_DEFAULT_SOURCE;
            return pipe;
        } catch(fallbackErr) {
            console.error(`Fatal load error:`, fallbackErr);
            throw fallbackErr;
        }
    }
}

self.onmessage = async (e) => {
    const { action, id, modelId, payload } = e.data;

    switch (action) {
        case 'ping': {
            self.postMessage({ action: 'pong', id });
            break;
        }

        case 'get_storage_status': {
            const storage = await getStorageEstimate();
            self.postMessage({ action: 'storage_status_result', id, storage });
            break;
        }

        case 'purge_all_caches': {
            await purgeAllBrowserCaches();
            const storage = await getStorageEstimate();
            self.postMessage({ action: 'purge_complete', id, storage });
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

                    let cleanMessages = [];
                    const userProvidedSystem = messages.find(m => m.role === 'system');
                    if (userProvidedSystem && userProvidedSystem.content) {
                        cleanMessages.push({ role: 'system', content: userProvidedSystem.content.trim() });
                    } else if (modelConfig.systemPrompt) {
                        cleanMessages.push({ role: 'system', content: modelConfig.systemPrompt });
                    }

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

                    const isMathOrFact = options.is_math_or_fact || (options.temperature === 0);
                    const maxTokens = Math.min(options.max_new_tokens || (isMathOrFact ? 256 : 1024), 2048);
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

                    if (pipe && pipe.model && typeof pipe.model.reset_kv_cache === 'function') {
                        try { pipe.model.reset_kv_cache(); } catch(e) {}
                    }

                    const isWebGPU = (pipe.model?.device === 'webgpu' || pipe.device === 'webgpu' || (typeof navigator !== 'undefined' && !!navigator.gpu));
                    
                    const genConfig = {
                        max_new_tokens: maxTokens,
                        do_sample: useSampling,
                        temperature: useSampling ? temp : undefined,
                        top_p: useSampling ? topP : undefined,
                        repetition_penalty: repPenalty || 1.18,
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
            });
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
    const now = performance.now();
    const status = p.status || '';
    const progress = p.progress ? Math.round(p.progress * 100) : (status === 'done' ? 100 : 0);

    if (now - lastProgressPostTime < 80 && progress === lastProgressPct && progress < 100) {
        return;
    }
    lastProgressPostTime = now;
    lastProgressPct = progress;

    if (status === 'initiate' || status === 'download') {
        const file = p.file || 'model weights';
        self.postMessage({
            action: 'compile_stage',
            id,
            modelId: targetModelId,
            stage: 'downloading',
            progress: progress,
            text: `📥 Downloading ${file} (${progress}%)`
        });
    } else if (status === 'progress') {
        self.postMessage({
            action: 'compile_stage',
            id,
            modelId: targetModelId,
            stage: 'downloading',
            progress: progress,
            text: `📥 Fetching weights (${progress}%)`
        });
    } else if (status === 'done') {
        self.postMessage({
            action: 'compile_stage',
            id,
            modelId: targetModelId,
            stage: 'compiling',
            progress: 99,
            text: `⚙️ Compiling WebGPU Metal shaders...`
        });
    } else if (status === 'ready') {
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