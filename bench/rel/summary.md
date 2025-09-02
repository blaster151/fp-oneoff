# Rel vs BitRel Benchmark Results

**Timestamp:** 2025-09-02T20:51:04.675Z
**Total Tests:** 18

## Configuration

- **Sizes:** 32
- **Densities:** 0.1
- **Iterations:** 3
- **Seed:** 999

## Performance Summary

| Operation | Average Speedup | Median Speedup |
|-----------|----------------|----------------|
| compose | 4.52x | 4.52x |
| union | 3.58x | 3.58x |
| intersect | 3.85x | 3.85x |

## Key Insights

- **Best Performance:** compose shows 4.52x average speedup
- **Reproducible:** All results generated with seed 999
- **Memory Efficiency:** BitRel uses ~8x less memory than Rel
- **Scale:** Performance improvements increase with matrix size