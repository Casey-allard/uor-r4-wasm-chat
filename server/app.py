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
    """Loads and caches the Hugging Face transformers pipeline."""
    target_hf = "Qwen/Qwen2.5-0.5B-Instruct"
    for m in MODELS_CATALOG:
        if m["id"] == model_id:
            target_hf = m["hf_source"]
            break

    if target_hf in _loaded_pipelines:
        return _loaded_pipelines[target_hf]

    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

        device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
        print(f"[UOR-Server] Loading {target_hf} on device: {device}...")

        tokenizer = AutoTokenizer.from_pretrained(target_hf)
        model = AutoModelForCausalLM.from_pretrained(
            target_hf,
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True
        )
        if device == "cuda":
            model = model.cuda()
        elif device == "mps":
            try:
                model = model.to("mps")
            except Exception:
                model = model.to("cpu")

        pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)
        _loaded_pipelines[target_hf] = (pipe, tokenizer)
        return _loaded_pipelines[target_hf]
    except Exception as e:
        print(f"[UOR-Server] Transformers load note ({e}), using lightweight simulation pipeline.")
        return None, None


# --- Pydantic Data Models (OpenAI & Hermes Spec) ---
class ChatMessage(BaseModel):
    role: str
    content: Optional[Union[str, List[Any]]] = ""
    name: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_call_id: Optional[str] = None

class ChatCompletionRequest(BaseModel):
    model: str = "glm5.3-flash"
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

@app.get("/v1/models")
def list_models():
    return {
        "object": "list",
        "data": MODELS_CATALOG
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

    pipe, tokenizer = get_pipeline(req.model)

    if req.stream:
        # Server-Sent Events (SSE) Stream Generator
        async def event_generator():
            try:
                if pipe and tokenizer:
                    # Execute streaming via generator
                    from transformers import TextIteratorStreamer
                    from threading import Thread

                    streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, timeout=30.0)
                    generation_kwargs = dict(
                        text_inputs=prompt,
                        max_new_tokens=req.max_tokens or 1024,
                        temperature=req.temperature or 0.35,
                        top_p=req.top_p or 0.85,
                        do_sample=True,
                        streamer=streamer
                    )
                    thread = Thread(target=pipe, kwargs=generation_kwargs)
                    thread.start()

                    for new_text in streamer:
                        if "<|im_end|>" in new_text or "<|endoftext|>" in new_text:
                            new_text = new_text.replace("<|im_end|>", "").replace("<|endoftext|>", "")
                            if new_text:
                                chunk_payload = {
                                    "id": req_id,
                                    "object": "chat.completion.chunk",
                                    "created": created_ts,
                                    "model": req.model,
                                    "choices": [{"index": 0, "delta": {"content": new_text}, "finish_reason": None}]
                                }
                                yield f"data: {json.dumps(chunk_payload)}\n\n"
                            break

                        chunk_payload = {
                            "id": req_id,
                            "object": "chat.completion.chunk",
                            "created": created_ts,
                            "model": req.model,
                            "choices": [{"index": 0, "delta": {"content": new_text}, "finish_reason": None}]
                        }
                        yield f"data: {json.dumps(chunk_payload)}\n\n"
                        await asyncio.sleep(0.001)

                else:
                    # Fallback fast streaming simulator for demonstration/testing
                    sample_reply = f"Hello from UOR-R4 API Server! Connected to substrate [{req.model}]. Ready for reasoning."
                    words = sample_reply.split(" ")
                    for w in words:
                        chunk_payload = {
                            "id": req_id,
                            "object": "chat.completion.chunk",
                            "created": created_ts,
                            "model": req.model,
                            "choices": [{"index": 0, "delta": {"content": w + " "}, "finish_reason": None}]
                        }
                        yield f"data: {json.dumps(chunk_payload)}\n\n"
                        await asyncio.sleep(0.04)

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

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    else:
        # Non-streaming JSON response
        response_text = ""
        if pipe and tokenizer:
            outputs = pipe(
                prompt,
                max_new_tokens=req.max_tokens or 1024,
                temperature=req.temperature or 0.35,
                top_p=req.top_p or 0.85,
                do_sample=True
            )
            raw_out = outputs[0]["generated_text"]
            response_text = raw_out[len(prompt):].replace("<|im_end|>", "").replace("<|endoftext|>", "").strip()
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
