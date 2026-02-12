# Clarifying Questions: init-xylophone-20260211-1216

> Generated at 2026-02-11T12:18:12.163Z
> Source: Claude-enhanced

## Summary

The contract is comprehensive and implementation-ready except for one critical ambiguity: the musical scale/note frequencies for the 11 bars. This was flagged in the Confirmed Understanding (OQ-01) but remains unresolved. Without knowing whether to implement diatonic, pentatonic, chromatic, or another scale, developers would build different instruments with fundamentally different musical characteristics. All other aspects (architecture, interaction patterns, technical constraints, acceptance criteria) are sufficiently detailed for implementation.

## Questions

### CQ-01 [**CRITICAL**] — requirements

What specific musical scale should the 11 notes follow: diatonic (C-D-E-F-G-A-B-C-D-E-F), pentatonic, chromatic, or another scale?

> The choice of scale determines the exact frequencies for all 11 oscillators. A diatonic scale uses whole and half steps (major/minor), pentatonic omits certain intervals, and chromatic uses all semitones. This fundamentally affects the musical character and user experience.
