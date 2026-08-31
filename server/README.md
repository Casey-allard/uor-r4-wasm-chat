# ⚡ UOR-R4 OpenAI-Compatible API Server

A lightweight, production-ready FastAPI server implementing standard OpenAI REST endpoints (`/v1/chat/completions`, `/v1/models`) with real-time Server-Sent Events (SSE) token streaming.

---

## 🚀 1-Click Deployment to Hugging Face Spaces (Free Cloud Hosting)

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Select **Docker** (Blank) or **FastAPI** as the Space SDK.
3. Choose the **Free CPU** (or ZeroGPU/T4 GPU) hardware tier.
4. Upload `app.py`, `requirements.txt`, and `Dockerfile` from this directory.
5. Your public endpoint will be live at:
   `https://<your-username>-<space-name>.hf.space/v1`

---

## 💻 Running Locally

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the server
python app.py
```
The server will be running on `http://localhost:8000`.

---

## 🧪 Testing with curl or Python OpenAI SDK

### Query via curl:
```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm5.3-flash",
    "messages": [{"role": "user", "content": "Explain E8 geometric attention."}],
    "stream": true
  }'
```

### Query via Python OpenAI SDK:
```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="uor-local")

response = client.chat.completions.create(
    model="glm5.3-flash",
    messages=[{"role": "user", "content": "Explain 8D Gosset lattice geometry."}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
print()
```
