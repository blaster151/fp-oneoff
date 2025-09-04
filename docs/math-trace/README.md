# Math Traceability System

This directory contains mathematical traceability documentation that links mathematical concepts from papers and textbooks to their implementations in the codebase.

## Purpose

The math traceability system serves several purposes:

1. **Documentation**: Provides clear links between mathematical definitions and their code implementations
2. **Verification**: Ensures that mathematical concepts are correctly implemented
3. **Maintenance**: Helps maintain consistency between documentation and code
4. **CI/CD**: The trace linter can be run in CI to catch inconsistencies early

## File Structure

Each trace entry consists of two files:

- **`.md`**: Human-readable documentation with LaTeX formulas and explanations
- **`.json`**: Machine-readable metadata for automated processing

## Current Trace Entries

- **[REL-GRP-HOMS-P12-13]**: Group homomorphisms & Hom-category laws
- **[REL-GRP-ISO-AUTO-P14]**: Group isomorphisms & automorphisms

## Usage

### Running the Trace Linter

```bash
npm run check:trace
```

This will verify that all files referenced in trace documents actually exist in the codebase.

### Adding New Trace Entries

1. Create a `.md` file with the mathematical content
2. Create a corresponding `.json` file with metadata
3. Run `npm run check:trace` to verify consistency

### Trace Entry Format

Each trace entry should include:

- **ID**: Unique identifier for the trace entry
- **Source**: Reference to the source document and pages
- **Core statement**: Key mathematical definitions in LaTeX
- **Code links**: Paths to relevant source code files
- **Tests**: Paths to relevant test files
- **Design implications**: What this enables or unlocks
- **Trace keys**: Relationships to other trace entries

## Integration with CI/CD

The trace linter can be integrated into CI/CD pipelines to ensure that:

- All referenced code files exist
- All referenced test files exist
- Mathematical concepts remain properly implemented

This helps maintain the integrity of the mathematical foundations of the codebase.