// =====================================================================
// NATIVE TAURI DESKTOP CAPABILITY & BENCHMARK HARNESS
// =====================================================================

use uor_r4_sovereign_studio::commands::*;
use std::time::Instant;

#[tokio::main]
async fn main() {
    println!("🦀 ===========================================================");
    println!("🦀 UOR-R4 SOVEREIGN STUDIO - NATIVE TAURI DESKTOP HARNESS");
    println!("🦀 ===========================================================");

    // 1. Hardware Info & Metal Acceleration
    let t0 = Instant::now();
    let hw = get_native_hardware_info();
    let hw_time = t0.elapsed();
    println!("\n⚡ [1. Hardware & Metal Acceleration] ({} µs)", hw_time.as_micros());
    println!("   OS: {}", hw.os);
    println!("   Arch: {}", hw.arch);
    println!("   Metal GPU Supported: {}", hw.metal_supported);
    println!("   CPU Cores: {}", hw.cpu_cores);
    println!("   Memory: {} GB", hw.memory_gb);
    assert!(hw.metal_supported, "Metal GPU must be supported on macOS");

    // 2. Local Repository Git Status
    let repo_path = "/Users/casey.allard/Downloads/uor-r4-project".to_string();
    let t1 = Instant::now();
    let git_status = native_git_status(repo_path.clone()).expect("Failed native git status");
    let git_time = t1.elapsed();
    println!("\n🌿 [2. Native Git Worktree Status] ({} µs)", git_time.as_micros());
    println!("   Branch: {}", git_status.branch);
    println!("   Clean: {}", git_status.is_clean);
    println!("   Modified files ({}): {:?}", git_status.modified_files.len(), git_status.modified_files);
    println!("   Untracked files ({}): {:?}", git_status.untracked_files.len(), git_status.untracked_files);

    // 3. Native Git Diff
    let t2 = Instant::now();
    let diff = native_git_diff(repo_path.clone()).expect("Failed native git diff");
    let diff_time = t2.elapsed();
    println!("\n⚖️ [3. Native Git Diff] ({} µs)", diff_time.as_micros());
    println!("   Diff size: {} bytes", diff.len());

    // 4. Local Model Scanner
    let t3 = Instant::now();
    let local_models = native_list_local_models();
    let scan_time = t3.elapsed();
    println!("\n🧠 [4. Autonomous Disk Model Scanner] ({} µs)", scan_time.as_micros());
    println!("   Discovered local models ({}):", local_models.len());
    for m in local_models.iter().take(5) {
        println!("   - [{}] {} ({}) -> {}", m.format, m.name, m.size_str, m.path);
    }

    // 5. Native Subprocess Terminal Execution
    let t4 = Instant::now();
    let term_out = native_run_terminal_command(repo_path.clone(), "git --version".to_string()).expect("Failed terminal run");
    let term_time = t4.elapsed();
    println!("\n💻 [5. Native Terminal Subprocess Execution] ({} µs)", term_time.as_micros());
    println!("   Output: {}", term_out.trim());

    // 6. Native Inference Core Benchmark
    let t5 = Instant::now();
    let inf_res = run_native_inference("qwen2.5-coder-0.5b".to_string(), "Write a high-performance SIMD matrix multiplier in Rust.".to_string(), 128).await.expect("Inference failed");
    let inf_time = t5.elapsed();
    println!("\n🚀 [6. Native Metal Inference Core] ({} ms)", inf_time.as_millis());
    println!("   Tokens generated: {}", inf_res.tokens_generated);
    println!("   Elapsed: {:.4}s", inf_res.elapsed_sec);
    println!("   Engine: {}", inf_res.engine);
    println!("   Estimated Throughput: {:.1} tok/s", inf_res.tps);

    println!("\n✅ ===========================================================");
    println!("✅ ALL NATIVE TAURI DESKTOP CAPABILITIES VERIFIED WITH ZERO ERRORS!");
    println!("✅ ===========================================================");
}
