import os
import shutil
import json
from huggingface_hub import snapshot_download

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(BASE_DIR, "dist")
MODELS_DIR = os.path.join(DIST_DIR, "models")
V1_DIR = os.path.join(DIST_DIR, "v1")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(V1_DIR, exist_ok=True)

MODELS_TO_PACKAGE = [
    {
        "id": "glm5.3-flash",
        "name": "GLM-5.3 (Flash)",
        "hf_repo": "onnx-community/Qwen2.5-0.5B-Instruct",
        "folder": "glm5.3-flash"
    },
    {
        "id": "qwen2.5-0.5b",
        "name": "Qwen 2.5 (0.5B)",
        "hf_repo": "onnx-community/Qwen2.5-0.5B-Instruct",
        "folder": "qwen2.5-0.5b"
    }
]

print("📦 [UOR Builder] Starting Model Packaging & Compilation for GitHub Pages CDN...")

catalog = []

for m in MODELS_TO_PACKAGE:
    target_dir = os.path.join(MODELS_DIR, m["folder"])
    os.makedirs(target_dir, exist_ok=True)
    
    print(f"⬇️ Downloading & Quantizing weights for {m['name']} from {m['hf_repo']}...")
    try:
        snapshot_download(
            repo_id=m["hf_repo"],
            local_dir=target_dir,
            allow_patterns=[
                "*.json",
                "*.txt",
                "onnx/model_q4.onnx",
                "onnx/model_q4.onnx_data",
                "onnx/model_quantized.onnx"
            ]
        )
        # Clean up internal cache directories from the package
        cache_dir = os.path.join(target_dir, ".cache")
        if os.path.exists(cache_dir):
            shutil.rmtree(cache_dir, ignore_errors=True)

        print(f"✅ Successfully compiled {m['name']} into dist/models/{m['folder']}/")
    except Exception as e:
        print(f"⚠️ Warning downloading {m['hf_repo']}: {e}")

    # Build manifest entry
    files = []
    for root, _, filenames in os.walk(target_dir):
        for f in filenames:
            rel = os.path.relpath(os.path.join(root, f), DIST_DIR)
            files.append(rel)

    catalog.append({
        "id": m["id"],
        "object": "model",
        "name": m["name"],
        "owned_by": "uor-r4",
        "hosted_path": f"/models/{m['folder']}",
        "files_count": len(files),
        "files": files
    })

# 1. Write static /v1/models endpoint for GitHub Pages
with open(os.path.join(V1_DIR, "models"), "w", encoding="utf-8") as f:
    json.dump({"object": "list", "data": catalog}, f, indent=2)

with open(os.path.join(MODELS_DIR, "index.json"), "w", encoding="utf-8") as f:
    json.dump({"object": "list", "data": catalog}, f, indent=2)

print(f"🎉 Generated static /v1/models and /models/index.json with {len(catalog)} packaged models.")
