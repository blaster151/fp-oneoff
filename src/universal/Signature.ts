export type OpSym = { name: string; arity: number };

export type Signature = {
  /** Operation symbols with fixed arity. Names must be unique. */
  ops: OpSym[];
};

/** Utility: fetch op by name, throw if missing. */
export function opOf(sig: Signature, name: string): OpSym {
  const op = sig.ops.find(o => o.name === name);
  if (!op) throw new Error(`Op not in signature: ${name}`);
  return op;
}