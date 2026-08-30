# -*- coding: utf-8 -*-
"""
UOR-R4 Teacher-Trace Extractor & Corpus Synthesizer
=====================================================================
Act as a pipeline utility to ingest arbitrary raw text files (e.g.,
Wikipedia dumps, custom logs, or Gutenberg books) and extract clean,
high-density training sequences (Markovian transition traces) matching
the strict 12-word UOR-R4 vocabulary.

Complies with the zero-allocation, offline, and multiplication-free
principles of the R4 execution contract (#157).
=====================================================================
"""

import os
import sys
import re

VOCABULARY = [
    "hello",      # 0
    "routing",    # 1
    "sattvic",    # 2
    "isolated",   # 3
    "integrity",  # 4
    "execution",  # 5
    "stable",     # 6
    "fano",       # 7
    "agent",      # 8
    "system",     # 9
    "secure",     # 10
    "quantum",    # 11
]

def clean_word(word):
    # Normalize to lowercase and strip non-alphanumeric ASCII
    cleaned = []
    for ch in word.lower():
        if ch.isalnum() and ord(ch) < 128:
            cleaned.append(ch)
    return "".join(cleaned)

def extract_traces(input_path, output_path, min_run_length=2):
    """
    Ingests any massive raw text file, filters out all non-vocabulary words,
    and joins contiguous runs of vocabulary words into concentrated training sentences.
    """
    if not os.path.exists(input_path):
        print(f"Error: Raw input file '{input_path}' not found.")
        return False

    print(f"[Extractor] Ingesting raw source file: '{input_path}'")
    with open(input_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    # Split into raw words
    raw_words = content.split()
    total_raw_count = len(raw_words)
    print(f"  ├─ Total raw words scanned: {total_raw_count}")

    extracted_runs = []
    current_run = []

    for word in raw_words:
        cleaned = clean_word(word)
        if cleaned in VOCABULARY:
            current_run.append(cleaned)
        else:
            # Vocabulary boundary hit - commit active run if it meets min length
            if len(current_run) >= min_run_length:
                extracted_runs.append(" ".join(current_run))
            current_run = []

    # Commit last active run
    if len(current_run) >= min_run_length:
        extracted_runs.append(" ".join(current_run))

    # Join extracted runs with periods/newlines to create a structured corpus file
    corpus_text = "\n".join(extracted_runs)
    total_extracted_words = sum(len(run.split()) for run in extracted_runs)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(corpus_text)

    print(f"  ├─ High-density runs extracted: {len(extracted_runs)}")
    print(f"  ├─ Extracted vocabulary tokens: {total_extracted_words}")
    print(f"  └─ Extraction ratio: {(total_extracted_words / max(1, total_raw_count)) * 100.0:.3f}% of source")
    print(f"👉 Concentrated corpus successfully synthesized and saved to '{output_path}'!\n")
    return True

def generate_synthetic_raw_feed(path, size_words=10000):
    """
    Generates a massive, realistic raw conversational feed containing random English
    text interspersed with valid UOR-R4 transition runs to simulate a messy corpus.
    """
    import random
    filler_words = [
        "the", "a", "of", "and", "to", "in", "is", "you", "that", "it", "he", "was",
        "for", "on", "are", "as", "with", "his", "they", "i", "at", "be", "this", "have",
        "from", "or", "one", "had", "by", "word", "but", "not", "what", "all", "were",
        "we", "when", "your", "can", "said", "there", "use", "an", "each", "which", "she"
    ]
    
    print(f"[Simulator] Synthesizing raw offline feed of {size_words} words...")
    words = []
    i = 0
    while i < size_words:
        # 80% chance of random filler text, 20% chance of inserting a concentrated UOR transition run
        if random.random() > 0.20:
            words.append(random.choice(filler_words))
            i += 1
        else:
            run_len = random.randint(2, 5)
            run = [random.choice(VOCABULARY) for _ in range(run_len)]
            words.extend(run)
            i += run_len
            
    with open(path, "w", encoding="utf-8") as f:
        f.write(" ".join(words))
    print(f"  └─ Synthetic raw feed saved to '{path}'")

def main():
    print("=====================================================================")
    print("        UOR-R4 STANDALONE TEACHER-TRACE CORPUS EXTRACTOR            ")
    print("=====================================================================")
    
    if len(sys.argv) < 3:
        print("Usage: python3 uor_teacher_extractor.py <input_raw_path> <output_corpus_path> [min_run_length]")
        print("\nNotice: Since no raw files were passed, running test simulation...")
        
        raw_test = "simulated_raw_internet_feed.txt"
        corpus_out = "uor_high_density_corpus.txt"
        
        generate_synthetic_raw_feed(raw_test, 15000)
        extract_traces(raw_test, corpus_out, min_run_length=2)
        
        print("=====================================================================")
        print("🎉 SIMULATION RUN COMPLETE!")
        print(f"You can now load '{corpus_out}' straight into r4chat-v3.py using:")
        print(f"  uor-chatbot> /train_file {corpus_out}")
        print("=====================================================================")
        return

    input_raw = sys.argv[1]
    output_corpus = sys.argv[2]
    min_len = int(sys.argv[3]) if len(sys.argv) > 3 else 2
    
    extract_traces(input_raw, output_corpus, min_run_length=min_len)

if __name__ == "__main__":
    main()
