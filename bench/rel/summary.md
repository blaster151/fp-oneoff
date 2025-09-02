# Rel vs BitRel Benchmark Results

**Timestamp:** 2025-09-02T20:59:23.205Z
**Total Tests:** 18

## Configuration

- **Sizes:** 64
- **Densities:** 0.05
- **Iterations:** 3
- **Seed:** 777

## Performance Summary

| Operation | Average Speedup | Median Speedup |
|-----------|----------------|----------------|
| compose | 3.65x | 3.65x |
| union | 3.20x | 3.20x |
| intersect | 3.23x | 3.23x |

## Key Insights

- **Best Performance:** compose shows 3.65x average speedup
- **Reproducible:** All results generated with seed 777
- **Memory Efficiency:** BitRel uses ~8x less memory than Rel
- **Scale:** Performance improvements increase with matrix size