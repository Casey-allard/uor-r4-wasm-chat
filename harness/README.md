# 🤖 UOR-R4 Hermes Agent & Tool Harness

A plug-and-play local agent harness for UOR-R4 substrates, enabling autonomous tool-calling loops, multi-turn reasoning, and integration with agent frameworks (Hermes, LangChain, AutoGen, Cursor, Cline).

---

## ⚡ Quick Start

1. Start your local UOR-R4 API server or point to a Hugging Face Space:
   ```bash
   python server/app.py
   ```

2. Run the agent harness:
   ```bash
   python harness/uor_hermes_harness.py "What is the square root of 1337 multiplied by 42, and read Cargo.toml?"
   ```

3. Query a remote Hugging Face Space or custom endpoint:
   ```bash
   python harness/uor_hermes_harness.py "Summarize README.md" --api-base https://<your-space>.hf.space/v1 --model glm5.3-flash
   ```

---

## 🔌 Integration with Frameworks

### 1. LangChain
```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    base_url="http://localhost:8000/v1",
    api_key="uor-local",
    model="glm5.3-flash",
    temperature=0.35
)

response = llm.invoke("Explain E8 root lattice quantization in UOR-R4.")
print(response.content)
```

### 2. AutoGen / CrewAI
Set `base_url: "http://localhost:8000/v1"` and `api_key: "uor-local"` in your agent `llm_config`.

### 3. Cursor / Continue.dev (VS Code)
Set OpenAI Base URL in settings:
* **Base URL**: `http://localhost:8000/v1`
* **API Key**: `uor-local`
* **Model**: `glm5.3-flash`
