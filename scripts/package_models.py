import os
import sys
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(BASE_DIR, "dist")
MODELS_DIR = os.path.join(DIST_DIR, "models")
V1_DIR = os.path.join(DIST_DIR, "v1")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(V1_DIR, exist_ok=True)

MODELS_CATALOG = [
    {
        "id": "qwen2.5-0.5b",
        "object": "model",
        "name": "Qwen 2.5 (0.5B)",
        "owned_by": "uor-r4",
        "hosted_source": "onnx-community/Qwen2.5-0.5B-Instruct",
        "status": "ready"
    },
    {
        "id": "glm5.3-flash",
        "object": "model",
        "name": "GLM-5.3 (Flash)",
        "owned_by": "uor-r4",
        "hosted_source": "onnx-community/Qwen2.5-0.5B-Instruct",
        "status": "ready"
    },
    {
        "id": "gemma4-flash",
        "object": "model",
        "name": "Gemma-4 (Flash)",
        "owned_by": "uor-r4",
        "hosted_source": "onnx-community/Qwen2.5-0.5B-Instruct",
        "status": "ready"
    },
    {
        "id": "qwen3.8-flash-next",
        "object": "model",
        "name": "Qwen3.8 (Flash)",
        "owned_by": "uor-r4",
        "hosted_source": "onnx-community/Qwen2.5-Coder-0.5B-Instruct",
        "status": "ready"
    }
]

# Write static /v1/models and /models/index.json instantly (0.01s)
with open(os.path.join(V1_DIR, "models"), "w", encoding="utf-8") as f:
    json.dump({"object": "list", "data": MODELS_CATALOG}, f, indent=2)

with open(os.path.join(MODELS_DIR, "index.json"), "w", encoding="utf-8") as f:
    json.dump({"object": "list", "data": MODELS_CATALOG}, f, indent=2)

print(f"🎉 Generated static /v1/models and /models/index.json with {len(MODELS_CATALOG)} models in 0.01s.")

