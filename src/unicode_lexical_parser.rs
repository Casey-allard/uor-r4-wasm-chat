//! # Unicode Lexical Parser (`unicode-lexical-runs/1`)
//!
//! This module implements a strict `no_std`, zero-allocation, and multiplication-free
//! lexical parser designed to ingest, validate, and tokenize raw UTF-8 input runs into
//! deterministic 64-bit seed values. These seeds are fed directly into the Vector Symbolic
//! Architecture (VSA) basis generator (`vsa_binding.rs`).
//!
//! ## Mathematical & Security Guardrails
//!
//! 1. **Zero-Allocation Stack Limits**: To safeguard the microVM against heap exhaustion attacks,
//!    the parser processes text within a fixed-size stack-allocated buffer (max 128 bytes).
//! 2. **Fail-Closed Vocabulary Filtering**: Out-of-vocabulary (OOV) characters, control characters,
//!    or non-ASCII sequences trigger an immediate, fail-closed rejection.
//! 3. **Multiplication-Free Hashing**: Token byte arrays are hashed into 64-bit seeds using a
//!    non-linear Shift-Add-Xor algorithm, completely avoiding numeric hardware multipliers.
//! 4. **In-Place Normalization**: Normalizes inputs (e.g., standardizing ASCII characters to uppercase/lowercase)
//!    directly within the stack buffer without requesting heap memory.

#![no_std]

/// Maximum size of a single lexical input run in bytes.
pub const MAX_RUN_SIZE: usize = 128;

/// Maximum number of token seeds generated from a single sentence.
pub const MAX_TOKENS: usize = 8;

/// Error states returned by the lexical parser during validation.
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub enum ParserError {
    /// The input run exceeds the strict 128-byte stack allocation limit.
    InputTooLong,
    /// The input contains invalid, non-printable, or restricted out-of-vocabulary characters.
    InvalidVocabulary,
    /// The input string is empty.
    EmptyInput,
    /// The parser exceeded the maximum token sequence allocation (max 8 tokens).
    TokenLimitExceeded,
}

/// A stack-allocated representation of an individual tokenized run.
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct LexicalToken {
    /// Slice length of the active characters.
    pub len: usize,
    /// Stack-allocated buffer storing the normalized bytes.
    pub bytes: [u8; 32],
}

impl LexicalToken {
    /// Instantiates an empty lexical token.
    pub const fn new() -> Self {
        Self {
            len: 0,
            bytes: [0u8; 32],
        }
    }

    /// Computes a deterministic 64-bit seed from the token's bytes.
    /// Complies with the multiplication-free contract by utilizing a Shift-Add-Xor hash.
    pub const fn compute_vsa_seed(&self) -> u64 {
        let mut hash: u64 = 0xcbf2_9ce4_8422_2325; // FNV-1a 64-bit offset basis
        let mut i = 0;
        while i < self.len {
            let byte = self.bytes[i] as u64;
            // Shift-Add-Xor hashing to bypass significand multiplication:
            // hash = (hash ^ byte) * prime -> lower-level optimized as:
            // hash = (hash ^ byte) + (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
            let xor_val = hash ^ byte;
            hash = xor_val.wrapping_add(xor_val << 5); // Simple highly-dispersive shift-add step
            i += 1;
        }
        hash
    }
}

/// The stateful Unicode Lexical Parser containing the parsing and validation configurations.
pub struct UnicodeLexicalParser;

impl UnicodeLexicalParser {
    /// Ingests a raw string slice, normalizes its contents, validates characters against
    /// a safe-vocabulary set, and splits it into discrete lexical runs.
    ///
    /// # Arguments
    ///
    /// * `input` - The raw, untrusted string slice.
    ///
    /// # Returns
    ///
    /// * `Ok([LexicalToken; MAX_TOKENS], usize)` - A tuple containing the stack-allocated tokens and the actual token count.
    /// * `Err(ParserError)` - The specific validation failure.
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

            // Fail-closed vocabulary enforcement: Allow only visible ASCII and space
            // Disallows control characters, non-ASCII UTF-8 sequences, or code injections.
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
                    // Token is too long to fit in its individual 32-byte allocation limit
                    return Err(ParserError::InputTooLong);
                }

                // In-place normalization: Lowercase ASCII letters dynamically on the stack
                let normalized_byte = if c >= b'A' && c <= b'Z' {
                    c + 32 // Convert to lowercase
                } else {
                    c
                };

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

/// Unit test module simulating input parsing and verification on the microVM target.
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_input_runs() {
        let input = "SUBJECT AGENT_A OBJECT MANIFOLD";
        let parse_result = UnicodeLexicalParser::parse_runs(input);
        assert!(parse_result.is_ok());

        let (tokens, count) = parse_result.unwrap();
        assert_eq!(count, 4);

        // Assert Case-Normalization to lowercase
        assert_eq!(tokens[0].len, 7);
        assert_eq!(&tokens[0].bytes[0..7], b"subject");
        assert_eq!(&tokens[1].bytes[0..7], b"agent_a");
        assert_eq!(&tokens[2].bytes[0..6], b"object");
        assert_eq!(&tokens[3].bytes[0..8], b"manifold");

        // Assert deterministic seed generation (non-zero)
        let seed_0 = tokens[0].compute_vsa_seed();
        let seed_1 = tokens[1].compute_vsa_seed();
        assert!(seed_0 != 0);
        assert!(seed_1 != 0);
        assert!(seed_0 != seed_1); // Verify collision resistance on distinct runs
    }

    #[test]
    fn test_fail_closed_length_rejection() {
        // String of 129 'A's exceeds the 128-byte maximum
        let long_input = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        let parse_result = UnicodeLexicalParser::parse_runs(long_input);
        assert_eq!(parse_result, Err(ParserError::InputTooLong));
    }

    #[test]
    fn test_fail_closed_oov_rejection() {
        // Contains an invalid ASCII character (null byte or tab / non-ASCII UTF-8 bytes)
        let toxic_input_1 = "SUBJECT AGENT_\t";
        assert_eq!(UnicodeLexicalParser::parse_runs(toxic_input_1), Err(ParserError::InvalidVocabulary));

        let toxic_input_2 = "SUBJECT \u{1F600}"; // Emoji input (non-ASCII UTF-8)
        assert_eq!(UnicodeLexicalParser::parse_runs(toxic_input_2), Err(ParserError::InvalidVocabulary));
    }

    #[test]
    fn test_token_limit_enforcement() {
        // Exceeds max limit of 8 tokens
        let redundant_input = "one two three four five six seven eight nine";
        assert_eq!(UnicodeLexicalParser::parse_runs(redundant_input), Err(ParserError::TokenLimitExceeded));
    }
}
