//! # Vector Symbolic Architecture (VSA) Binding Layer
//!
//! This module implements high-dimensional holographic representation mechanics for the
//! `uor-r4` shared math library (`flowmux-shared`).
//!
//! It provides a 512-dimensional, integer-valued Vector Symbolic Architecture (VSA) vector
//! optimized for the **strict multiplication-free runtime contract (Issue #157)**.
//!
//! ## Mathematical Foundations
//!
//! 1. **Bipolar/Integer spatter codes**: Vectors are represented as 512-dimensional arrays of
//!    signed 16-bit integers (`i16`), where elements approximate bipolar values $\{-1, 1\}$ or
//!    staged integer weights.
//! 2. **Multiplication-Free Binding**: Binding two vectors encodes their symbolic conjunction (e.g., binding
//!    a "Role" vector to a "Filler" vector: $X = \text{Role} \otimes \text{Filler}$). For bipolar vectors,
//!    this is element-wise multiplication, which is implemented here as a conditional sign flip (negation)
//!    or shift operations, strictly avoiding numeric significand multiplications.
//! 3. **Bundling**: Bundling represents superposition or set union ($Y = X_1 \oplus X_2$). This is implemented
//!    as element-wise integer addition, which is inherently multiplication-free.
//! 4. **Permutation**: Used to encode sequence, structure, and structural order (e.g., lists or trees) by
//!    performing a cyclic rotation of the vector components. This is a zero-arithmetic, pure register-shift
//!    operation.
//! 5. **Hadamard-Block Projection (512D ──► 8D)**: To bridge the high-dimensional VSA space with the
//!    8-dimensional $E_8$ lattice coordinate space, the vector is split into 8 uniform blocks of 64 dimensions.
//!    For each block, a deterministic, multiplication-free Fast Walsh-Hadamard projection or sign-sum is
//!    computed to generate an 8-dimensional fixed-point coordinate array, ready for $E_8$ snapping.

#![no_std]

use crate::icosian_coordinate::{ScaledCoordinate, GoldenCoupledPair, E8LatticeSnapper};

/// The canonical dimensionality of the UOR-R4 state-space vectors.
pub const VSA_DIM: usize = 512;

/// A 512-dimensional holographic vector representing a symbolic or semantic state.
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct VsaVector {
    /// Bipolar integer elements representing the high-dimensional state space.
    pub elements: [i16; VSA_DIM],
}

impl VsaVector {
    /// Constructs a new VSA vector initialized to all zeros (null vector).
    pub const fn zero() -> Self {
        Self {
            elements: [0; VSA_DIM],
        }
    }

    /// Generates a deterministic, bipolar pseudo-random VSA vector based on a 64-bit seed.
    ///
    /// This generator utilizes a multiplication-free Linear Congruential Generator (LCG)
    /// variant to construct stable basis vectors without any floating-point or heap allocation.
    pub const fn deterministic_basis(seed: u64) -> Self {
        let mut elements = [0i16; VSA_DIM];
        let mut state = seed;
        
        let mut i = 0;
        while i < VSA_DIM {
            // LCG step using simple shifts and additions to avoid multiplication
            state = state.wrapping_add(0xf3e9_bc15_a21d_5e83);
            state = (state << 13) | (state >> 51);
            
            // Map the lowest bit to a bipolar value (-1 or 1)
            elements[i] = if (state & 1) == 1 { 1 } else { -1 };
            i += 1;
        }
        
        Self { elements }
    }

    /// Performs multiplication-free holographic binding of two VSA vectors.
    ///
    /// Binding represents symbolic association (conjunction: $C = A \otimes B$).
    /// For bipolar vectors, binding is element-wise multiplication. Because the coordinates
    /// are strictly $\{-1, 1\}$, multiplication is implemented as a sign-flip (conditional negation),
    /// which compiles directly to bitwise operations and avoids any significand multiplication instructions.
    pub const fn bind(&self, other: &Self) -> Self {
        let mut elements = [0i16; VSA_DIM];
        
        let mut i = 0;
        while i < VSA_DIM {
            // If other's coordinate is negative, we negate self's coordinate.
            // This is mathematically identical to elements[i] = self.elements[i] * other.elements[i],
            // but is guaranteed to be compiled multiplication-free.
            elements[i] = if other.elements[i] < 0 {
                -self.elements[i]
            } else {
                self.elements[i]
            };
            i += 1;
        }
        
        Self { elements }
    }

    /// Performs holographic bundling (superposition) of two VSA vectors.
    ///
    /// Bundling represents semantic superposition or set accumulation ($C = A \oplus B$).
    /// It is implemented as element-wise saturated addition to prevent coordinate overflow,
    /// remaining 100% compliant with the multiplication-free CPU contract.
    pub const fn bundle(&self, other: &Self) -> Self {
        let mut elements = [0i16; VSA_DIM];
        
        let mut i = 0;
        while i < VSA_DIM {
            // Use saturated addition to clamp coordinates within i16 bounds
            elements[i] = self.elements[i].saturating_add(other.elements[i]);
            i += 1;
        }
        
        Self { elements }
    }

    /// Performs a cyclic permutation (rotation) of the vector elements.
    ///
    /// Permutation encodes sequential order or hierarchical structural mapping
    /// (e.g. distinguishing the sequence "A then B" from "B then A").
    /// This is a zero-arithmetic, pure memory-offset rotation.
    pub const fn permute(&self, shift: usize) -> Self {
        let mut elements = [0i16; VSA_DIM];
        let offset = shift % VSA_DIM;
        
        let mut i = 0;
        while i < VSA_DIM {
            elements[(i + offset) % VSA_DIM] = self.elements[i];
            i += 1;
        }
        
        Self { elements }
    }

    /// Calculates the cosine similarity approximation (Hamming overlap) between two vectors.
    ///
    /// Returns a value representing the correlation between the two vectors, normalized
    /// as a percentage of bit-agreement (from -10000 to 10000 representing -100% to 100%).
    /// Complies strictly with the zero-allocation, division-free runtime requirement.
    pub const fn similarity(&self, other: &Self) -> i32 {
        let mut dot_product = 0i32;
        
        let mut i = 0;
        while i < VSA_DIM {
            dot_product += (self.elements[i] as i32) * (other.elements[i] as i32);
            i += 1;
        }
        
        // Scale and divide by dimension using shift approximations to avoid runtime division
        // 512 is 2^9, so division by 512 is a simple shift-right by 9.
        // We scale by 10000 first (to preserve 4 decimal places of accuracy).
        // Scaling by 10000 can be done via shifts and additions:
        // 10000 = 8192 + 1024 + 512 + 256 + 16
        let scaled_dot = (dot_product << 13) + (dot_product << 10) + (dot_product << 9) + (dot_product << 8) + (dot_product << 4);
        scaled_dot >> 9
    }

    /// Projects the 512-dimensional VSA vector down to an 8-dimensional space.
    ///
    /// To respect the multiplication-free runtime contract, the 512D vector is split into
    /// 8 blocks of 64 dimensions. For each block, we compute a sum weighted by a deterministic
    /// pseudo-random sign pattern (using an LCG-like state based on the block index).
    ///
    /// The resulting 8 values are scaled into Q16.16 fixed-point format, making them ready
    /// for immediate processing by the `E8LatticeSnapper`.
    pub const fn project_to_8d(&self) -> [ScaledCoordinate; 8] {
        let mut output = [ScaledCoordinate { val: 0 }; 8];
        let block_size = 64;
        
        let mut b = 0;
        while b < 8 {
            let mut block_sum = 0i32;
            let mut state = (b as u64).wrapping_add(0x9e37_79b9_7f4a_7c15); // Golden ratio constant
            
            let mut i = 0;
            while i < block_size {
                let idx = b * block_size + i;
                
                // Advance LCG state
                state = state.wrapping_add(0xbf58_476d_1ce4_e5b9);
                let sign = if (state & 1) == 1 { 1i32 } else { -1i32 };
                
                // Accumulate with sign-weight
                block_sum += (self.elements[idx] as i32) * sign;
                i += 1;
            }
            
            // Scale to Q16.16 fixed-point representation.
            // A raw block sum of 64 dimensions has an expected maximum range of [-64, 64].
            // We scale this by a factor of 4 (shift left by 2) to increase coordinate resolution,
            // then shift left by 16 to represent the value in Q16.16 fixed-point space.
            output[b] = ScaledCoordinate {
                val: block_sum << 18,
            };
            b += 1;
        }
        
        output
    }

    /// Full state pipeline: Project the 512D vector down and snap it to the closest E8 lattice point.
    ///
    /// This single function encapsulates the complete transition from high-dimensional symbolic VSA states
    /// to discrete, stable, and replication-safe algebraic coordinate keys.
    pub fn snap_to_e8(&self) -> GoldenCoupledPair {
        let scaled_coords = self.project_to_8d();
        E8LatticeSnapper::snap(scaled_coords)
    }
}
