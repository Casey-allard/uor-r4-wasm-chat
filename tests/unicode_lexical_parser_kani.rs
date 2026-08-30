//! # Kani Formal Verification Harness for Unicode Lexical Parser
//!
//! This module provides the formal mathematical verification harnesses used to prove
//! the absolute memory and panic safety of the `UnicodeLexicalParser` under any
//! arbitrary input byte stream.
//!
//! It uses Kani bounded model checking to formally verify that:
//! 1. No out-of-bounds index panics can occur during slice reading or token buffer writing.
//! 2. Seed generation (`compute_vsa_seed`) is entirely free of arithmetic overflow panics under symbolic input states.
//! 3. Case-folding normalization is structurally sound and cannot panic on any UTF-8 bounds.

#![cfg(kani)]
#![no_std]

// =====================================================================
// 1. DUPLICATED STRUCTURES FOR STANDALONE KANI ANALYSIS
// =====================================================================

pub const MAX_RUN_SIZE: usize = 128;
pub const MAX_TOKENS: usize = 8;

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub enum ParserError {
    InputTooLong,
    InvalidVocabulary,
    EmptyInput,
    TokenLimitExceeded,
}

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct LexicalToken {
    pub len: usize,
    pub bytes: [u8; 32],
}

impl LexicalToken {
    pub const fn new() -> Self {
        Self {
            len: 0,
            bytes: [0u8; 32],
        }
    }

    /// Shift-Add-Xor Hash for multiplier-free seed generation.
    /// Complies strictly with the multiplication-free AI inference contract.
    pub const fn compute_vsa_seed(&self) -> u64 {
        let mut hash: u64 = 0xcbf2_9ce4_8422_2325; // FNV-1a 64-bit offset basis
        let mut i = 0;
        while i < self.len {
            let byte = self.bytes[i] as u64;
            let xor_val = hash ^ byte;
            hash = xor_val.wrapping_add(xor_val << 5); // Shift-add hashing
            i += 1;
        }
        hash
    }
}

pub struct UnicodeLexicalParser;

impl UnicodeLexicalParser {
    /// Ingests a raw string slice, normalizes its contents, validates characters against
    /// a safe-vocabulary set, and splits it into discrete lexical runs.
    pub fn parse_runs(input: &str) -> Result<([LexicalToken; MAX_TOKENS], usize), ParserError> {
        let input_bytes = input.as_bytes();
        let input_len = input_bytes.len();

        if input_len == 0 {
            return Err(ParserError::EmptyInput);
        }

        if input_len > MAX_RUN_SIZE {
            return Err(ParserError::InputTooLong);
        }

        let mut tokens = [LexicalToken::new(); MAX_TOKENS];
        let mut token_count = 0;

        let mut current_token = LexicalToken::new();
        let mut in_token = false;

        let mut i = 0;
        while i < input_len {
            let c = input_bytes[i];

            // Fail-closed vocabulary enforcement: Allow only visible ASCII and space [32, 126]
            if c < 32 || c > 126 {
                return Err(ParserError::InvalidVocabulary);
            }

            if c == b' ' {
                if in_token {
                    // Commit current token to the stack list
                    if token_count >= MAX_TOKENS {
                        return Err(ParserError::TokenLimitExceeded);
                    }
                    tokens[token_count] = current_token;
                    token_count += 1;
                    
                    // Reset current token buffer
                    current_token = LexicalToken::new();
                    in_token = false;
                }
            } else {
                in_token = true;
                if current_token.len >= 32 {
                    // Token exceeds individual 32-byte allocation limit
                    return Err(ParserError::InputTooLong);
                }

                // In-place normalization: Lowercase ASCII letters dynamically on the stack
                let normalized_byte = if c >= b'A' && c <= b'Z' {
                    c + 32
                } else {
                    c
                };

                // CRITICAL SAFETY CHECK: Verify that index is within 0..32 boundaries
                // (Proven safe under Kani bounded verification checks)
                current_token.bytes[current_token.len] = normalized_byte;
                current_token.len += 1;
            }
            i += 1;
        }

        // Commit final token if input string did not end with a space
        if in_token {
            if token_count >= MAX_TOKENS {
                return Err(ParserError::TokenLimitExceeded);
            }
            tokens[token_count] = current_token;
            token_count += 1;
        }

        if token_count == 0 {
            return Err(ParserError::EmptyInput);
        }

        Ok((tokens, token_count))
    }
}

// =====================================================================
// 2. KANI FORMAL VERIFICATION PROOFS
// =====================================================================

/// Proves that `UnicodeLexicalParser::parse_runs` is entirely panic-free, memory-safe,
/// and immune to out-of-bounds array access under any arbitrary string of length up to 135.
#[kani::proof]
pub fn proof_parse_runs_safety_invariant() {
    // 1. Allocate a symbolic raw buffer of 135 bytes (exceeds MAX_RUN_SIZE = 128)
    let raw_len: usize = kani::any();
    kani::assume(raw_len <= 135);

    let mut raw_buffer = [0u8; 135];
    for i in 0..135 {
        raw_buffer[i] = kani::any();
    }

    // 2. Map the active prefix to a safe UTF-8 string slice
    // Since parse_runs only permits valid ASCII visible characters [32..126],
    // mapping raw bytes to &str is verified.
    if let Ok(input_str) = core::str::from_utf8(&raw_buffer[..raw_len]) {
        // 3. Call the lexical parser
        let result = UnicodeLexicalParser::parse_runs(input_str);

        // 4. Verify post-conditions on successful execution
        if let Ok((tokens, count)) = result {
            // Verify token count limits
            assert!(count <= MAX_TOKENS);
            assert!(count > 0);

            // Verify each individual token matches structural safety invariants
            for i in 0..count {
                let token = tokens[i];
                assert!(token.len <= 32);
                assert!(token.len > 0);

                // Verify all characters are correctly folded to lowercase ASCII ranges [32, 126]
                for j in 0..token.len {
                    let c = token.bytes[j];
                    assert!(c >= 32 && c <= 126);
                    // Proves uppercase characters are completely absent after normalization
                    assert!(c < b'A' || c > b'Z');
                }
            }
        }
    }
}

/// Proves that the non-linear Shift-Add-Xor hash seed generator (`compute_vsa_seed`)
/// is entirely free of division errors, index panics, or unhandled overflows
/// under any arbitrary symbolic token state.
#[kani::proof]
pub fn proof_token_seed_generation_safety() {
    // 1. Instantiate a token with arbitrary symbolic properties
    let mut token = LexicalToken::new();
    
    // Symbolic len is assumed to be within valid physical limits of the struct allocation
    let length: usize = kani::any();
    kani::assume(length <= 32);
    token.len = length;

    // Fill buffer with completely unconstrained symbolic bytes
    for i in 0..32 {
        token.bytes[i] = kani::any();
    }

    // 2. Execute seed generation loop
    // Wrapping arithmetic handles overflow constraints, which we prove to be stable.
    let seed = token.compute_vsa_seed();

    // 3. Prove that seed is mathematically initialized
    if token.len == 0 {
        assert_eq!(seed, 0xcbf2_9ce4_8422_2325);
    }
}
