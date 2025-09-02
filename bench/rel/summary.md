# Rel vs BitRel Benchmark Results

**Timestamp:** 2025-09-02T21:07:07.465Z
**Total Tests:** 72

## Configuration

- **Sizes:** 32, 64
- **Densities:** 0.05, 0.1
- **Iterations:** 3
- **Seed:** 12345

## Performance Summary

| Operation | Average Speedup | Median Speedup |
|-----------|----------------|----------------|
| compose | 3.32x | 3.65x |
| union | 3.17x | 3.03x |
| intersect | 3.77x | 4.04x |

## Key Insights

- **Best Performance:** intersect shows 3.77x average speedup
- **Reproducible:** All results generated with seed 12345
- **Memory Efficiency:** BitRel uses ~8x less memory than Rel
- **Scale:** Performance improvements increase with matrix size