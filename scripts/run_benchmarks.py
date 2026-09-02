#!/usr/bin/env python3
"""
UOR-R4 Automated Empirical Benchmarking Suite
============================================
Compiles and executes the native Rust benchmark harness to measure exact
hardware latencies and throughputs, updating results/benchmark_data.json.
"""

import subprocess
import sys
import os
import json

def run_benchmarks():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print("=" * 60)
    print("⚡ UOR-R4 AUTOMATED EMPIRICAL BENCHMARK HARNESS ⚡")
    print(f"Directory: {repo_root}")
    print("=" * 60)

    # 1. Execute release benchmark binary
    cmd = ["cargo", "run", "--release", "--bin", "benchmark_geometric_core"]
    print(f"\n[1/2] Running: {' '.join(cmd)}...")
    res = subprocess.run(cmd, cwd=repo_root, capture_output=True, text=True)
    if res.returncode != 0:
        print("❌ Benchmark execution failed:")
        print(res.stderr)
        sys.exit(1)
    
    print(res.stdout)

    # 2. Verify results file
    results_path = os.path.join(repo_root, "results", "benchmark_data.json")
    if os.path.exists(results_path):
        with open(results_path, "r") as f:
            data = json.load(f)
        print(f"[2/2] ✅ Verified empirical benchmark data recorded at: {results_path}")
        print(f"Timestamp: {data.get('timestamp')}")
        print(f"Hardware: {data.get('hardware')}")
    else:
        print("❌ Error: Benchmark results file not generated.")
        sys.exit(1)

if __name__ == "__main__":
    run_benchmarks()
