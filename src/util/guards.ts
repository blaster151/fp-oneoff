// src/util/guards.ts
export function must<T>(x: T | undefined | null, msg = "Undefined"): T {
  if (x === undefined || x === null) throw new Error(msg);
  return x;
}

export function idx<T>(arr: T[], i: number, msg = "Index out of range"): T {
  if (i < 0 || i >= arr.length) throw new Error(msg);
  return arr[i]!; // Safe after bounds check
}