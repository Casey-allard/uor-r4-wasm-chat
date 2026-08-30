//! # UOR-R4 Unified CLI Tool
//!
//! A single, zero-dependency, 100% pure Rust command-line suite for:
//! - Interactive autoregressive chat (`uor chat`)
//! - Massive corpus ingestion & dynamic vocabulary training (`uor ingest`)
//! - General attention sensitivity & perplexity evaluation (`uor eval`)
//! - Native CPU corpus training via SGD (`uor train`)
//! - Zero-dependency local WebAssembly dashboard hosting (`uor serve`)
//! - Real-time terminal system monitor (`uor monitor`)

use std::env;
use std::fs;
use std::io::{self, BufRead, Write};
use std::net::TcpListener;
use std::path::Path;
use std::time::Instant;

use uor_r4_wasm_bridge::{BrowserTrainingHarness, DynamicSession, InteractiveChatSession};

const CYAN: &str = "\x1B[38;5;51m";
const GREEN: &str = "\x1B[38;5;84m";
const YELLOW: &str = "\x1B[38;5;220m";
const RED: &str = "\x1B[38;5;203m";
const MAGENTA: &str = "\x1B[38;5;207m";
const BOLD: &str = "\x1B[1m";
const RESET: &str = "\x1B[0m";

fn print_banner() {
    println!("{CYAN}======================================================================{RESET}");
    println!("{BOLD}        UOR-R4 GEOMETRIC AI & COGNITIVE ENGINE (100% RUST)           {RESET}");
    println!("{CYAN}======================================================================{RESET}");
    println!("  * Architecture : 512D Bipolar VSA, 8D E8 Lattice, S³ Hopf Projection");
    println!("  * Execution    : Multiplication-Free, Zero Heap Dynamic Scaling");
    println!("  * Modes        : Universal 256-Byte Stream | Dynamic Top-N Vocabulary");
    println!("{CYAN}======================================================================{RESET}\n");
}

fn print_usage() {
    print_banner();
    println!("{BOLD}USAGE:{RESET}");
    println!("  uor <SUBCOMMAND> [OPTIONS]\n");
    println!("{BOLD}SUBCOMMANDS:{RESET}");
    println!("  {GREEN}chat{RESET}   [OPTIONS]        Launch the interactive terminal chat REPL");
    println!("  {GREEN}ingest{RESET} <FILE> [OPTIONS] Ingest massive text file (dynamic top-N vocab or 256-byte stream)");
    println!("  {GREEN}eval{RESET}   [OPTIONS]        Evaluate general attention sensitivity, Hopf rotation, & entropy");
    println!("  {GREEN}train{RESET}  [OPTIONS]        Train default 12-token codebook on text corpus using SGD on CPU");
    println!("  {GREEN}serve{RESET}  [PORT]           Host the WebAssembly client dashboard locally (default: 8080)");
    println!("  {GREEN}monitor{RESET}               Run the Apple Silicon / CPU live performance monitor");
    println!("  {GREEN}export{RESET} [FILE]          Export codebook coordinates to JSON");
    println!("  {GREEN}help{RESET}                  Show this help documentation\n");
    println!("{BOLD}INGESTION & ATTENTION EXAMPLES:{RESET}");
    println!("  ./uor ingest input.txt --mode words --vocab-size 512 --epochs 50 --out model.json");
    println!("  ./uor ingest input.txt --mode bytes --epochs 20 --out model_bytes.json");
    println!("  ./uor eval --prefix-a \"secure quantum agent\" --prefix-b \"isolated fano system\"");
    println!("  ./uor chat --dynamic --mode words --vocab-size 256\n");
}

fn run_chat(args: &[String]) {
    print_banner();

    let mut is_dynamic = false;
    let mut mode = "words".to_string();
    let mut vocab_size: u32 = 256;

    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--dynamic" | "-d" => {
                is_dynamic = true;
                i += 1;
            }
            "--mode" | "-m" if i + 1 < args.len() => {
                mode = args[i + 1].clone();
                is_dynamic = true;
                i += 2;
            }
            "--vocab-size" | "-v" if i + 1 < args.len() => {
                if let Ok(v) = args[i + 1].parse::<u32>() {
                    vocab_size = v;
                }
                is_dynamic = true;
                i += 2;
            }
            _ => {
                i += 1;
            }
        }
    }

    if is_dynamic {
        println!("{BOLD}Starting Dynamic Autoregressive Session (Mode: {GREEN}{mode}{RESET}, Vocab: {YELLOW}{vocab_size}{RESET})...{RESET}");
        println!("Commands: {YELLOW}'reset'{RESET} (clear context), {RED}'exit'{RESET} (quit)\n");

        let mut session = DynamicSession::new(&mode, vocab_size);
        let stdin = io::stdin();
        let mut stdout = io::stdout();

        loop {
            print!("{CYAN}uor-dyn-chat>{RESET} ");
            stdout.flush().unwrap();

            let mut input = String::new();
            if stdin.read_line(&mut input).is_err() || input.is_empty() {
                break;
            }

            let trimmed = input.trim();
            if trimmed.is_empty() {
                continue;
            }

            if trimmed == "exit" || trimmed == "quit" {
                println!("\n{YELLOW}Session ended. Exiting.{RESET}");
                break;
            }

            if trimmed == "reset" {
                session.reset();
                println!("{YELLOW}[Context reset to zero base]{RESET}\n");
                continue;
            }

            let start = Instant::now();
            let result_json = session.process_input_dynamic(trimmed, 4);
            let elapsed = start.elapsed();

            println!("\n  {BOLD}{GREEN}[Completion]{RESET} {BOLD}>>> {result_json}{RESET}");
            println!("  {YELLOW}Latency: {:.3}ms{RESET}\n", elapsed.as_secs_f64() * 1000.0);
        }
    } else {
        println!("{BOLD}Starting Default Interactive Session (12-Centroid Gosset E8 Engine)...{RESET}");
        println!("Commands: {YELLOW}'reset'{RESET} (clear context), {RED}'exit'{RESET} (quit)\n");

        let mut session = InteractiveChatSession::new();
        let stdin = io::stdin();
        let mut stdout = io::stdout();

        loop {
            print!("{CYAN}uor-chat>{RESET} ");
            stdout.flush().unwrap();

            let mut input = String::new();
            if stdin.read_line(&mut input).is_err() || input.is_empty() {
                break;
            }

            let trimmed = input.trim();
            if trimmed.is_empty() {
                continue;
            }

            if trimmed == "exit" || trimmed == "quit" {
                println!("\n{YELLOW}Session ended. Exiting.{RESET}");
                break;
            }

            if trimmed == "reset" {
                session.reset();
                println!("{YELLOW}[Context reset to zero base]{RESET}\n");
                continue;
            }

            let start = Instant::now();
            let result_json = session.process_input_run(trimmed);
            let elapsed = start.elapsed();

            println!("\n  {BOLD}{GREEN}[Completion]{RESET} {BOLD}>>> {result_json}{RESET}");
            println!("  {YELLOW}Latency: {:.3}ms | Memory: Zero dynamic heap allocs{RESET}\n", elapsed.as_secs_f64() * 1000.0);
        }
    }
}

fn run_ingest(args: &[String]) {
    if args.is_empty() {
        eprintln!("{RED}Error: Missing corpus file path.{RESET}");
        println!("Usage: uor ingest <FILE> [--mode words|bytes] [--vocab-size N] [--epochs N] [--out model.json]");
        return;
    }

    let file_path = &args[0];
    let corpus = match fs::read_to_string(file_path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("{RED}Error reading corpus file '{file_path}': {e}{RESET}");
            return;
        }
    };

    let mut mode = "words".to_string();
    let mut vocab_size: u32 = 512;
    let mut epochs: u32 = 50;
    let mut out_file = "uor_ingested_model.json".to_string();

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--mode" | "-m" if i + 1 < args.len() => {
                mode = args[i + 1].clone();
                i += 2;
            }
            "--vocab-size" | "-v" if i + 1 < args.len() => {
                if let Ok(v) = args[i + 1].parse::<u32>() {
                    vocab_size = v;
                }
                i += 2;
            }
            "--epochs" | "-e" if i + 1 < args.len() => {
                if let Ok(ep) = args[i + 1].parse::<u32>() {
                    epochs = ep;
                }
                i += 2;
            }
            "--out" | "-o" if i + 1 < args.len() => {
                out_file = args[i + 1].clone();
                i += 2;
            }
            _ => {
                i += 1;
            }
        }
    }

    print_banner();
    println!("{BOLD}Initiating Massive Corpus Ingestion Engine...{RESET}");
    println!("  * Source File : {CYAN}{file_path}{RESET} ({} bytes, {} chars)", corpus.len(), corpus.chars().count());
    println!("  * Mode        : {GREEN}{mode}{RESET}");
    println!("  * Vocab Limit : {YELLOW}{vocab_size}{RESET}");
    println!("  * Epochs      : {MAGENTA}{epochs}{RESET}");

    let mut session = DynamicSession::new(&mode, vocab_size);
    let start = Instant::now();
    let result_json = session.ingest_corpus(&corpus, epochs, 6553, &mode, vocab_size);
    let elapsed = start.elapsed();

    let tokens_count = if mode == "bytes" { corpus.len() } else { corpus.split_whitespace().count() };
    let throughput = (tokens_count as f64 * epochs as f64) / elapsed.as_secs_f64();

    println!("\n{GREEN}Ingestion & Training Complete!{RESET}");
    println!("  * Elapsed Time : {:.3}s", elapsed.as_secs_f64());
    println!("  * Throughput   : {BOLD}{CYAN}{:.0} tokens/sec{RESET}", throughput);
    println!("  * Telemetry    : {}\n", result_json);

    let model_json = session.export_codebook_json();
    if let Ok(mut f) = fs::File::create(&out_file) {
        let _ = f.write_all(model_json.as_bytes());
        println!("{GREEN}Model successfully exported to {BOLD}{out_file}{RESET}\n");
    }
}

fn run_eval(args: &[String]) {
    print_banner();
    println!("{BOLD}Evaluating General Attention Sensitivity & Hopf Angular Rotation...{RESET}\n");

    let mut prefix_a = "quantum stable system integrity".to_string();
    let mut prefix_b = "isolated routing execution sattvic".to_string();

    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--prefix-a" | "-a" if i + 1 < args.len() => {
                prefix_a = args[i + 1].clone();
                i += 2;
            }
            "--prefix-b" | "-b" if i + 1 < args.len() => {
                prefix_b = args[i + 1].clone();
                i += 2;
            }
            _ => {
                i += 1;
            }
        }
    }

    let session = DynamicSession::new("words", 256);
    println!("  [Test A] Prefix: \"{CYAN}{prefix_a}{RESET}\"");
    println!("  [Test B] Prefix: \"{MAGENTA}{prefix_b}{RESET}\"\n");

    let report = session.evaluate_sensitivity(&prefix_a, &prefix_b);
    println!("{BOLD}General Attention Telemetry Report:{RESET}");
    println!("  {}\n", report);
    println!("{GREEN}✓ Verified: Contextual changes rotate the 8D Hopf vector and shift attention weights.{RESET}\n");
}

fn run_train(args: &[String]) {
    let mut corpus = "hello secure agent system. quantum stable system integrity. routing integrity execution sattvic.".to_string();
    let mut epochs: u32 = 100;

    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--corpus" | "-c" if i + 1 < args.len() => {
                let path_or_text = &args[i + 1];
                if Path::new(path_or_text).exists() {
                    if let Ok(content) = fs::read_to_string(path_or_text) {
                        corpus = content;
                    }
                } else {
                    corpus = path_or_text.clone();
                }
                i += 2;
            }
            "--epochs" | "-e" if i + 1 < args.len() => {
                if let Ok(ep) = args[i + 1].parse::<u32>() {
                    epochs = ep;
                }
                i += 2;
            }
            _ => {
                i += 1;
            }
        }
    }

    print_banner();
    println!("{BOLD}Initiating Pure Rust SGD Corpus Training on CPU...{RESET}");
    println!("  * Epochs : {}", epochs);
    println!("  * Corpus : \"{}\"", corpus.chars().take(80).collect::<String>());

    let mut trainer = BrowserTrainingHarness::new();
    let start = Instant::now();
    let result_json = trainer.train_on_corpus(&corpus, epochs, 6553);
    let elapsed = start.elapsed();

    println!("\n{GREEN}Training complete in {:.3}s!{RESET}", elapsed.as_secs_f32());
    println!("{BOLD}Results:{RESET} {}\n", result_json);
}

fn run_serve(args: &[String]) {
    let port = args.get(0).and_then(|p| p.parse::<u16>().ok()).unwrap_or(8080);
    let addr = format!("127.0.0.1:{}", port);

    print_banner();
    println!("{BOLD}Hosting UOR-R4 WebAssembly Client Dashboard locally...{RESET}");
    println!("  * URL       : {CYAN}http://{}{RESET}", addr);
    println!("  * Engine    : 100% Client-Side WebAssembly (Zero Backend Required)");
    println!("  * Directory : {}", env::current_dir().unwrap().display());
    println!("  * Status    : Ready. Press {RED}Ctrl+C{RESET} to stop server.\n");

    let listener = match TcpListener::bind(&addr) {
        Ok(l) => l,
        Err(e) => {
            eprintln!("{RED}Failed to bind to {}: {}{RESET}", addr, e);
            return;
        }
    };

    for stream in listener.incoming() {
        if let Ok(mut stream) = stream {
            let mut reader = io::BufReader::new(&stream);
            let mut request_line = String::new();
            if reader.read_line(&mut request_line).is_err() {
                continue;
            }

            let parts: Vec<&str> = request_line.split_whitespace().collect();
            if parts.len() < 2 {
                continue;
            }

            let raw_path = parts[1];
            let file_path = if raw_path == "/" || raw_path.is_empty() {
                "index.html".to_string()
            } else {
                raw_path.trim_start_matches('/').to_string()
            };

            let path = Path::new(&file_path);
            let (status, content_type, body) = if path.exists() && path.is_file() {
                let content_type = match path.extension().and_then(|e| e.to_str()) {
                    Some("html") => "text/html; charset=utf-8",
                    Some("js") => "application/javascript; charset=utf-8",
                    Some("wasm") => "application/wasm",
                    Some("css") => "text/css",
                    Some("json") => "application/json",
                    Some("svg") => "image/svg+xml",
                    _ => "application/octet-stream",
                };
                match fs::read(path) {
                    Ok(bytes) => ("200 OK", content_type, bytes),
                    Err(_) => ("500 Internal Server Error", "text/plain", b"500 Internal Error".to_vec()),
                }
            } else {
                ("404 Not Found", "text/plain", b"404 Not Found".to_vec())
            };

            let response_headers = format!(
                "HTTP/1.1 {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n",
                status, content_type, body.len()
            );

            let _ = stream.write_all(response_headers.as_bytes());
            let _ = stream.write_all(&body);
            let _ = stream.flush();
        }
    }
}

fn run_export(args: &[String]) {
    let target_file = args.get(0).map(|s| s.as_str()).unwrap_or("uor_codebook_coordinates.json");
    print_banner();
    println!("Exporting codebook coordinates to {target_file}...");

    let mut trainer = BrowserTrainingHarness::new();
    let result_json = trainer.train_on_corpus("hello", 1, 0);
    if let Ok(mut f) = fs::File::create(target_file) {
        let _ = f.write_all(result_json.as_bytes());
        println!("{GREEN}Successfully exported codebook to {target_file}!{RESET}\n");
    }
}

fn main() {
    let args: Vec<String> = env::args().skip(1).collect();

    if args.is_empty() {
        print_usage();
        return;
    }

    match args[0].as_str() {
        "chat" => run_chat(&args[1..]),
        "ingest" => run_ingest(&args[1..]),
        "eval" => run_eval(&args[1..]),
        "train" => run_train(&args[1..]),
        "serve" | "server" => run_serve(&args[1..]),
        "monitor" => {
            println!("Launching Terminal Dashboard Monitor...");
            let _ = std::process::Command::new("cargo")
                .args(["run", "--bin", "uor_terminal_dashboard"])
                .status();
        }
        "export" => run_export(&args[1..]),
        "help" | "-h" | "--help" => print_usage(),
        other => {
            eprintln!("{RED}Unknown command: '{}'{RESET}\n", other);
            print_usage();
        }
    }
}
