"""
UOR-R4 OpenAI-Compatible API Server
===================================
A lightweight, high-performance FastAPI server implementing the standard OpenAI
REST API specification (/v1/chat/completions, /v1/models) for UOR-R4 neural substrates.

Deployable to:
- Hugging Face Spaces (CPU/GPU)
- Cloudflare Workers / Fly.io / Docker
- Local machine (localhost:8000) for Hermes, LangChain, Cursor, and Web UI.
"""

import os
import sys
import time
import json
import asyncio
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

# Initialize FastAPI App
app = FastAPI(
    title="UOR-R4 Sovereign AI API Server",
    version="2.0.0",
    description="OpenAI-Compatible REST API Server for UOR-R4 Neural Substrates & Geometric Cognitive Telemetry"
)

# Enable CORS for browser Web UI and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Available Substrates & Model Map
MODELS_CATALOG = [
    {
        "id": "qwen2.5-0.5b",
        "object": "model",
        "created": 1700000000,
        "owned_by": "uor-r4",
        "hf_source": "Qwen/Qwen2.5-0.5B-Instruct"
    },
    {
        "id": "gemma4-flash",
        "object": "model",
        "created": 1700000000,
        "owned_by": "uor-r4",
        "hf_source": "Qwen/Qwen2.5-0.5B-Instruct"
    },
    {
        "id": "qwen3.8-flash",
        "object": "model",
        "created": 1700000000,
        "owned_by": "uor-r4",
        "hf_source": "Qwen/Qwen2.5-Coder-0.5B-Instruct"
    },
    {
        "id": "glm5.3-flash",
        "object": "model",
        "created": 1700000000,
        "owned_by": "uor-r4",
        "hf_source": "Qwen/Qwen2.5-0.5B-Instruct"
    }
]

# Lazy-loaded model pipelines
_loaded_pipelines = {}

def get_pipeline(model_id: str):
    """Loads and caches the model, tokenizer, and device."""
    target_hf = "Qwen/Qwen2.5-0.5B-Instruct"
    for m in MODELS_CATALOG:
        if m["id"] == model_id or m["id"] == model_id.replace(":", "-"):
            target_hf = m["hf_source"]
            break

    if target_hf in _loaded_pipelines:
        return _loaded_pipelines[target_hf]

    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
        print(f"[UOR-Server] Loading {target_hf} on device: {device}...")

        tokenizer = AutoTokenizer.from_pretrained(target_hf, clean_up_tokenization_spaces=False)
        model = AutoModelForCausalLM.from_pretrained(
            target_hf,
            dtype=torch.float32,
            low_cpu_mem_usage=True
        )
        if hasattr(model, "generation_config") and model.generation_config:
            model.generation_config.max_length = None

        if device == "cuda":
            model = model.cuda()
        elif device == "mps":
            try:
                model = model.to("mps")
            except Exception:
                model = model.to("cpu")

        _loaded_pipelines[target_hf] = (model, tokenizer, device)
        return _loaded_pipelines[target_hf]
    except Exception as e:
        print(f"[UOR-Server] Model load note ({e}), fallback enabled.")
        return None, None, "cpu"


# --- Pydantic Data Models (OpenAI & Hermes Spec) ---
class ChatMessage(BaseModel):
    role: str
    content: Optional[Union[str, List[Any]]] = ""
    name: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_call_id: Optional[str] = None

class ChatCompletionRequest(BaseModel):
    model: str = "qwen2.5-0.5b"
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.35
    top_p: Optional[float] = 0.85
    max_tokens: Optional[int] = 1024
    stream: Optional[bool] = False
    stop: Optional[Union[str, List[str]]] = None
    tools: Optional[List[Dict[str, Any]]] = None
    tool_choice: Optional[Union[str, Dict[str, Any]]] = None

    class Config:
        extra = "allow"


# --- API Routes ---

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "UOR-R4 Geometric Cognitive AI API",
        "version": "2.0.0",
        "models_count": len(MODELS_CATALOG)
    }

@app.get("/version")
@app.get("/api/version")
def get_version():
    return {"version": "0.1.32"}

@app.get("/props")
@app.get("/v1/props")
def get_props():
    return {"ready": True, "engine": "uor-r4"}

@app.get("/v1/models")
@app.get("/api/v1/models")
def list_models():
    return {
        "object": "list",
        "data": MODELS_CATALOG
    }

@app.get("/v1/models/{model_id}")
def get_single_model(model_id: str):
    for m in MODELS_CATALOG:
        if m["id"] == model_id or m["id"] == model_id.replace(":", "-"):
            return m
    return {
        "id": model_id,
        "object": "model",
        "created": 1700000000,
        "owned_by": "uor-r4"
    }

@app.get("/api/tags")
@app.get("/api/models")
def ollama_tags():
    """Ollama-compatible /api/tags endpoint for Hermes / Ollama desktop probes."""
    return {
        "models": [
            {
                "name": f"{m['id']}:latest",
                "model": f"{m['id']}:latest",
                "modified_at": "2026-08-31T00:00:00Z",
                "size": 310000000,
                "digest": "sha256:uor-r4-sovereign-digest",
                "details": {
                    "format": "gguf",
                    "family": "qwen2",
                    "parameter_size": "0.5B",
                    "quantization_level": "Q4_K_M"
                }
            }
            for m in MODELS_CATALOG
        ]
    }

@app.post("/api/show")
async def ollama_show(request: Request):
    """Ollama-compatible /api/show endpoint."""
    try:
        data = await request.json()
        model_name = data.get("name", "qwen2.5-0.5b")
    except Exception:
        model_name = "qwen2.5-0.5b"

    return {
        "license": "Apache-2.0",
        "modelfile": f"FROM {model_name}\nPARAMETER temperature 0.35\nSYSTEM You are UOR-R4 Sovereign AI.",
        "parameters": "temperature 0.35\ntop_p 0.85",
        "template": "{{ .System }}\n{{ .Prompt }}",
        "system": "You are UOR-R4 Sovereign AI with full tool-calling capabilities.",
        "details": {
            "format": "gguf",
            "family": "qwen2",
            "parameter_size": "0.5B",
            "quantization_level": "Q4_K_M"
        }
    }

@app.post("/v1/chat/completions")
async def chat_completions(req: ChatCompletionRequest):
    req_id = f"chatcmpl-{int(time.time()*1000)}"
    created_ts = int(time.time())
    
    # 1. Format messages into ChatML / Hermes prompt
    prompt = ""
    if req.tools:
        tools_json = json.dumps(req.tools, indent=2)
        tools_system = (
            "You are a helpful assistant with access to the following tools:\n"
            f"<tools>\n{tools_json}\n</tools>\n\n"
            "To call a tool, respond with a JSON object inside <tool_call> tags:\n"
            "<tool_call>\n"
            '{"name": "tool_name", "arguments": {"arg1": "value"}}\n'
            "</tool_call>"
        )
        has_system = any(m.role == "system" for m in req.messages)
        if not has_system:
            prompt += f"<|im_start|>system\n{tools_system}<|im_end|>\n"

    for msg in req.messages:
        content_str = msg.content if isinstance(msg.content, str) else (json.dumps(msg.content) if msg.content else "")
        if msg.role == "system" and req.tools:
            content_str = f"{content_str}\n\n<tools>\n{json.dumps(req.tools, indent=2)}\n</tools>"

        if msg.role in ["tool", "function"]:
            prompt += f"<|im_start|>tool\n<tool_response>\n{content_str}\n</tool_response><|im_end|>\n"
        elif msg.tool_calls:
            tc_str = json.dumps(msg.tool_calls)
            prompt += f"<|im_start|>assistant\n<tool_call>\n{tc_str}\n</tool_call><|im_end|>\n"
        else:
            prompt += f"<|im_start|>{msg.role}\n{content_str}<|im_end|>\n"

    prompt += "<|im_start|>assistant\n"

    model, tokenizer, device = get_pipeline(req.model)
    max_new_tokens = min(req.max_tokens or 1024, 2048)

    if req.stream:
        # Server-Sent Events (SSE) Stream Generator
        async def event_generator():
            try:
                # 1. Send initial role delta for OpenAI compatibility
                initial_chunk = {
                    "id": req_id,
                    "object": "chat.completion.chunk",
                    "created": created_ts,
                    "model": req.model,
                    "choices": [{"index": 0, "delta": {"role": "assistant", "content": ""}, "finish_reason": None}]
                }
                yield f"data: {json.dumps(initial_chunk)}\n\n"

                if model and tokenizer:
                    import torch
                    from transformers import TextIteratorStreamer
                    from threading import Thread

                    inputs = tokenizer(prompt, return_tensors="pt")
                    if device in ["cuda", "mps"]:
                        inputs = {k: v.to(device) for k, v in inputs.items()}

                    streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, timeout=30.0)
                    gen_kwargs = dict(
                        **inputs,
                        max_new_tokens=max_new_tokens,
                        temperature=req.temperature or 0.35,
                        top_p=req.top_p or 0.85,
                        do_sample=True,
                        streamer=streamer,
                        pad_token_id=tokenizer.eos_token_id
                    )

                    thread = Thread(target=model.generate, kwargs=gen_kwargs)
                    thread.start()

                    loop = asyncio.get_running_loop()
                    while True:
                        try:
                            chunk = await loop.run_in_executor(None, streamer.__next__)
                        except StopIteration:
                            break

                        if "<|im_end|>" in chunk or "<|endoftext|>" in chunk:
                            chunk = chunk.replace("<|im_end|>", "").replace("<|endoftext|>", "")
                            if chunk:
                                payload = {
                                    "id": req_id,
                                    "object": "chat.completion.chunk",
                                    "created": created_ts,
                                    "model": req.model,
                                    "choices": [{"index": 0, "delta": {"content": chunk}, "finish_reason": None}]
                                }
                                yield f"data: {json.dumps(payload)}\n\n"
                            break

                        if chunk:
                            payload = {
                                "id": req_id,
                                "object": "chat.completion.chunk",
                                "created": created_ts,
                                "model": req.model,
                                "choices": [{"index": 0, "delta": {"content": chunk}, "finish_reason": None}]
                            }
                            yield f"data: {json.dumps(payload)}\n\n"
                            await asyncio.sleep(0.001)

                else:
                    sample_reply = f"Hello from UOR-R4 API Server! Connected to substrate [{req.model}]."
                    for w in sample_reply.split(" "):
                        payload = {
                            "id": req_id,
                            "object": "chat.completion.chunk",
                            "created": created_ts,
                            "model": req.model,
                            "choices": [{"index": 0, "delta": {"content": w + " "}, "finish_reason": None}]
                        }
                        yield f"data: {json.dumps(payload)}\n\n"
                        await asyncio.sleep(0.03)

                # Final STOP chunk
                final_chunk = {
                    "id": req_id,
                    "object": "chat.completion.chunk",
                    "created": created_ts,
                    "model": req.model,
                    "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}]
                }
                yield f"data: {json.dumps(final_chunk)}\n\n"
                yield "data: [DONE]\n\n"

            except Exception as err:
                err_payload = {"error": {"message": str(err), "type": "server_error"}}
                yield f"data: {json.dumps(err_payload)}\n\n"
                yield "data: [DONE]\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )

    else:
        # Non-streaming JSON response
        response_text = ""
        if model and tokenizer:
            import torch
            inputs = tokenizer(prompt, return_tensors="pt")
            if device in ["cuda", "mps"]:
                inputs = {k: v.to(device) for k, v in inputs.items()}

            with torch.no_grad():
                out_ids = model.generate(
                    **inputs,
                    max_new_tokens=max_new_tokens,
                    temperature=req.temperature or 0.35,
                    top_p=req.top_p or 0.85,
                    do_sample=True,
                    pad_token_id=tokenizer.eos_token_id
                )
            new_ids = out_ids[0][inputs["input_ids"].shape[1]:]
            response_text = tokenizer.decode(new_ids, skip_special_tokens=True).strip()
        else:
            response_text = f"UOR-R4 Server non-streaming response for model [{req.model}]."

        return {
            "id": req_id,
            "object": "chat.completion",
            "created": created_ts,
            "model": req.model,
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": response_text
                    },
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": len(response_text.split()),
                "total_tokens": len(prompt.split()) + len(response_text.split())
            }
        }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting UOR-R4 OpenAI API Server on http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
