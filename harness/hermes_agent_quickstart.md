# ⚡ Connecting Nous Research `hermes-agent` to UOR-R4 Local Server

You can use the official **[Nous Research Hermes-Agent](https://github.com/nousresearch/hermes-agent)** framework locally with your UOR-R4 server serving the `glm5.3-flash` (or Qwen) weights!

---

## 🚀 3-Step Setup

### 1. Start Your Local UOR-R4 API Server
```bash
# In the uor-r4-project root:
server/.venv/bin/python server/app.py
```
Your server will be live on `http://127.0.0.1:8000/v1`.

---

### 2. Clone and Setup `hermes-agent`
```bash
git clone https://github.com/nousresearch/hermes-agent.git
cd hermes-agent
pip install -r requirements.txt
```

---

### 3. Run `hermes-agent` Pointing to UOR-R4

Set the environment variables so `hermes-agent` connects to your local endpoint:

```bash
export OPENAI_BASE_URL="http://127.0.0.1:8000/v1"
export OPENAI_API_KEY="uor-local"
export MODEL_NAME="glm5.3-flash"

# Run hermes-agent interactive CLI:
python -m hermes_agent.cli --model glm5.3-flash --base-url http://127.0.0.1:8000/v1
```

Or execute direct agent tasks in Python:
```python
from hermes_agent import HermesAgent

agent = HermesAgent(
    model="glm5.3-flash",
    base_url="http://127.0.0.1:8000/v1",
    api_key="uor-local"
)

response = agent.run("Search the codebase for CORDIC formulas and explain how they work.")
print(response)
```
