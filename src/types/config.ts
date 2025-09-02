// config.ts
// Central config & feature flags (read once at module init).
// Use REL_IMPL=naive|bit to choose relation backend; default = 'bit'.

export type RelImpl = 'naive' | 'bit';

const env = (typeof process !== 'undefined' && process.env) ? process.env : ({} as any);
export const REL_IMPL: RelImpl = (env.REL_IMPL === 'naive' || env.REL_IMPL === 'bit') ? env.REL_IMPL : 'bit';

// Additional feature flags for future use
export type WitnessLevel = 'minimal' | 'detailed' | 'verbose';
export const WITNESS_LEVEL: WitnessLevel = (env.WITNESS_LEVEL as WitnessLevel) || 'detailed';

export type PerformanceMode = 'development' | 'production';
export const PERFORMANCE_MODE: PerformanceMode = (env.NODE_ENV === 'production') ? 'production' : 'development';

// Debug flags
export const DEBUG_WITNESSES = env.DEBUG_WITNESSES === 'true';
export const DEBUG_PERFORMANCE = env.DEBUG_PERFORMANCE === 'true';

// Configuration summary
export function getConfig() {
  return {
    REL_IMPL,
    WITNESS_LEVEL,
    PERFORMANCE_MODE,
    DEBUG_WITNESSES,
    DEBUG_PERFORMANCE
  };
}