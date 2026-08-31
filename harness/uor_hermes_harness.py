#!/usr/bin/env python3
"""
UOR-R4 Hermes Agent & Tool Harness
==================================
A lightweight, extensible agent harness for UOR-R4 that executes multi-turn
tool-calling loops and streaming reasoning over the OpenAI-compatible API.

Compatible with:
- Local UOR Server (http://localhost:8000/v1)
- Remote Hugging Face Space (https://<space>.hf.space/v1)
- Hermes / OpenHermes agentic prompt templates
"""

import os
import sys
import time
import json
import math
import argparse
import urllib.request
import urllib.error

# Default tool registry
def tool_calculate(expression: str) -> str:
    """Safely evaluates basic mathematical expressions."""
    try:
        allowed_names = {"math": math, "sqrt": math.sqrt, "pi": math.pi, "sin": math.sin, "cos": math.cos}
        res = eval(expression, {"__builtins__": {}}, allowed_names)
        return str(res)
    except Exception as e:
        return f"Math error: {e}"

def tool_read_file(path: str) -> str:
    """Reads a text file from the current workspace."""
    try:
        if not os.path.exists(path):
            return f"Error: File '{path}' does not exist."
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        return content[:4000] + ("\n...[truncated]" if len(content) > 4000 else "")
    except Exception as e:
        return f"File read error: {e}"

TOOLS = {
    "calculate": tool_calculate,
    "read_file": tool_read_file
}

SYSTEM_PROMPT = """You are a capable, autonomous AI reasoning agent.
You have access to the following local tools:
1. calculate(expression: str) -> str: Evaluates mathematical expressions.
2. read_file(path: str) -> str: Reads local text files.

To call a tool, output ONLY the tool call block in this format:
<tool_call>
{"name": "tool_name", "arguments": {"param": "value"}}
</tool_call>

When your task is complete or you do not need tools, provide your final answer clearly."""

def query_uor_api(api_base: str, model: str, messages: list, stream: bool = True):
    """Sends a chat completion request to the OpenAI-compatible UOR endpoint."""
    url = f"{api_base.rstrip('/')}/chat/completions"
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.35,
        "top_p": 0.85,
        "max_tokens": 1024,
        "stream": stream
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    if stream:
        with urllib.request.urlopen(req) as resp:
            for line in resp:
                line = line.decode("utf-8").strip()
                if line.startswith("data: "):
                    data_str = line[6:]
                    if data_str == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data_str)
                        if "choices" in chunk and len(chunk["choices"]) > 0:
                            delta = chunk["choices"][0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield content
                    except json.JSONDecodeError:
                        continue
    else:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            yield data["choices"][0]["message"]["content"]


def run_agent_loop(prompt: str, api_base: str = "http://localhost:8000/v1", model: str = "glm5.3-flash", max_turns: int = 5):
    """Executes a multi-turn agentic loop with tool calling."""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ]

    print(f"\n🧠 [UOR-Harness] Target Endpoint: {api_base} | Substrate: {model}")
    print(f"👤 User: {prompt}\n" + "─"*60)

    for turn in range(max_turns):
        print(f"🤖 Assistant (Turn {turn+1}): ", end="", flush=True)
        full_response = ""
        token_count = 0
        t0 = time.time()

        try:
            for chunk in query_uor_api(api_base, model, messages, stream=True):
                full_response += chunk
                token_count += 1
                sys.stdout.write(chunk)
                sys.stdout.flush()
        except urllib.error.URLError as e:
            print(f"\n❌ Connection Error: Could not reach {api_base}. Ensure UOR API server is running! ({e})")
            return

        elapsed = time.time() - t0
        tps = token_count / elapsed if elapsed > 0 else 0
        print(f"\n   [⚡ {tps:.1f} tok/s • {token_count} tokens in {elapsed:.2f}s]")

        messages.append({"role": "assistant", "content": full_response})

        # Check for tool call
        if "<tool_call>" in full_response and "</tool_call>" in full_response:
            try:
                start = full_response.index("<tool_call>") + len("<tool_call>")
                end = full_response.index("</tool_call>")
                raw_json = full_response[start:end].strip()
                call_data = json.loads(raw_json)
                tool_name = call_data.get("name")
                tool_args = call_data.get("arguments", {})

                print(f"\n⚙️  [Tool Execution] Calling '{tool_name}' with args {tool_args}...")
                if tool_name in TOOLS:
                    if tool_name == "calculate":
                        res = TOOLS[tool_name](tool_args.get("expression", ""))
                    elif tool_name == "read_file":
                        res = TOOLS[tool_name](tool_args.get("path", ""))
                    else:
                        res = "Unknown tool"
                else:
                    res = f"Error: Tool '{tool_name}' is not registered."

                print(f"   ↳ Result: {res[:200]}...")
                tool_resp_msg = f"<tool_response>\n{{\"name\": \"{tool_name}\", \"result\": {json.dumps(res)}}}\n</tool_response>"
                messages.append({"role": "user", "content": tool_resp_msg})
                continue
            except Exception as parse_err:
                print(f"⚠️  Tool parsing error: {parse_err}")
                break
        else:
            # Answer is final
            break

    print("─"*60 + "\n✅ Agent Reasoning Complete.\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="UOR-R4 Hermes Agent Harness")
    parser.add_argument("prompt", nargs="?", default="Calculate 2^16 and check what files are in this project directory.", help="User prompt")
    parser.add_argument("--api-base", default="http://localhost:8000/v1", help="OpenAI-compatible API base URL")
    parser.add_argument("--model", default="glm5.3-flash", help="Substrate model ID")
    args = parser.parse_args()

    run_agent_loop(args.prompt, api_base=args.api_base, model=args.model)
