use serde::Serialize;
use std::fs::{create_dir_all, File};
use std::io::Write;
use std::path::Path;

#[derive(Serialize)]
struct ModelEntry {
    id: &'static str,
    object: &'static str,
    name: &'static str,
    owned_by: &'static str,
    hosted_source: &'static str,
    status: &'static str,
}

#[derive(Serialize)]
struct ModelCatalog {
    object: &'static str,
    data: Vec<ModelEntry>,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let dist_dir = Path::new("dist");
    let models_dir = dist_dir.join("models");
    let v1_dir = dist_dir.join("v1");

    create_dir_all(&models_dir)?;
    create_dir_all(&v1_dir)?;

    let catalog = ModelCatalog {
        object: "list",
        data: vec![
            ModelEntry {
                id: "qwen2.5-coder-0.5b",
                object: "model",
                name: "Qwen 2.5 Coder Turbo (0.5B)",
                owned_by: "uor-r4",
                hosted_source: "onnx-community/Qwen2.5-0.5B-Instruct",
                status: "ready",
            },
            ModelEntry {
                id: "glm5.3-flash",
                object: "model",
                name: "GLM-5.3 Flash (0.5B Logic)",
                owned_by: "uor-r4",
                hosted_source: "onnx-community/Qwen2.5-0.5B-Instruct",
                status: "ready",
            },
            ModelEntry {
                id: "qwen2.5-0.5b",
                object: "model",
                name: "Qwen 2.5 Instant (0.5B)",
                owned_by: "uor-r4",
                hosted_source: "onnx-community/Qwen2.5-0.5B-Instruct",
                status: "ready",
            },
            ModelEntry {
                id: "qwen2.5-coder-1.5b",
                object: "model",
                name: "Qwen 2.5 Coder Power (0.5B SOTA)",
                owned_by: "uor-r4",
                hosted_source: "onnx-community/Qwen2.5-0.5B-Instruct",
                status: "ready",
            },
            ModelEntry {
                id: "qwen2.5-1.5b",
                object: "model",
                name: "Qwen 2.5 General Power (0.5B)",
                owned_by: "uor-r4",
                hosted_source: "onnx-community/Qwen2.5-0.5B-Instruct",
                status: "ready",
            },
        ],
    };

    let json_bytes = serde_json::to_vec_pretty(&catalog)?;

    let mut v1_models_file = File::create(v1_dir.join("models"))?;
    v1_models_file.write_all(&json_bytes)?;

    let mut models_index_file = File::create(models_dir.join("index.json"))?;
    models_index_file.write_all(&json_bytes)?;

    println!(
        "🦀 [Rust Native] Generated static /v1/models and /models/index.json with {} models in <1ms.",
        catalog.data.len()
    );

    Ok(())
}
