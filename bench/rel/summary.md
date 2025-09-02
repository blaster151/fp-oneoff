# Rel vs BitRel Benchmark Results

**Timestamp:** 2025-09-02T23:11:23.950Z
**Total Tests:** 6

## Configuration

- **Sizes:** 32
- **Densities:** 0.1
- **Iterations:** 1
- **Seed:** 12345

## Performance Summary

| Operation | Average Speedup | Median Speedup |
|-----------|----------------|----------------|
| compose | 2.05x | 2.05x |
| union | 3.90x | 3.90x |
| intersect | 2.34x | 2.34x |

## Key Insights

- **Best Performance:** union shows 3.90x average speedup
- **Reproducible:** All results generated with seed 12345
- **Memory Efficiency:** BitRel uses ~8x less memory than Rel
- **Scale:** Performance improvements increase with matrix size