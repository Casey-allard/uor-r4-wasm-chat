// =====================================================================
// UOR-R4 SOVEREIGN STUDIO - COMPLETE END-TO-END REGRESSION TEST SUITE
// =====================================================================

use uor_r4_sovereign_studio::commands::*;
use std::time::Instant;
use std::path::Path;

#[tokio::main]
async fn main() {
    println!("🧪 ====================================================================");
    println!("🧪 UOR-R4 SOVEREIGN STUDIO: COMPREHENSIVE REGRESSION & QA TEST SUITE");
    println!("🧪 ====================================================================");

    let workspace_path = "/Users/casey.allard/Downloads/uor-r4-project".to_string();

    // -------------------------------------------------------------------------
    // TEST 1: System Hardware & Metal Substrate Verification
    // -------------------------------------------------------------------------
    println!("\n[TEST 1] Verifying System Hardware & Metal Substrate...");
    let t0 = Instant::now();
    let hw = get_native_hardware_info();
    let hw_lat = t0.elapsed();
    println!("   ✔ OS: {} ({})", hw.os, hw.arch);
    println!("   ✔ CPU Cores: {}", hw.cpu_cores);
    println!("   ✔ Memory Quota: {} GB", hw.memory_gb);
    println!("   ✔ Apple Silicon Metal Support: {}", hw.metal_supported);
    println!("   ✔ Hardware Telemetry Latency: {} µs", hw_lat.as_micros());
    assert!(hw.metal_supported, "Metal GPU acceleration must be active on macOS");

    // -------------------------------------------------------------------------
    // TEST 2: Native Terminal Subprocess Execution & Command Pipeline
    // -------------------------------------------------------------------------
    println!("\n[TEST 2] Testing Native Terminal Subprocess Execution...");
    let test_cmds = vec![
        ("git --version", "git version"),
        ("cargo --version", "cargo"),
        ("rustc --version", "rustc"),
        ("ls -d src-tauri", "src-tauri"),
        ("git log -n 1 --oneline", ""),
    ];

    for (cmd, expected_sub) in test_cmds {
        let t_cmd = Instant::now();
        let res = native_run_terminal_command(workspace_path.clone(), cmd.to_string());
        let dur = t_cmd.elapsed();
        match res {
            Ok(out) => {
                println!("   ✔ Command '{}' -> OK ({} ms)", cmd, dur.as_millis());
                println!("     Output: {}", out.lines().next().unwrap_or("").trim());
                if !expected_sub.is_empty() {
                    assert!(out.contains(expected_sub), "Output missing expected substring: {}", expected_sub);
                }
            }
            Err(e) => {
                panic!("❌ Failed to execute terminal command '{}': {}", cmd, e);
            }
        }
    }

    // -------------------------------------------------------------------------
    // TEST 3: Local Git Repository Connections & Status Checks
    // -------------------------------------------------------------------------
    println!("\n[TEST 3] Testing Native Git Worktree & Diff Analysis...");
    let t_git = Instant::now();
    let git_status = native_git_status(workspace_path.clone()).expect("Failed native_git_status");
    let git_dur = t_git.elapsed();
    println!("   ✔ Active Git Branch: '{}'", git_status.branch);
    println!("   ✔ Clean State: {}", git_status.is_clean);
    println!("   ✔ Modified files tracked: {}", git_status.modified_files.len());
    println!("   ✔ Untracked files tracked: {}", git_status.untracked_files.len());
    println!("   ✔ Git Status Latency: {} ms", git_dur.as_millis());

    let t_diff = Instant::now();
    let diff_out = native_git_diff(workspace_path.clone()).expect("Failed native_git_diff");
    let diff_dur = t_diff.elapsed();
    println!("   ✔ Git Diff Analysis: {} bytes ({} ms)", diff_out.len(), diff_dur.as_millis());

    // -------------------------------------------------------------------------
    // TEST 4: Autonomous Local Disk Model Scanner & Hub Discovery
    // -------------------------------------------------------------------------
    println!("\n[TEST 4] Testing Autonomous Local Disk Model Discovery...");
    let t_scan = Instant::now();
    let models = native_list_local_models();
    let scan_dur = t_scan.elapsed();
    println!("   ✔ Discovered {} local model assets on disk ({} ms):", models.len(), scan_dur.as_millis());
    for m in &models {
        println!("     - [{}] {} ({})", m.format, m.name, m.size_str);
    }
    assert!(!models.is_empty(), "Local model discovery should find cached models in ~/.cache/huggingface/hub");

    // -------------------------------------------------------------------------
    // TEST 5: Complete Model Registry & Multi-Substrate Generation
    // -------------------------------------------------------------------------
    println!("\n[TEST 5] Testing All 5 Sovereign Models & Inference Substrates...");
    
    let model_test_prompts = vec![
        ("glm5.3-flash", "GLM-5.3 Flash (0.5B Logic)", "Explain how Gosset 8D E8 polytope projects into 3D space.", 128),
        ("qwen2.5-coder-0.5b", "Qwen 2.5 Coder Turbo (0.5B)", "Write a binary search function in Rust with comprehensive doc comments.", 128),
        ("qwen2.5-0.5b", "Qwen 2.5 Instant (0.5B)", "What are the key mathematical properties of the Hopf fibration?", 128),
        ("qwen2.5-coder-1.5b", "Qwen 2.5 Coder Power (0.5B SOTA)", "Write a thread-safe singleton using OnceLock in Rust.", 128),
        ("qwen2.5-1.5b", "Qwen 2.5 General Power (0.5B)", "Explain topological invariant Euler characteristics in 2 sentences.", 128),
    ];

    for (m_id, m_name, prompt, max_tok) in model_test_prompts {
        let t_inf = Instant::now();
        let res = run_native_inference(m_id.to_string(), prompt.to_string(), max_tok).await.expect("Inference failed");
                println!("   ✔ Model [{}] - {}:", m_id, m_name);
        println!("     Tokens: {} | Elapsed: {:.3}s | TPS: {:.1} tok/s | Engine: {}", res.tokens_generated, res.elapsed_sec, res.tps, res.engine);
        println!("     Response preview: {}", res.full_text.lines().next().unwrap_or("").trim());
        assert!(res.tps > 500.0, "Native Metal inference throughput should exceed 500 tok/s");
    }

    // -------------------------------------------------------------------------
    // TEST 6: File Integrity & Bundle Verification
    // -------------------------------------------------------------------------
    println!("\n[TEST 6] Testing macOS .app & .dmg Artifacts...");
    let app_path = Path::new("/Users/casey.allard/Downloads/uor-r4-project/src-tauri/target/release/bundle/macos/UOR-R4 Sovereign Studio.app");
    let dmg_path = Path::new("/Users/casey.allard/Downloads/uor-r4-project/src-tauri/target/release/bundle/dmg/UOR-R4 Sovereign Studio_3.0.0_aarch64.dmg");
    let bin_path = Path::new("/Users/casey.allard/Downloads/uor-r4-project/src-tauri/target/release/uor-r4-sovereign-studio");

    assert!(app_path.exists(), "macOS .app bundle must exist");
    assert!(dmg_path.exists(), "macOS .dmg installer must exist");
    assert!(bin_path.exists(), "Release binary must exist");

    println!("   ✔ macOS .app Bundle: EXISTS at {}", app_path.display());
    println!("   ✔ macOS .dmg Installer: EXISTS at {} ({} MB)", dmg_path.display(), dmg_path.metadata().unwrap().len() / (1024 * 1024));
    println!("   ✔ Release Executable: EXISTS at {} ({} MB)", bin_path.display(), bin_path.metadata().unwrap().len() / (1024 * 1024));

    println!("\n🎉 ====================================================================");
    println!("🎉 ALL 6 REGRESSION & FUNCTIONALITY TESTS PASSED WITH 100% SUCCESS!");
    println!("🎉 ====================================================================");
}
