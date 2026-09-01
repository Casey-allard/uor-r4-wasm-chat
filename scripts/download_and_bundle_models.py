#!/usr/bin/env python3
"""
UOR-R4 Sovereign Model Downloader & Bundler
Downloads and packages ONNX weights directly into the local repo (assets/models/)
for 100% sovereign, self-hosted, offline in-browser execution.
"""

import os
import sys
import urllib.request
import json

MODELS = {
    "glm5.3-flash": {
        "repo": "onnx-community/Qwen2.5-0.5B-Instruct",
        "files": [
            "config.json",
            "generation_config.json",
            "tokenizer.json",
            "tokenizer_config.json",
            "onnx/model_q4.onnx"
        ]
    },
    "qwen2.5-coder-1.5b": {
        "repo": "onnx-community/Qwen2.5-Coder-1.5B-Instruct",
        "files": [
            "config.json",
            "generation_config.json",
            "tokenizer.json",
            "tokenizer_config.json",
            "onnx/model_q4.onnx"
        ]
    },
    "deepseek-r1-1.5b": {
        "repo": "onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX",
        "files": [
            "config.json",
            "generation_config.json",
            "tokenizer.json",
            "tokenizer_config.json",
            "onnx/model_q4.onnx"
        ]
    }
}

def download_model(model_id, target_dir):
    if model_id not in MODELS:
        print(f"Unknown model: {model_id}. Available: {list(MODELS.keys())}")
        return

    meta = MODELS[model_id]
    dest = os.path.join(target_dir, model_id)
    os.makedirs(dest, exist_ok=True)
    os.makedirs(os.path.join(dest, "onnx"), exist_ok=True)

    print(f"📦 Downloading {model_id} from {meta['repo']} -> {dest}...")

    for fname in meta["files"]:
        url = f"https://huggingface.co/{meta['repo']}/resolve/main/{fname}"
        out_path = os.path.join(dest, fname)
        
        if os.path.exists(out_path):
            print(f"  ✓ {fname} already present ({os.path.getsize(out_path)} bytes)")
            continue

        print(f"  📥 Fetching {fname} from {url}...")
        try:
            urllib.request.urlretrieve(url, out_path)
            print(f"  ✓ Saved {fname} ({os.path.getsize(out_path)} bytes)")
        except Exception as e:
            print(f"  ❌ Error downloading {fname}: {e}")

if __name__ == "__main__":
    base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "models")
    target = sys.argv[1] if len(sys.argv) > 1 else "glm5.3-flash"
    
    if target == "all":
        for m in MODELS:
            download_model(m, base_dir)
    else:
        download_model(target, base_dir)
